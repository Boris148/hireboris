/* Boris site: the live "what Boris is doing" line, config flags, the missed-call math, seats from config.js, and the form.
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

  /* ---------------------------------------------------------------- config flags */
  // data-flag="founding|guarantee|proof" shows only when that flag is on; "nofounding" only when founding is off.
  var F = C.FOUNDING || {}, G = C.GUARANTEE || {};
  var flags = { founding: !!F.on, guarantee: !!G.on, proof: !!C.SHOW_PROOF_SLOTS };
  flags.nofounding = !flags.founding;
  [].forEach.call(document.querySelectorAll("[data-flag]"), function (el) {
    if (flags[el.getAttribute("data-flag")]) el.hidden = false;
    else el.parentNode.removeChild(el); // removed, not just hidden (hidden <option>s still show on iOS)
  });
  var setText = function (id, t) { var el = $(id); if (el && t) el.textContent = t; };
  var primary = flags.founding ? "Check if your market is open" : "Book a demo";
  [].forEach.call(document.querySelectorAll('[data-cta="primary"]'), function (el) {
    // the header button stays short so it fits next to the logo on phones
    el.textContent = flags.founding && el.closest(".top") ? "Check your market" : primary;
    el.setAttribute("data-interest", flags.founding ? "Check if my market is open" : "A demo for my firm");
  });
  if (flags.founding) {
    setText("foundName", "One firm per market"); setText("foundLine", "Once your metro is taken, it's closed to other firms at founding terms.");
    if (typeof F.spotsLeft === "number") { var fl = $("foundLeft"); fl.textContent = F.spotsLeft + " founding spots left"; fl.hidden = false; }
    setText("offerEyebrow", "Founding firms"); setText("offerH", F.name);
    setText("offerSub", "Sign more cases without the next hire. " + (F.line || ""));
    setText("ctaH", "Check if your market is open.");
    setText("ctaSub", "Tell us your city. We'll tell you if it's open, then show you Boris working on a firm like yours.");
  }
  if (flags.guarantee) {
    setText("guarName", G.name); setText("guarLine", G.line); setText("guarFine", G.fine);
    setText("faqGuar", (G.name ? G.name + ": " : "") + G.line + " " + (G.fine || ""));
  }

  /* ---------------------------------------------------------------- missed-call math */
  var calc = $("calc");
  if (calc) {
    var num = function (id, max) { var v = parseFloat($(id).value); v = isFinite(v) && v > 0 ? v : 0; return max ? Math.min(v, max) : v; };
    var run = function () {
      var cases = num("c-calls") * (num("c-miss", 100) / 100) * (num("c-sign", 100) / 100);
      $("calcCases").textContent = cases >= 10 ? Math.round(cases) : (Math.round(cases * 10) / 10).toString();
      $("calcMoney").textContent = "$" + Math.round(cases * num("c-fee")).toLocaleString("en-US");
    };
    calc.addEventListener("input", run);
    calc.addEventListener("submit", function (e) { e.preventDefault(); });
    run();
  }

  /* ---------------------------------------------------------------- seats */
  var money = function (n) { return "$" + n.toLocaleString("en-US"); };
  var check = '<svg class="i" aria-hidden="true"><use href="#i-circle-check"/></svg>';
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var seatsEl = $("seats"), addonEl = $("addon");
  if (seatsEl && C.SEATS) {
    var show = !!C.SHOW_PRICES;
    $("priceSub").textContent = show
      ? (flags.founding ? "Founding price, locked for as long as you stay. " : "") + "Start with the phones. Add jobs when you're ready."
      : "Plans from Answers to Full Team. Book a demo for pricing.";
    var setupLine = function (s) {
      var f = flags.founding && typeof s.foundingSetup === "number" && s.foundingSetup < s.setup;
      if (!f) return money(s.setup) + " one-time setup";
      return (s.foundingSetup ? money(s.foundingSetup) : "No") + " setup for founding firms <s>" + money(s.setup) + "</s>";
    };
    seatsEl.innerHTML = C.SEATS.map(function (s) {
      var btn = s.selfServe
        ? '<a class="btn btn--primary btn--block" href="' + esc(C.STRIPE_CHECKOUT_URL || "#demo") + '"' + (C.STRIPE_CHECKOUT_URL ? ' rel="noopener"' : ' data-interest="Start now with Answers"') + ">Start now</a>"
        : '<a class="btn ' + (s.featured ? "btn--dark" : "btn--ghost") + ' btn--block" href="#demo" data-interest="A demo for my firm">Book a demo</a>';
      return (
        '<article class="seat' + (s.featured ? " seat--featured" : "") + '">' +
        (s.featured ? '<span class="seat__tag">Most complete</span>' : "") +
        "<h3>" + esc(s.name) + '</h3><p class="seat__job">' + esc(s.job) + "</p>" +
        (show
          ? (flags.founding ? '<p class="seat__label">Founding price</p>' : '<p class="seat__label">Draft price</p>') +
            '<p class="seat__price">' + money(s.monthly) + "<small> /month</small></p>" + '<p class="seat__setup">' + setupLine(s) + "</p>"
          : "") +
        "<ul>" + s.lines.map(function (l) { return "<li>" + check + esc(l) + "</li>"; }).join("") + "</ul>" +
        (show ? btn : "") +
        "</article>"
      );
    }).join("");
    if (addonEl && C.ADDON) {
      addonEl.innerHTML =
        "<h3>" + esc(C.ADDON.name) + (show ? " <span>+ " + money(C.ADDON.monthly) + " /month per seat</span>" : "") + "</h3>" +
        "<p>" + esc(C.ADDON.line) + "</p>";
    }
    if (show && C.ANNUAL_MONTHS_FREE) addonEl.insertAdjacentHTML("afterend", '<p class="fine fine--center">Pay for the year up front and get ' + C.ANNUAL_MONTHS_FREE + " months free.</p>");
    if (!show) addonEl.insertAdjacentHTML("afterend", '<p class="seats__cta"><a class="btn btn--primary" href="#demo" data-interest="A demo for my firm">Book a demo for pricing</a></p>');
    if (show && C.ANNUAL_MONTHS_FREE) setText("faqAnnual", "Pay a year up front and get " + C.ANNUAL_MONTHS_FREE + " months free.");
  }

  /* ---------------------------------------------------------------- mailto + "interest" links */
  var mailto = function (to, subject, body) {
    return "mailto:" + to + "?subject=" + encodeURIComponent(subject) + (body ? "&body=" + encodeURIComponent(body) : "");
  };
  if (C.CONTACT_EMAIL) {
    var cl = $("contactLink"); if (cl) { cl.href = mailto(C.CONTACT_EMAIL, "Boris"); cl.textContent = C.CONTACT_EMAIL; }
    var fm = $("footMail"); if (fm) fm.href = mailto(C.CONTACT_EMAIL, "Boris");
  }
  var sel = $("f-int"), formBtn = $("formBtn");
  var BTN = {
    "A demo for my firm": "Book a demo", "A free missed-call audit": "Get my free audit", "Start now with Answers": "Start now",
    "Check if my market is open": "Check my market", "Becoming a partner": "Become a partner",
  };
  var syncBtn = function () { if (sel && formBtn) formBtn.textContent = BTN[sel.value] || "Send"; };
  if (sel) { sel.addEventListener("change", syncBtn); syncBtn(); }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-interest]");
    if (!a || !sel) return;
    var v = a.getAttribute("data-interest");
    if ([].some.call(sel.options, function (o) { return o.value === v; })) { sel.value = v; syncBtn(); }
  });

  /* ---------------------------------------------------------------- form */
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
    var interest = data.get("interest") || "A demo for my firm";
    var partner = interest === "Becoming a partner";
    var to = partner ? C.PARTNER_EMAIL || C.CONTACT_EMAIL : C.CONTACT_EMAIL;
    fb.href = mailto(to || "", "Boris: " + interest, lines.join("\n"));
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
