/* Build your Boris (/start/): pick jobs → running total → firm details → Stripe Checkout via the boris-checkout Worker.
   Prices here are for display; the Worker recomputes the cart from its own table (projects/boris-checkout-worker/src/prices.js).
   ?job=<id> or ?jobs=a,b&billing=annual preselects (the demo's Hire sheet and Stripe's back button use these). */
(function () {
  "use strict";
  var C = window.BORIS_SITE || {};
  var $ = function (id) { return document.getElementById(id); };
  var money = function (n) { return "$" + Number(n).toLocaleString("en-US"); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var JOBS = C.JOBS || [], byId = {};
  JOBS.forEach(function (j) { byId[j.id] = j; });
  var FULL = byId.full, FEE = C.LAUNCH_FEE || 0, ANNUAL_X = 12 - (C.ANNUAL_MONTHS_FREE || 0);
  var ORDER = ["full", "intake", "receptionist", "case", "marketing", "ads"];
  var STATES = "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(" ");

  var sel = [], billing = "monthly", saved = 0;
  var store = {
    get: function () { try { return JSON.parse(sessionStorage.getItem("boris.start") || "null") || {}; } catch (e) { return {}; } },
    set: function (v) { try { sessionStorage.setItem("boris.start", JSON.stringify(v)); } catch (e) {} },
  };

  /* ---------------------------------------------------------------- the cart (mirrors the Worker) */
  // sel = what they tapped; cart() = what they'll pay for, computed exactly like the Worker does:
  // Intake includes Receptionist; Full Team covers the four core jobs and kicks in when they'd cost as much;
  // Ads Manager is the add-on price next to any other job.
  var cartIds = [];
  function cart() {
    var s = sel.filter(function (id, k) { return byId[id] && !byId[id].walkthrough && sel.indexOf(id) === k; });
    sel = s.slice();
    if (s.indexOf("intake") >= 0) s = s.filter(function (id) { return id !== "receptionist"; });
    saved = 0;
    if (s.indexOf("full") >= 0) s = s.filter(function (id) { return FULL.covers.indexOf(id) < 0; });
    else if (FULL) {
      var core = s.filter(function (id) { return FULL.covers.indexOf(id) >= 0; });
      var sum = core.reduce(function (t, id) { return t + byId[id].monthly; }, 0);
      if (sum >= FULL.monthly) { saved = sum - FULL.monthly; s = ["full"].concat(s.filter(function (id) { return FULL.covers.indexOf(id) < 0; })); }
    }
    s.sort(function (a, b) { return ORDER.indexOf(a) - ORDER.indexOf(b); });
    cartIds = s;
  }
  function lines() {
    var others = cartIds.filter(function (id) { return id !== "ads"; }).length;
    return cartIds.map(function (id) {
      var j = byId[id], add = id === "ads" && others > 0 && j.addon;
      var m = add ? j.addon : j.monthly;
      return { id: id, name: j.name + (add ? " (added on)" : ""), monthly: m, amount: billing === "annual" ? m * ANNUAL_X : m };
    });
  }
  // what a covered/included card says while its parent is in the cart
  function coveredBy(id) {
    if (id !== "full" && cartIds.indexOf("full") >= 0 && FULL.covers.indexOf(id) >= 0) return "Full Team";
    if (id === "receptionist" && cartIds.indexOf("intake") >= 0) return "Intake";
    return "";
  }

  /* ---------------------------------------------------------------- job cards */
  var jobsEl = $("jobs");
  function renderJobs() {
    jobsEl.innerHTML = JOBS.map(function (j) {
      var m = j.id === "ads" && j.addon && cartIds.some(function (id) { return id !== "ads"; }) ? j.addon : j.monthly; // add-on price next to any job
      var price = '<p class="job__price">' + money(billing === "annual" ? m * ANNUAL_X : m) + "<small>" + (billing === "annual" ? " /year" : " /month") + "</small></p>";
      if (j.walkthrough) {
        return '<div class="job job--walk"><div class="job__top"><h3>' + esc(j.name) + "</h3>" + price + '</div><p class="job__line">' + esc(j.line) + "</p>" +
          '<a class="job__walk" href="' + esc(C.BOOKING_URL || "/#try") + '" target="_blank" rel="noopener">Starts with a 20-minute walkthrough<svg class="i" aria-hidden="true"><use href="#i-arrow-right"/></svg></a></div>';
      }
      var auto = j.id === "full" && sel.indexOf("full") < 0 && cartIds.indexOf("full") >= 0;
      var on = sel.indexOf(j.id) >= 0 || auto, cov = coveredBy(j.id), lock = cov && !on;
      var fine = j.id === "ads" && j.fine ? '<p class="job__fine">' + esc(billing === "annual" ? money(j.addon * ANNUAL_X) + "/yr when added to any other job (" + money(j.monthly * ANNUAL_X) + "/yr on its own). Ad spend is paid to the platforms, not to us." : j.fine.replace("$1,000/mo when added to any other job.", money(j.addon) + "/mo when added to any other job, " + money(j.monthly) + "/mo on its own.")) + "</p>" : "";
      return '<button type="button" class="job' + (on && !cov ? " is-on" : "") + (cov ? " is-cov" : "") + (j.featured ? " job--feat" : "") + '" data-job="' + j.id + '" aria-pressed="' + (on || !!cov) + '"' + (lock ? ' aria-disabled="true"' : "") + ">" +
        '<span class="job__top"><span class="job__tick" aria-hidden="true"><svg class="i"><use href="#i-check"/></svg></span><span class="job__name">' + esc(j.name) + "</span>" + price + "</span>" +
        '<span class="job__line">' + esc(j.line) + "</span>" + fine +
        (cov ? '<span class="job__cov">Included in ' + cov + "</span>" : "") +
        (auto ? '<span class="job__cov">Switched on for you: it costs less than those jobs on their own</span>' : "") + "</button>";
    }).join("");
  }
  jobsEl.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-job]");
    if (!b || b.getAttribute("aria-disabled") === "true") return;
    var id = b.getAttribute("data-job"), k = sel.indexOf(id);
    if (k >= 0) sel.splice(k, 1); else sel.push(id);
    update(id);
  });

  /* ---------------------------------------------------------------- summary */
  function renderSum() {
    var L = lines(), per = L.reduce(function (t, l) { return t + l.amount; }, 0), annual = billing === "annual";
    var fee = annual || !L.length ? 0 : FEE;
    $("sumEmpty").hidden = !!L.length;
    $("sumLines").innerHTML = L.map(function (l) { return "<li><span>" + esc(l.name) + "</span><b>" + money(l.amount) + (annual ? "/yr" : "/mo") + "</b></li>"; }).join("");
    $("sumBundle").hidden = !saved;
    if (saved) $("sumBundle").textContent = "You're getting Full Team. It covers those jobs and saves " + money(saved) + "/mo" + (billing === "annual" ? " (" + money(saved * ANNUAL_X) + "/yr)." : ".");
    $("sumTot").hidden = !L.length;
    $("sumPerL").textContent = annual ? "Yearly" : "Monthly";
    $("sumPer").textContent = money(per) + (annual ? "/yr" : "/mo");
    $("sumFee").innerHTML = annual ? "<s>" + money(FEE) + "</s> waived" : money(FEE);
    $("sumToday").textContent = money(per + fee);
    $("sumThen").hidden = !L.length;
    $("sumThen").textContent = annual ? "Renews at " + money(per) + " a year. That's 2 months free." : "Then " + money(per) + " a month. Switch to annual to skip the launch fee and get 2 months free.";
    $("buyGo").disabled = false;
  }
  function update(changed) {
    cart();
    renderJobs(); // re-rendered cards lose focus: put it back on the one just tapped
    renderSum();
    if (changed) { var b = jobsEl.querySelector('[data-job="' + changed + '"]'); if (b) b.focus({ preventScroll: true }); }
    persist();
  }
  [].forEach.call(document.querySelectorAll("[data-bill]"), function (b) {
    b.addEventListener("click", function () {
      billing = b.getAttribute("data-bill");
      [].forEach.call(document.querySelectorAll("[data-bill]"), function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      update();
    });
  });

  /* ---------------------------------------------------------------- firm form */
  var form = $("firmForm"), err = $("buyErr"), go = $("buyGo");
  $("b-state").insertAdjacentHTML("beforeend", STATES.map(function (s) { return "<option>" + s + "</option>"; }).join(""));
  var FIELDS = ["firm", "name", "email", "phone", "state", "attorneys"];
  function persist() {
    var v = { jobs: sel, billing: billing };
    FIELDS.forEach(function (f) { v[f] = form.elements[f].value; });
    store.set(v);
  }
  form.addEventListener("input", persist);
  form.addEventListener("change", persist);

  // referral: ?ref= here, or remembered from any hireboris.com page (attribution only)
  var q = new URLSearchParams(location.search), ref = "";
  try {
    var rq = q.get("ref");
    if (rq && /^[A-Za-z0-9_-]{1,40}$/.test(rq)) localStorage.setItem("boris.ref", JSON.stringify({ ref: rq.toLowerCase(), at: Date.now() }));
    var rs = JSON.parse(localStorage.getItem("boris.ref") || "null");
    if (rs && rs.ref && Date.now() - rs.at < 90 * 864e5) ref = rs.ref;
  } catch (e) {}
  $("b-ref").value = ref;

  function fail(msg, el) {
    err.textContent = msg;
    err.hidden = false;
    if (el) el.focus();
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    err.hidden = true;
    if (form.elements.website.value) return;
    if (!sel.length) { fail("Pick at least one job for Boris."); jobsEl.querySelector("button").focus(); return; }
    var v = {};
    FIELDS.forEach(function (f) { v[f] = form.elements[f].value.trim(); });
    var miss = ["firm", "name", "email", "phone", "state"].filter(function (f) { return !v[f]; })[0];
    if (miss) return fail("Please fill in every field (attorneys is optional).", form.elements[miss]);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) return fail("That email doesn't look right.", form.elements.email);
    if (v.phone.replace(/\D/g, "").length < 7) return fail("That phone number doesn't look right.", form.elements.phone);
    if (!$("b-agree").checked) return fail("Please agree to the Boris Service Agreement to continue.", $("b-agree"));
    if (!C.CHECKOUT_API) return fail("Online checkout isn't switched on yet. Email boris@socialelitemarketinggroup.com and we'll set you up.");
    go.disabled = true;
    go.querySelector("span").textContent = "Opening secure checkout…";
    var body = { jobs: sel, billing: billing, ref: ref, agree: true, website: form.elements.website.value };
    FIELDS.forEach(function (f) { body[f] = v[f]; });
    fetch(C.CHECKOUT_API + "/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
      .then(function (d) {
        if (d && d.ok && d.url) { location.href = d.url; return; }
        throw new Error((d && d.error) || "");
      })
      .catch(function (x) {
        go.disabled = false;
        go.querySelector("span").textContent = "Continue to secure checkout";
        fail((x && x.message) || "We couldn't open checkout. Please try again, or email boris@socialelitemarketinggroup.com.");
      });
  });

  /* ---------------------------------------------------------------- start */
  var s0 = store.get();
  var pre = (q.get("jobs") || q.get("job") || "").split(",").filter(function (id) { return byId[id]; });
  if (pre.length === 1 && byId[pre[0]].walkthrough) pre = []; // Paralegal starts with a walkthrough
  sel = pre.length ? pre : (s0.jobs || []);
  billing = q.get("billing") === "annual" || (!q.get("billing") && s0.billing === "annual") ? "annual" : "monthly";
  [].forEach.call(document.querySelectorAll("[data-bill]"), function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-bill") === billing ? "true" : "false"); });
  FIELDS.forEach(function (f) { if (s0[f]) form.elements[f].value = s0[f]; });
  update();
  if (C.BOOKING_URL) [].forEach.call(document.querySelectorAll("[data-book]"), function (a) { a.href = C.BOOKING_URL; });
})();
