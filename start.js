/* Hire Boris (/start/), 10/26 ONE PLAN: the Boris plan (preselected) + Ads Manager toggle + monthly/annual, or the quiet
   Ads-Manager-only path → firm details → Stripe Checkout via the boris-checkout Worker (offer "boris").
   Prices here are for display; the Worker recomputes the cart from its own table (projects/boris-checkout-worker/src/prices.js).
   ?jobs=a,b&billing=annual preselects (the demo's Hire sheet, the home page and Stripe's back button use these): only "ads"
   = Ads Manager alone; anything else (boris, or an old job id like receptionist/intake/full) = the plan, plus Ads if listed. */
(function () {
  "use strict";
  var C = window.BORIS_SITE || {};
  var $ = function (id) { return document.getElementById(id); };
  var money = function (n) { return "$" + Number(n).toLocaleString("en-US"); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var byId = {};
  (C.JOBS || []).forEach(function (j) { byId[j.id] = j; });
  var PLAN = C.PLAN || {}, PJ = byId.boris || {}, ADS = byId.ads || {}, EARLY = C.EARLY_ACCESS;
  var FEE = C.LAUNCH_FEE || 0, ANNUAL_X = 12 - (C.ANNUAL_MONTHS_FREE || 0);
  var STATES = "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(" ");

  var plan = true, ads = false, billing = "monthly";
  var store = {
    get: function () { try { return JSON.parse(sessionStorage.getItem("boris.start") || "null") || {}; } catch (e) { return {}; } },
    set: function (v) { try { sessionStorage.setItem("boris.start", JSON.stringify(v)); } catch (e) {} },
  };
  // what we send the Worker (it prices it the same way: the plan absorbs its jobs, Ads is the add-on next to it)
  var picked = function () { return (plan ? ["boris"] : []).concat(ads ? ["ads"] : []); };
  // any old job list → plan/ads (old links and stored carts keep working)
  function fromJobs(list) {
    list = (list || []).filter(Boolean);
    if (!list.length) return null;
    var onlyAds = list.every(function (id) { return id === "ads"; });
    return { plan: !onlyAds, ads: list.indexOf("ads") >= 0 || list.indexOf("growth") >= 0 };
  }

  /* ---------------------------------------------------------------- the cart (mirrors the Worker) */
  function lines() {
    var L = [];
    if (plan) L.push({ id: "boris", name: PJ.name || "Boris", monthly: PJ.monthly });
    if (ads) L.push({ id: "ads", name: ADS.name + (plan ? " (added on)" : ""), monthly: plan ? ADS.addon : ADS.monthly });
    return L.map(function (l) { l.amount = billing === "annual" ? l.monthly * ANNUAL_X : l.monthly; return l; });
  }

  /* ---------------------------------------------------------------- plan + add-on cards */
  var jobsEl = $("jobs");
  var per = function (m) { return money(billing === "annual" ? m * ANNUAL_X : m) + "<small>" + (billing === "annual" ? " /year" : " /month") + "</small>"; };
  function card(id, on, name, price, line, fine, feat) {
    return '<button type="button" class="job' + (on ? " is-on" : "") + (feat ? " job--feat" : "") + '" data-job="' + id + '" aria-pressed="' + on + '">' +
      '<span class="job__top"><span class="job__tick" aria-hidden="true"><svg class="i"><use href="#i-check"/></svg></span><span class="job__name">' + esc(name) + '</span><span class="job__price">' + price + "</span></span>" +
      '<span class="job__line">' + esc(line) + "</span>" + (fine ? '<span class="job__fine">' + fine + "</span>" : "") + "</button>";
  }
  function renderJobs() {
    var adsM = plan ? ADS.addon : ADS.monthly;
    jobsEl.innerHTML =
      card("boris", plan, PLAN.name || "Boris", per(PJ.monthly), PLAN.line || "", plan ? "" : "Tap to add the full Boris plan.", true) +
      card("ads", ads, ADS.name, (plan ? "+ " : "") + per(adsM), (C.ADS_ADDON || {}).line || "",
        esc(plan ? money(ADS.addon) + "/mo added to Boris (" + money(ADS.monthly) + "/mo on its own)." : "On its own: " + money(ADS.monthly) + "/mo.")) +
      (EARLY ? '<div class="job job--walk"><div class="job__top"><h3>' + esc(EARLY.name) + '</h3><p class="job__price"><small>' + esc(EARLY.label) + '</small></p></div><p class="job__line">' + esc(EARLY.line) + "</p>" +
        '<a class="job__walk" href="' + esc(C.BOOKING_URL || "/#try") + '" target="_blank" rel="noopener">Starts with a 20-minute walkthrough<svg class="i" aria-hidden="true"><use href="#i-arrow-right"/></svg></a></div>' : "");
    var alone = $("adsAlone");
    if (alone) alone.innerHTML = plan
      ? esc((C.ADS_ADDON || {}).alone || "Just want Boris on your ads?") + ' <button type="button" class="linkbtn" data-mode="ads">Ads Manager alone, ' + money(ADS.monthly) + "/mo</button>"
      : 'Want every job? <button type="button" class="linkbtn" data-mode="plan">Get the Boris plan, ' + money(PJ.monthly) + "/mo</button>";
  }
  jobsEl.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-job]");
    if (!b) return;
    var id = b.getAttribute("data-job");
    if (id === "boris") plan = !plan; else ads = !ads;
    update(id);
  });
  $("adsAlone").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-mode]");
    if (!b) return;
    if (b.getAttribute("data-mode") === "ads") { plan = false; ads = true; } else { plan = true; ads = false; } // the link's price is what they get
    update(b.getAttribute("data-mode") === "ads" ? "ads" : "boris");
  });

  /* ---------------------------------------------------------------- summary */
  function renderSum() {
    var L = lines(), tot = L.reduce(function (t, l) { return t + l.amount; }, 0), annual = billing === "annual";
    var fee = annual || !L.length ? 0 : FEE;
    $("sumEmpty").hidden = !!L.length;
    $("sumLines").innerHTML = L.map(function (l) { return "<li><span>" + esc(l.name) + "</span><b>" + money(l.amount) + (annual ? "/yr" : "/mo") + "</b></li>"; }).join("");
    $("sumBundle").hidden = true;
    $("sumTot").hidden = !L.length;
    $("sumPerL").textContent = annual ? "Yearly" : "Monthly";
    $("sumPer").textContent = money(tot) + (annual ? "/yr" : "/mo");
    $("sumFee").innerHTML = annual ? "<s>" + money(FEE) + "</s> waived" : money(FEE);
    $("sumToday").textContent = money(tot + fee);
    $("sumThen").hidden = !L.length;
    $("sumThen").textContent = annual ? "Renews at " + money(tot) + " a year. That's 2 months free." : "Then " + money(tot) + " a month. Switch to annual to skip the launch fee and get 2 months free.";
    $("buyGo").disabled = false;
  }
  function update(changed) {
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
    var v = { jobs: picked(), billing: billing };
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
  // private test link (?pass=): sent with the checkout request only; the Worker decides whether it's valid
  var pass = /^[A-Za-z0-9_-]{20,100}$/.test(q.get("pass") || "") ? q.get("pass") : "";

  function fail(msg, el) {
    err.textContent = msg;
    err.hidden = false;
    if (el) el.focus();
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    err.hidden = true;
    if (form.elements.website.value) return;
    if (!picked().length) { fail("Pick the Boris plan or the Ads Manager."); jobsEl.querySelector("button").focus(); return; }
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
    var body = { jobs: picked(), offer: "boris", billing: billing, ref: ref, agree: true, website: form.elements.website.value };
    FIELDS.forEach(function (f) { body[f] = v[f]; });
    if (pass) body.pass = pass;
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
  var pre = fromJobs((q.get("jobs") || q.get("job") || "").split(",").filter(function (id) { return byId[id]; })) || fromJobs(s0.jobs);
  if (pre) { plan = pre.plan; ads = pre.ads; } // default: the plan, preselected
  billing = q.get("billing") === "annual" || (!q.get("billing") && s0.billing === "annual") ? "annual" : "monthly";
  [].forEach.call(document.querySelectorAll("[data-bill]"), function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-bill") === billing ? "true" : "false"); });
  FIELDS.forEach(function (f) { if (s0[f]) form.elements[f].value = s0[f]; });
  update();
  if (C.BOOKING_URL) [].forEach.call(document.querySelectorAll("[data-book]"), function (a) { a.href = C.BOOKING_URL; });
})();
