/* Welcome + setup checklist (/welcome/). After Stripe: ?s=<checkout session> → the Worker returns a private token
   and the URL becomes ?t=<token> (bookmarkable, also in Jeremy's alert). Each step autosaves to the Worker (KV);
   "Save and continue" marks it done → CrowdSync note. Only the sections for the jobs they bought are shown. */
(function () {
  "use strict";
  var C = window.BORIS_SITE || {};
  var API = C.CHECKOUT_API;
  var $ = function (id) { return document.getElementById(id); };
  var NAMES = { receptionist: "Receptionist", intake: "Intake", case: "Case Manager", marketing: "Marketing", ads: "Ads Manager", full: "Full Team" };
  var q = new URLSearchParams(location.search);
  var token = q.get("t"), state = null;

  function show(id) { ["welLoad", "welNone", "welMain"].forEach(function (x) { $(x).hidden = x !== id; }); }
  function get(path) { return fetch(API + path).then(function (r) { return r.json().then(function (d) { d.status = r.status; return d; }); }); }
  function post(body) {
    return fetch(API + "/onboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); });
  }

  /* ---------------------------------------------------------------- load */
  var tries = 0;
  function bySession(s) {
    get("/session?s=" + encodeURIComponent(s)).then(function (d) {
      if (d.ok && d.token) {
        token = d.token;
        history.replaceState(null, "", location.pathname + "?t=" + encodeURIComponent(token));
        return byToken();
      }
      // Stripe can take a moment to mark it paid
      if (tries++ < 8) { show("welNone"); $("welWait").hidden = false; return setTimeout(function () { bySession(s); }, 3000); }
      show("welNone"); $("welWait").hidden = true;
    }).catch(function () { show("welNone"); });
  }
  function byToken() {
    return get("/onboard?t=" + encodeURIComponent(token)).then(function (d) {
      if (!d.ok) return show("welNone");
      state = d;
      render();
    }).catch(function () { show("welNone"); });
  }
  if (!API) show("welNone");
  else if (token) byToken();
  else if (q.get("s")) bySession(q.get("s"));
  else show("welNone");

  /* ---------------------------------------------------------------- render */
  var steps = [].slice.call(document.querySelectorAll(".step"));
  function render() {
    show("welMain");
    $("welFirm").textContent = state.firm || "";
    $("welJobs").textContent = state.jobs.map(function (j) { return NAMES[j] || j; }).join(" + ");
    $("welUrl").value = location.origin + location.pathname + "?t=" + token;
    var n = 0;
    steps.forEach(function (sec) {
      var id = sec.getAttribute("data-step");
      var on = state.steps_needed.indexOf(id) >= 0;
      sec.hidden = !on;
      if (!on) return;
      sec.querySelector(".step__n").textContent = ++n;
      fill(sec, (state.steps[id] || {}).data || {});
    });
    status();
    var first = steps.filter(function (s) { return !s.hidden && !done(s); })[0];
    if (first) open(first, false);
  }
  function done(sec) { var s = state.steps[sec.getAttribute("data-step")]; return !!(s && s.complete); }
  function status() {
    var vis = steps.filter(function (s) { return !s.hidden; }), req = vis.filter(function (s) { return s.getAttribute("data-step") !== "kickoff"; });
    vis.forEach(function (sec) {
      var s = state.steps[sec.getAttribute("data-step")];
      var el = sec.querySelector(".step__s");
      el.className = "step__s" + (s && s.complete ? " is-done" : s ? " is-saved" : "");
      el.textContent = s && s.complete ? "Done" : s ? "Saved" : "To do";
    });
    var k = req.filter(done).length;
    $("welProgT").textContent = k + " of " + req.length + " done";
    $("welProgB").style.width = Math.round((100 * k) / Math.max(1, req.length)) + "%";
    $("welDone").hidden = !state.done;
  }
  function open(sec, focus) {
    steps.forEach(function (s) {
      var on = s === sec;
      s.querySelector(".step__body").hidden = !on;
      s.querySelector(".step__h").setAttribute("aria-expanded", on ? "true" : "false");
      s.classList.toggle("is-open", on);
    });
    if (sec && sec.id === "step-kickoff") embedBooking();
    if (focus) {
      sec.scrollIntoView({ behavior: "smooth", block: "start" });
      var f = sec.querySelector("input:not([type=hidden]), textarea, select");
      if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 350);
    }
  }
  steps.forEach(function (sec) {
    sec.querySelector(".step__h").addEventListener("click", function () {
      var isOpen = sec.classList.contains("is-open");
      if (isOpen) { sec.querySelector(".step__body").hidden = true; sec.classList.remove("is-open"); sec.querySelector(".step__h").setAttribute("aria-expanded", "false"); }
      else open(sec, false);
    });
  });

  /* ---------------------------------------------------------------- form data */
  function read(form) {
    var d = {};
    [].forEach.call(form.elements, function (el) {
      if (!el.name || el.type === "submit") return;
      if (el.type === "checkbox") { d[el.name] = d[el.name] || []; if (el.checked) d[el.name].push(el.value); }
      else if (el.type === "radio") { if (el.checked) d[el.name] = el.value; else if (!(el.name in d)) d[el.name] = ""; }
      else d[el.name] = el.value.trim();
    });
    return d;
  }
  function fill(sec, d) {
    [].forEach.call(sec.querySelector("form").elements, function (el) {
      if (!el.name || !(el.name in d) || el.type === "submit") return;
      var v = d[el.name];
      if (el.type === "checkbox") el.checked = [].concat(v).indexOf(el.value) >= 0;
      else if (el.type === "radio") el.checked = v === el.value;
      else el.value = v;
    });
  }

  /* ---------------------------------------------------------------- saving */
  function save(sec, complete, extra) {
    var form = sec.querySelector("form"), id = sec.getAttribute("data-step"), msg = sec.querySelector(".step__saved");
    var data = read(form);
    if (extra) for (var k in extra) data[k] = extra[k];
    msg.textContent = "Saving…";
    // a later autosave must not undo "done"
    var keepDone = !complete && state.steps[id] && state.steps[id].complete;
    return post({ t: token, step: id, data: data, complete: !!(complete || keepDone) }).then(function (d) {
      if (!d.ok) throw new Error(d.error || "");
      state = d;
      msg.textContent = complete ? "Saved." : "Saved as you type.";
      status();
      return d;
    }).catch(function () { msg.textContent = "Couldn't save. Check your connection and try again."; throw new Error("save"); });
  }
  var timers = {};
  steps.forEach(function (sec) {
    var form = sec.querySelector("form"), id = sec.getAttribute("data-step");
    var auto = function () { clearTimeout(timers[id]); timers[id] = setTimeout(function () { if (token) save(sec, false).catch(function () {}); }, 1200); };
    if (id !== "kickoff") { form.addEventListener("input", auto); form.addEventListener("change", auto); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearTimeout(timers[id]);
      var b = e.submitter, extra = b && b.name ? {} : null;
      if (extra) extra[b.name] = b.value;
      save(sec, true, extra).then(function () {
        var next = steps.filter(function (s) { return !s.hidden && !done(s); })[0];
        if (next) open(next, true);
        else { open(null, false); $("welDone").scrollIntoView({ behavior: "smooth", block: "center" }); }
      }).catch(function () {});
    });
  });

  /* ---------------------------------------------------------------- copy link + booking */
  $("welCopy").addEventListener("click", function () {
    var u = $("welUrl");
    u.select();
    var ok = function () { $("welCopy").textContent = "Copied"; setTimeout(function () { $("welCopy").textContent = "Copy"; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(u.value).then(ok, function () { document.execCommand("copy"); ok(); });
    else { document.execCommand("copy"); ok(); }
  });
  if (C.BOOKING_URL) $("bookOpen").href = C.BOOKING_URL;
  // the calendar embeds only once the kickoff step opens; the button stays as the fallback
  function embedBooking() {
    if (!C.BOOKING_URL || $("bookFrame")) return;
    var f = document.createElement("iframe");
    f.id = "bookFrame"; f.src = C.BOOKING_URL; f.title = "Pick a kickoff time"; f.loading = "lazy";
    $("bookBox").insertBefore(f, $("bookOpen"));
  }
})();
