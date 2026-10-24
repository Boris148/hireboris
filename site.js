/* Boris site: the live "what Boris is doing" line, seats from config.js, and the demo form.
   No network calls unless DEMO_FORM_ACTION is set. */
(function () {
  "use strict";
  var C = window.BORIS_SITE || {};
  var $ = function (id) { return document.getElementById(id); };

  /* ---------------------------------------------------------------- the live line (sample firm) */
  // kind: call = the B becomes a waveform; work = a ring sweeps; then a done check + a receipt row
  var FEED = [
    { job: "Paralegal", kind: "call", doing: "Calling Dr. Patel's records desk…", done: "Records requested · next follow-up Tue" },
    { job: "Receptionist", kind: "call", doing: "Answering a new caller · rear-ended on I-35", done: "New case qualified · retainer sent for e-sign" },
    { job: "Paralegal", kind: "work", doing: "Checking the PIP 30-day clock on 4 files…", done: "1 due Friday · attorney flagged" },
    { job: "Case Manager", kind: "call", doing: "Weekly check-in with Luis R., in Spanish…", done: "Still treating · next visit Thu · logged" },
    { job: "Paralegal", kind: "work", doing: "Asking St. Luke's for a lien balance…", done: "Lien balance saved to the file" },
    { job: "Paralegal", kind: "work", doing: "Drafting a letter of representation…", done: "Letter ready for attorney sign-off" },
    { job: "Intake", kind: "call", doing: "Calling back a lead from last night…", done: "Consult booked for 2:30 PM tomorrow" },
  ];
  var mark = $("liveMark"), line = $("liveLine"), text = $("liveText"), jobEl = $("liveJob"), list = $("liveDone");
  var LABEL = { idle: "Boris", call: "Boris is on a call", thinking: "Boris is working", done: "Boris finished" };
  function setMark(s) {
    if (!mark) return;
    mark.className = "bm live__mark bm--" + s;
    mark.setAttribute("aria-label", LABEL[s]);
  }
  function swap(t, isCall) {
    line.classList.add("is-swap");
    setTimeout(function () {
      text.textContent = t;
      line.classList.toggle("is-call", !!isCall);
      line.classList.remove("is-swap");
    }, 240);
  }
  var clock = new Date();
  clock.setHours(9, 18, 0, 0);
  function stamp() {
    clock = new Date(clock.getTime() + (3 + Math.floor(Math.random() * 5)) * 60000);
    var h = clock.getHours() % 12 || 12, m = clock.getMinutes();
    return h + ":" + (m < 10 ? "0" : "") + m;
  }
  function addDone(t) {
    var li = document.createElement("li");
    li.innerHTML = '<svg class="i i--ok" aria-hidden="true"><use href="#i-circle-check"/></svg><span></span><time></time>';
    li.querySelector("span").textContent = t;
    li.querySelector("time").textContent = stamp();
    list.insertBefore(li, list.firstChild);
    while (list.children.length > 3) list.removeChild(list.lastChild);
  }
  var i = 0, timer = null;
  function step() {
    var it = FEED[i % FEED.length];
    jobEl.textContent = it.job;
    setMark(it.kind === "call" ? "call" : "thinking");
    swap(it.doing, it.kind === "call");
    timer = setTimeout(function () {
      setMark("done");
      swap("Done: " + it.done, false);
      addDone(it.done);
      timer = setTimeout(function () {
        setMark("idle");
        i++;
        timer = setTimeout(step, 500);
      }, 1900);
    }, 3200);
  }
  if (mark && line && text && list) {
    // pause while the tab is hidden so the feed doesn't race ahead
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { clearTimeout(timer); timer = null; }
      else if (!timer) step();
    });
    timer = setTimeout(step, 900);
  }

  /* ---------------------------------------------------------------- seats */
  var money = function (n) { return "$" + n.toLocaleString("en-US"); };
  var check = '<svg class="i" aria-hidden="true"><use href="#i-circle-check"/></svg>';
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var seatsEl = $("seats"), addonEl = $("addon");
  if (seatsEl && C.SEATS) {
    var show = !!C.SHOW_PRICES;
    $("priceSub").textContent = show
      ? "Start with the phones. Add jobs when you're ready."
      : "Plans from Answers to Full Team. Book a demo for pricing.";
    seatsEl.innerHTML = C.SEATS.map(function (s) {
      return (
        '<article class="seat' + (s.featured ? " seat--featured" : "") + '">' +
        (s.featured ? '<span class="seat__tag">Most complete</span>' : "") +
        "<h3>" + esc(s.name) + '</h3><p class="seat__job">' + esc(s.job) + "</p>" +
        (show
          ? '<p class="seat__price">' + money(s.monthly) + "<small> /month</small></p>" + '<p class="seat__setup">' + money(s.setup) + " one-time setup</p>"
          : "") +
        "<ul>" + s.lines.map(function (l) { return "<li>" + check + esc(l) + "</li>"; }).join("") + "</ul>" +
        (show ? '<a class="btn ' + (s.featured ? "btn--primary" : "btn--ghost") + ' btn--block" href="#demo">Book a demo</a>' : "") +
        "</article>"
      );
    }).join("");
    if (addonEl && C.ADDON) {
      addonEl.innerHTML =
        "<h3>" + esc(C.ADDON.name) + (show ? " <span>+ " + money(C.ADDON.monthly) + " /month per seat</span>" : "") + "</h3>" +
        "<p>" + esc(C.ADDON.line) + "</p>";
    }
    if (!show) addonEl.insertAdjacentHTML("afterend", '<p class="seats__cta"><a class="btn btn--primary" href="#demo">Book a demo for pricing</a></p>');
  }

  /* ---------------------------------------------------------------- partner + mailto */
  var mailto = function (to, subject, body) {
    return "mailto:" + to + "?subject=" + encodeURIComponent(subject) + (body ? "&body=" + encodeURIComponent(body) : "");
  };
  var pb = $("partnerBtn");
  if (pb) pb.addEventListener("click", function () {
    var sel = $("f-int");
    if (sel) sel.value = "Becoming a partner";
  });

  /* ---------------------------------------------------------------- demo form */
  var form = $("demoForm"), err = $("formErr"), thanks = $("thanks"), fb = $("mailFallback");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = [];
    ["f-name", "f-firm", "f-email"].forEach(function (id) {
      var el = $(id), ok = el.value.trim() && (el.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.setAttribute("aria-invalid", ok ? "false" : "true");
      if (!ok) bad.push(el);
    });
    if (bad.length) {
      err.textContent = "Please add your name, firm and a work email.";
      err.hidden = false;
      bad[0].focus();
      return;
    }
    err.hidden = true;
    var data = new FormData(form);
    var lines = [];
    data.forEach(function (v, k) { if (v) lines.push(k + ": " + v); });
    var partner = data.get("interest") === "Becoming a partner";
    var to = partner ? C.PARTNER_EMAIL || C.CONTACT_EMAIL : C.CONTACT_EMAIL;
    fb.href = mailto(to || "", partner ? "Boris partner" : "Boris demo", lines.join("\n"));
    var done = function () {
      form.hidden = true;
      thanks.hidden = false;
      thanks.focus();
    };
    if (C.DEMO_FORM_ACTION) {
      fetch(C.DEMO_FORM_ACTION, { method: "POST", body: new URLSearchParams(data) }).then(done, done);
    } else {
      /* No endpoint yet: be honest, send it by email instead of a fake "we'll be in touch". */
      thanks.querySelector("h3").textContent = "One last step: send it to us.";
      thanks.querySelector("p").innerHTML = "";
      var btn = document.createElement("a");
      btn.className = "btn btn--primary"; btn.href = fb.href; btn.textContent = "Send my request by email";
      thanks.querySelector("p").appendChild(btn);
      done();
    }
  });
})();
