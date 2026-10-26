/* Boris site: the live "what Boris is doing" line, config flags, the example-call players, the missed-call math,
   seats from config.js, and the Explore the live demo form (instant demo access). No network calls unless DEMO_FORM_ACTION is set. */
(function () {
  "use strict";
  var C = window.BORIS_SITE || {};
  var $ = function (id) { return document.getElementById(id); };

  /* ---------------------------------------------------------------- the live line (sample firm) */
  // kind: call = the B becomes a waveform; work = a ring sweeps; then a done check + a receipt row
  // v4: every job, not just the phones (the hero should read "AI employee across the firm")
  var FEED = [
    { job: "Paralegal", kind: "work", doing: "Drafting a demand for Marcus B. from 214 pages of records…", done: "Demand draft ready for attorney review" },
    { job: "Case Manager", kind: "call", doing: "Calling Methodist's records desk for the Martinez file…", done: "ER records promised by Friday · follow-up set" },
    { job: "Ads Manager", kind: "work", doing: "Moving budget from truck ads to the Spanish ads that sign…", done: "$400 a week moved · losing ad paused" },
    { job: "Intake", kind: "work", doing: "Sending Dana P.'s retainer the attorney approved…", done: "Retainer signed · case opened in the case software" },
    { job: "Receptionist", kind: "call", doing: "Answering a new caller · rear-ended on I-35", done: "New case qualified · attorney texted" },
    { job: "Marketing", kind: "work", doing: "Tying last week's signed cases to their sources…", done: "Cost per signed case by source · report ready" },
    { job: "Paralegal", kind: "work", doing: "Checking the PIP 30-day clock on 4 files…", done: "1 due Friday · attorney flagged" },
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
  // data-flag="founding|guarantee|proof" shows only when that flag is on.
  var F = C.FOUNDING || {}, G = C.GUARANTEE || {};
  var flags = { founding: !!F.on, guarantee: !!G.on, proof: !!C.SHOW_PROOF_SLOTS };
  [].forEach.call(document.querySelectorAll("[data-flag]"), function (el) {
    if (flags[el.getAttribute("data-flag")]) el.hidden = false;
    else el.parentNode.removeChild(el);
  });
  var setText = function (id, t) { var el = $(id); if (el && t) el.textContent = t; };
  if (flags.founding) {
    setText("foundName", "One firm per market"); setText("foundLine", "Once your metro is taken, it's closed to other firms at founding terms.");
    if (typeof F.spotsLeft === "number") { var fl = $("foundLeft"); fl.textContent = F.spotsLeft + " founding spots left"; fl.hidden = false; }
    setText("offerEyebrow", "Founding firms"); setText("offerH", F.name);
    setText("offerSub", "Sign more cases without the next hire. " + (F.line || ""));
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
  // v5: "Hire Boris now" → /start/ (self-serve checkout) when START_URL is set; the walkthrough stays for bigger firms
  var startUrl = function (job) { return C.START_URL ? C.START_URL + (job ? "?job=" + encodeURIComponent(job) : "") : ""; };
  [].forEach.call(document.querySelectorAll("[data-start]"), function (a) {
    if (!C.START_URL) { a.hidden = true; return; }
    a.href = startUrl(a.getAttribute("data-start"));
  });
  // 10/26 ONE PLAN: one plan card (Boris, everything included) + Ads Manager (added on, or alone) + early access jobs
  if (seatsEl && C.PLAN) {
    var show = !!C.SHOW_PRICES;
    var fee = C.LAUNCH_FEE, P = C.PLAN, ads = C.ADS_ADDON, early = C.EARLY_ACCESS;
    var X = 12 - (C.ANNUAL_MONTHS_FREE || 0);
    var planJob = (C.JOBS || []).filter(function (j) { return j.id === P.id; })[0] || {};
    $("priceSub").textContent = show
      ? (flags.founding ? "Founding price, locked for as long as you stay. " : "") + "Every job in one plan. Live within 3 business days of finishing your setup checklist."
      : "One plan, everything included. Book a demo call for pricing.";
    seatsEl.classList.add("seats--one");
    var btn = C.START_URL
      ? '<a class="btn btn--dark btn--block" href="' + esc(startUrl()) + '">Hire Boris now</a>'
      : '<a class="btn btn--dark btn--block" href="#try" data-intent="call">Book a demo call</a>';
    seatsEl.innerHTML =
      '<article class="seat seat--featured">' +
      '<span class="seat__tag">' + esc(P.tag) + "</span>" +
      "<h3>" + esc(P.name) + '</h3><p class="seat__job">' + esc(P.job) + "</p>" +
      (show && planJob.monthly
        ? (flags.founding ? '<p class="seat__label">Founding price</p>' : "") +
          '<p class="seat__price">' + money(planJob.monthly) + "<small> /month</small></p>" +
          '<p class="seat__setup">' + (C.ANNUAL_MONTHS_FREE ? "or " + money(planJob.monthly * X) + "/yr, " + C.ANNUAL_MONTHS_FREE + " months free. " : "") +
          (fee ? money(fee) + " launch fee" + (C.ANNUAL_MONTHS_FREE ? ", waived on annual." : ".") : "") + "</p>"
        : "") +
      "<ul>" + P.lines.map(function (l) { return "<li>" + check + esc(l) + "</li>"; }).join("") + "</ul>" +
      (show ? btn : "") +
      "</article>";
    var go = function (href, label, ext) {
      return ' <a class="addon__go" href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + label + '<svg class="i" aria-hidden="true"><use href="#i-arrow-right"/></svg></a>';
    };
    if (addonEl && ads) {
      var adsPrice = show ? " <span>+ " + money(ads.monthly) + " /month added to Boris</span>" : "";
      addonEl.innerHTML = "<h3>" + esc(ads.name) + adsPrice + "</h3><p>" + esc(ads.line) + (show && C.START_URL ? go(C.START_URL + "?jobs=boris,ads", "Add it to Boris") : "") + "</p>" +
        (show && ads.standalone ? '<p class="addon__alone">' + esc(ads.alone) + " The Ads Manager on its own is " + money(ads.standalone) + "/mo." + (C.START_URL ? go(C.START_URL + "?jobs=ads", "Ads Manager alone") : "") + "</p>" : "");
    }
    if (addonEl && early) {
      addonEl.insertAdjacentHTML("beforeend",
        '<h3 class="addon__2">' + esc(early.name) + " <span>" + esc(early.label) + "</span></h3>" +
        "<p>" + esc(early.line) + (C.BOOKING_URL ? go(C.BOOKING_URL, "Book a walkthrough", true) : ' <a class="addon__go" href="#try" data-intent="call">Book a walkthrough</a>') + "</p>");
    }
    if (show && C.ANNUAL_MONTHS_FREE) addonEl.insertAdjacentHTML("afterend", '<p class="fine fine--center">Pay for the year up front: ' + C.ANNUAL_MONTHS_FREE + " months free and no launch fee.</p>" +
      (C.BOOKING_URL ? '<p class="fine fine--center">Bigger firm, or want it tailored? <a href="' + esc(C.BOOKING_URL) + '" target="_blank" rel="noopener">Book a 20-minute walkthrough</a>.</p>' : ""));
    if (!show) addonEl.insertAdjacentHTML("afterend", '<p class="seats__cta"><a class="btn btn--ghost" href="#try" data-intent="call">Book a demo call for pricing</a></p>');
    if (show) setText("faqPrice", "One flat monthly price: " + money(planJob.monthly) + "/mo for Boris, every job included. Add the Ads Manager for " + money(ads.monthly) + "/mo (" + money(ads.standalone) + "/mo on its own). Never a percentage of fees or settlements.");
    if (show && C.ANNUAL_MONTHS_FREE) setText("faqAnnual", (fee ? "Online orders pay a " + money(fee) + " launch fee once. " : "") + "Pay a year up front and get " + C.ANNUAL_MONTHS_FREE + " months free, with no launch fee.");
  }

  /* ---------------------------------------------------------------- referral (?ref=) */
  // a partner's link to any page credits them at checkout (/start/ reads it). Attribution only, no discount.
  try {
    var refQ = new URLSearchParams(location.search).get("ref");
    if (refQ && /^[A-Za-z0-9_-]{1,40}$/.test(refQ)) localStorage.setItem("boris.ref", JSON.stringify({ ref: refQ.toLowerCase(), at: Date.now() }));
  } catch (e) {}

  /* ---------------------------------------------------------------- the day-at-a-firm video */
  // muted + looped with burned-in captions; loads only near the viewport; phone gets the 4:5 cut
  var vid = $("dayVideo");
  if (vid && C.VIDEO) {
    var vbox = vid.parentNode, small = window.matchMedia("(max-width: 640px)").matches;
    var cut = small ? "4x5" : "16x9";
    vbox.classList.add("vid--" + cut);
    vid.poster = "video/boris-day-" + cut + ".webp";
    var loadVid = function () {
      if (vid.getAttribute("src")) return;
      vid.src = "video/boris-day-" + cut + ".mp4";
      var p = vid.play();
      if (p && p.catch) p.catch(function () {});
    };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { loadVid(); if (vid.paused && vid.muted) { var q = vid.play(); if (q && q.catch) q.catch(function () {}); } }
          else if (vid.muted && !vid.paused) vid.pause();
        });
      }, { rootMargin: "200px" });
      io.observe(vid);
    } else loadVid();
    var vbtn = $("dayVideoBtn");
    if (vbtn) vbtn.addEventListener("click", function () {
      loadVid();
      vid.currentTime = 0;
      if (C.VIDEO_SOUND) { vid.muted = false; vid.loop = false; vid.controls = true; vbtn.hidden = true; }
      var q = vid.play(); if (q && q.catch) q.catch(function () {});
    });
    if (C.VIDEO_SOUND && vbtn) vbtn.querySelector("span").textContent = "Watch with sound";
  } else if (vid) vid.closest("section").hidden = true;

  /* ---------------------------------------------------------------- mail + booking links */
  // the booking page fills in the details they already gave us
  var bookingUrl = function (v) {
    var parts = String(v.name || "").trim().split(/\s+/), q = new URLSearchParams();
    if (parts[0]) q.set("first_name", parts[0]);
    if (parts.length > 1) q.set("last_name", parts.slice(1).join(" "));
    if (v.email) q.set("email", v.email);
    if (v.phone) q.set("phone", v.phone);
    if (v.firm) q.set("company_name", v.firm);
    return C.BOOKING_URL + (C.BOOKING_URL.indexOf("?") < 0 ? "?" : "&") + q.toString();
  };
  var mailto = function (to, subject, body) {
    return "mailto:" + to + "?subject=" + encodeURIComponent(subject) + (body ? "&body=" + encodeURIComponent(body) : "");
  };
  if (C.CONTACT_EMAIL) { var fm = $("footMail"); if (fm) fm.href = mailto(C.CONTACT_EMAIL, "Boris"); }
  var pm = $("partnerMail");
  if (pm) pm.href = mailto(C.PARTNER_EMAIL || C.CONTACT_EMAIL || "", "Boris partner program", "Name:\nCompany:\nReferral or white-label:\n");

  /* ---------------------------------------------------------------- example calls (fictional firm + callers) */
  // starts = when each line begins in audio/<id>.mp3 (seconds), from tmp/boris-site-v3/gen/calls-timing.json
  var CALLS = {
    late: {
      title: "New caller · 11:40 PM", who: "Caller", total: 37.1,
      starts: [0, 6.34, 12.91, 15.82, 21.55, 25.53, 29.92],
      lines: [
        "Alamo Injury Law, this is Boris. This call is recorded, and I'm an AI assistant. How can I help?",
        "Hi. Um, I was just in a car wreck on 410. Somebody ran the red light and hit my side.",
        "I'm sorry. Are you safe right now, and is anyone hurt?",
        "I'm home. My neck and shoulder really hurt. The ambulance checked me, but I didn't go.",
        "Thank you. If it gets worse tonight, please go to the ER. Did the police come?",
        "Yes, I have the report number. And her insurance is Progressive.",
        "Perfect. I'm sending this to Attorney Reyes now. The firm will call you by nine tomorrow morning, and I'm texting you a summary.",
      ],
      sumH: "New case · car accident · strong (84)",
      sum: "Red-light crash on Loop 410 at about 11:30 PM. Neck and shoulder pain. EMS checked her at the scene, no ER yet. Police report taken.",
      kv: [["Injuries", "Neck, shoulder"], ["Treatment", "None yet, told to go to ER if worse"], ["Other driver", "Insured (Progressive)"], ["Deadline", "Fine: crash was tonight"]],
      acts: ["Texted Attorney Reyes: new strong case · 11:44 PM", "Texted the caller a summary and the 9 AM callback", "Created the lead in the case software", "Saved the call and transcript to the file", "Retainer waits for the attorney's OK"],
    },
    spanish: {
      title: "New caller · in Spanish", who: "Caller", total: 34.2,
      starts: [0, 4.67, 6.74, 9.22, 14.5, 18.38, 23.28, 25.72, 27.78],
      lines: [
        "Alamo Injury Law, this is Boris. This call is recorded, and I'm an AI assistant.",
        "Hola. ¿Habla español?",
        "Sí, claro. ¿En qué le puedo ayudar?",
        "Me caí en una tienda. El piso estaba mojado y no había ningún aviso.",
        "Lo siento mucho. ¿Cuándo pasó, y ya la vio un médico?",
        "El martes. Fui a urgencias y me dijeron que es un esguince en la muñeca.",
        "Entiendo. ¿La tienda hizo un reporte?",
        "Sí, el gerente lo escribió.",
        "Muy bien. Hoy mismo le paso todo a la abogada, y le mando un mensaje con el resumen en español.",
      ],
      en: [null, "Hi. Do you speak Spanish?", "Yes, of course. How can I help you?", "I fell in a store. The floor was wet and there was no warning sign.",
        "I'm so sorry. When did it happen, and has a doctor seen you?", "Tuesday. I went to the ER and they said it's a sprained wrist.",
        "I understand. Did the store write a report?", "Yes, the manager wrote it up.", "Very good. I'll pass everything to the attorney today, and text you a summary in Spanish."],
      sumH: "New case · slip and fall · good (71)",
      sum: "Fell on a wet floor in a store on Tuesday, no warning sign. ER visit, sprained wrist. The store manager wrote an incident report.",
      kv: [["Language", "Spanish"], ["Injuries", "Sprained wrist"], ["Treatment", "ER on Tuesday"], ["Evidence", "Store incident report"]],
      acts: ["Texted the caller a summary in Spanish", "Sent it to the attorney for review today", "Created the lead, marked Spanish-speaking", "Asked the attorney before sending a preservation letter for the store video"],
    },
    status: {
      title: "Existing client · status call", who: "Marcus", total: 37.5,
      starts: [0, 4.9, 10.36, 22.46, 24.43, 31.19, 32.84],
      lines: [
        "Alamo Injury Law, this is Boris. This call is recorded, and I'm an AI assistant.",
        "Hey, it's Marcus Bell. I just want to know what's going on with my case. Nobody's called me.",
        "Hi Marcus, I have your file. You finished physical therapy on October second, and we asked Southside Rehab for your final bills on the ninth. They haven't sent them yet, so I'll call them again today.",
        "Okay. So what happens after that?",
        "Once the bills are in, your attorney reviews everything for the demand. Want a call with Attorney Reyes? I have Thursday at two.",
        "Thursday at two works.",
        "Done. You'll get a text to confirm, and I've noted your question in your file.",
      ],
      sumH: "Existing client · status question · handled",
      sum: "Marcus asked where his case stands. Boris answered from the Firm Brain: therapy finished 10/2, final bills requested 10/9 and still out.",
      kv: [["Answered from", "Case file + his last 3 calls"], ["Booked", "Attorney Reyes, Thu 2:00 PM"], ["Next step", "Final bills, then demand review"]],
      acts: ["Read his status from the Firm Brain", "Booked Marcus with Attorney Reyes, Thu 2:00 PM", "Texted Marcus the confirmation", "Called Southside Rehab again for the final bills", "Logged the call in his case file"],
    },
  };
  var tabs = [].slice.call(document.querySelectorAll(".ctab"));
  var tx = $("callTx"), au = $("callAudio"), playBtn = $("callPlay"), bar = $("callBar"), tEl = $("callTime");
  if (tx && tabs.length) {
    var cur = null, id = "late", playing = false, simT = 0, simAt = 0, raf = 0, useAudio = !!C.CALL_AUDIO, shownAll = false, done = false;
    var fmt = function (t) { t = Math.max(0, Math.floor(t)); return Math.floor(t / 60) + ":" + (t % 60 < 10 ? "0" : "") + (t % 60); };
    var icon = function (n) { playBtn.querySelector("use").setAttribute("href", "#i-" + n); };
    var now = function () { return useAudio ? au.currentTime || 0 : simT + (playing ? (Date.now() - simAt) / 1000 : 0); };
    var lineEl = function (k) {
      var li = document.createElement("li"), boris = k % 2 === 0;
      li.className = "tx__line" + (boris ? " tx__line--b" : "");
      li.innerHTML = "<b></b><span></span>";
      li.querySelector("b").textContent = boris ? "Boris" : cur.who;
      li.querySelector("span").textContent = cur.lines[k];
      if (cur.en && cur.en[k]) { var e = document.createElement("small"); e.textContent = cur.en[k]; li.appendChild(e); }
      return li;
    };
    var shown = 0;
    var show = function (t) {
      var n = shownAll ? cur.lines.length : cur.starts.filter(function (s) { return s <= t + 0.05; }).length;
      if (n && tx.querySelector(".tx__empty")) tx.innerHTML = "";
      while (shown < n) tx.appendChild(lineEl(shown++));
      [].forEach.call(tx.children, function (li, k) { li.classList.toggle("is-now", playing && k === n - 1); });
      bar.style.width = Math.min(100, (t / cur.total) * 100) + "%";
      tEl.textContent = fmt(t) + " / " + fmt(cur.total);
    };
    var loop = function () {
      var t = now();
      if (!useAudio && t >= cur.total) return end();
      show(t);
      if (playing) raf = requestAnimationFrame(loop);
    };
    var end = function () {
      playing = false; cancelAnimationFrame(raf); simT = 0; done = true;
      shownAll = true; show(cur.total); icon("rotate"); playBtn.setAttribute("aria-label", "Play the call again");
    };
    var stop = function () {
      if (useAudio) au.pause(); else simT = now();
      playing = false; cancelAnimationFrame(raf); icon("play"); playBtn.setAttribute("aria-label", "Play the call");
      show(now());
    };
    var start = function () {
      if (done || (shownAll && now() < 0.1)) { tx.innerHTML = ""; shown = 0; shownAll = false; done = false; if (useAudio) au.currentTime = 0; simT = 0; }
      playing = true; icon("pause"); playBtn.setAttribute("aria-label", "Pause the call");
      if (useAudio) {
        var p = au.play();
        if (p && p.catch) p.catch(function () { useAudio = false; simT = au.currentTime || 0; simAt = Date.now(); loop(); });
      } else simAt = Date.now();
      loop();
    };
    var load = function (k) {
      if (playing) stop();
      id = k; cur = CALLS[k]; shown = 0; shownAll = false; done = false; simT = 0; useAudio = !!C.CALL_AUDIO;
      tx.innerHTML = '<li class="tx__empty">Press play to hear the call, or read the whole transcript.</li>';
      if (useAudio) { au.src = "audio/" + k + ".mp3"; au.load(); }
      icon("play"); playBtn.setAttribute("aria-label", "Play the call");
      $("callTitle").textContent = cur.title;
      $("callSumH").textContent = cur.sumH; $("callSum").textContent = cur.sum;
      $("callKv").innerHTML = cur.kv.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("");
      $("callActs").innerHTML = cur.acts.map(function (a) { return "<li>" + check + "<span>" + esc(a) + "</span></li>"; }).join("");
      $("callPanel").setAttribute("aria-labelledby", "tab-" + k);
      tabs.forEach(function (t) { var on = t.getAttribute("data-call") === k; t.setAttribute("aria-selected", on ? "true" : "false"); t.tabIndex = on ? 0 : -1; });
      bar.style.width = "0%"; tEl.textContent = "0:00 / " + fmt(cur.total);
    };
    au.addEventListener("ended", end);
    au.addEventListener("error", function () { if (useAudio && au.src) { useAudio = false; if (playing) { simT = 0; simAt = Date.now(); } } });
    playBtn.addEventListener("click", function () { playing ? stop() : start(); });
    $("callAll").addEventListener("click", function () { if (playing) stop(); shownAll = true; show(now()); });
    tabs.forEach(function (t, k) {
      t.addEventListener("click", function () { load(t.getAttribute("data-call")); });
      t.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return;
        var n = tabs[(k + d + tabs.length) % tabs.length]; n.focus(); n.click(); e.preventDefault();
      });
    });
    load("late");
  }

  /* ---------------------------------------------------------------- Explore the live demo: form -> instant demo access */
  // Soft gate on a static site: the unlock lives in localStorage so returning visitors go straight in.
  var KEY = "boris.try.v1", DEMO = C.DEMO_APP_URL || "https://boris148.github.io/boris-ai-demo/";
  var store = {
    get: function () { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } },
    set: function (v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} },
    clear: function () { try { localStorage.removeItem(KEY); } catch (e) {} },
  };
  var form = $("tryForm"), err = $("formErr"), panel = $("inPanel");
  var ctas = [].slice.call(document.querySelectorAll('[data-cta="try"]'));
  ctas.forEach(function (a) { a.setAttribute("data-label", a.textContent); });
  var setCtas = function (on) {
    ctas.forEach(function (a) {
      // same words on a return visit; the button just opens the demo straight away
      if (on) { a.href = DEMO; a.target = "_blank"; a.rel = "noopener"; }
      else { a.href = "#try"; a.removeAttribute("target"); a.removeAttribute("rel"); }
      a.textContent = a.getAttribute("data-label");
    });
  };
  var lines = function (v) { return ["Name: " + v.name, "Firm: " + v.firm, "Email: " + v.email, "Phone: " + v.phone, "Role: " + v.role, v.attorneys ? "Attorneys: " + v.attorneys : "", "Wants: " + (v.intent === "call" ? "a demo call" : "the live demo")].filter(Boolean).join("\n"); };
  var showPanel = function (v, sent, focus) {
    var first = (v.name || "").trim().split(/\s+/)[0];
    var call = v.intent === "call";
    $("inH").textContent = (focus === "back" ? "Welcome back" : "You're in") + (first ? ", " + first : "") + ".";
    $("inP").textContent = call
      ? "Pick a time for your walkthrough below. Meanwhile, the Boris demo is open to you: a sample firm with demo data."
      : "The Boris demo opens in a new tab: a sample firm with demo data. Start on Today, then tap Ask and give him a job.";
    var od = $("openDemo"), bk = $("bookCall");
    od.href = DEMO;
    bk.href = C.BOOKING_URL ? bookingUrl(v) : mailto(C.CONTACT_EMAIL || "", "Boris walkthrough for " + (v.firm || "my firm"), lines(v) + "\n\nGood times for a 20-minute call:\n");
    if (C.BOOKING_URL) { bk.target = "_blank"; bk.textContent = "Want a walkthrough? Book a 20-min call"; }
    else bk.textContent = "Want a walkthrough? Email us for a 20-min call";
    // one blue: the action they asked for
    od.className = "btn btn--block " + (call ? "btn--ghost" : "btn--primary");
    bk.className = "btn btn--block " + (call ? "btn--primary" : "btn--ghost");
    if (call) od.parentNode.insertBefore(bk, od); else od.parentNode.insertBefore(od, bk);
    var sb = $("sendBox");
    sb.hidden = !!sent;
    $("sendMail").href = mailto(C.CONTACT_EMAIL || "", "Boris: " + (call ? "demo call request" : "live demo sign-up"), lines(v));
    form.hidden = true; panel.hidden = false;
    setCtas(true);
    if (focus === "now") panel.focus();
  };
  if (form && panel) {
    var saved = store.get();
    if (saved && saved.email) showPanel(saved, saved.sent, "back");
    var lastIntent = "try";
    [$("btnTry"), $("btnCall")].forEach(function (b) { b.addEventListener("click", function () { lastIntent = b.value; }); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var intent = (e.submitter && e.submitter.value) || lastIntent;
      var bad = [];
      ["f-name", "f-firm", "f-email", "f-phone", "f-role"].forEach(function (fid) {
        var el = $(fid), v = el.value.trim();
        var ok = !!v && (el.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) && (el.type !== "tel" || v.replace(/\D/g, "").length >= 7);
        el.setAttribute("aria-invalid", ok ? "false" : "true");
        if (!ok) bad.push(el);
      });
      if (bad.length) {
        err.textContent = "Please add your name, firm, a work email, a phone number and your role.";
        err.hidden = false;
        bad[0].focus();
        return;
      }
      err.hidden = true;
      var data = new FormData(form); data.set("intent", intent);
      var v = { name: data.get("name"), firm: data.get("firm"), email: data.get("email"), phone: data.get("phone"), role: data.get("role"), attorneys: data.get("attorneys"), intent: intent, at: new Date().toISOString() };
      var finish = function (sent) { v.sent = sent; store.set(v); showPanel(v, sent, "now"); };
      if (C.DEMO_FORM_ACTION) {
        // access never waits on our server: unlock either way; if the POST failed, offer the email fallback
        fetch(C.DEMO_FORM_ACTION, { method: "POST", body: new URLSearchParams(data) })
          .then(function (r) { finish(!!r.ok); }, function () { finish(false); });
      } else finish(false); // no endpoint yet: be honest and offer "send my details by email"
    });
    $("notMe").addEventListener("click", function () {
      store.clear(); setCtas(false); panel.hidden = true; form.hidden = false; form.reset(); $("f-name").focus();
    });
  }

  /* ---------------------------------------------------------------- hero: the quiet walkthrough link */
  // goes straight to the booking page when there is one; otherwise to the form (the call intent)
  var hb = $("heroBook");
  if (hb && C.BOOKING_URL) { hb.href = C.BOOKING_URL; hb.target = "_blank"; hb.rel = "noopener"; }
  else if (hb) hb.addEventListener("click", function () { var b = $("btnCall"); if (b) setTimeout(function () { b.focus({ preventScroll: true }); }, 400); });
})();
