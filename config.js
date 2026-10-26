/* Boris site settings. The only file to edit before publishing.
   DEMO_APP_URL: where "Explore the live demo" goes after the form (opens in a new tab).
   DEMO_FORM_ACTION: empty = nothing is sent anywhere; the visitor still gets demo access, plus a
     "send my details by email" button. Set it to a form endpoint (POST, application/x-www-form-urlencoded)
     to collect sign-ups; the field "intent" is "try" or "call".
   BOOKING_URL: a scheduling link for the 20-minute walkthrough. Empty = the button writes an email instead.
   CALL_AUDIO: true = the example calls play audio (audio/*.mp3); false = transcript-only players.
   SHOW_PRICES: true = prices show (approved 10/24); false = "Book a demo call for pricing".
   START_URL: the "Build your Boris" self-serve checkout page. Empty = no "Hire Boris now" buttons anywhere.
   CHECKOUT_API: the boris-checkout Cloudflare Worker (projects/boris-checkout-worker). It recomputes every
     price itself from its own table (src/prices.js), so JOBS/PLAN/ADS_ADDON below are for display only: keep them in sync.
   VIDEO: the "Watch Boris work a day at a firm" video under the hero. VIDEO_SOUND = true when it has a voiceover.
   FOUNDING / GUARANTEE / SHOW_PROOF_SLOTS: off until confirmed. Proof slots are never filled with made-up results. */
window.BORIS_SITE = {
  DEMO_APP_URL: "https://hireboris.com/demo/",
  DEMO_FORM_ACTION: "https://boris-leads.hireboris.workers.dev/",
  BOOKING_URL: "https://api.leadconnectorhq.com/widget/booking/ys5VGNHlqc0LOathxxMi",
  CALL_AUDIO: true,
  SHOW_PRICES: true,
  START_URL: "/start/",
  CHECKOUT_API: "https://boris-checkout.hireboris.workers.dev",
  VIDEO: true,
  VIDEO_SOUND: true,
  CONTACT_EMAIL: "boris@socialelitemarketinggroup.com",
  PARTNER_EMAIL: "boris@socialelitemarketinggroup.com",
  SHOW_PROOF_SLOTS: false,
  ANNUAL_MONTHS_FREE: 2,

  FOUNDING: {
    on: false, // off until confirmed
    name: "The Boris Founding Firm Program",
    line: "One personal injury firm per market. Once your metro is taken, it's closed.",
    spotsLeft: null,
  },

  GUARANTEE: {
    on: false, // off until confirmed
    name: "The Every Call Guarantee",
    line: "If Boris misses a call your firm sends him, or fails to log it, in your first 30 days, your next month is free.",
    fine: "Counts every call your firm forwards to Boris. You get the full call log, so you can check it yourself.",
  },

  // 10/26 ONE PLAN (Jeremy 03:50): Boris $1,997/mo, everything included; annual = 10x ($19,970/yr, 2 months free).
  // Ads Manager: + $1,000/mo on the plan, $1,500/mo on its own. Case Manager + Paralegal: early access, walkthrough only.
  // Flat monthly price, never a cut of fees or settlements. Online orders pay one launch fee, waived on annual.
  LAUNCH_FEE: 995,
  // The checkout Worker's price table, mirrored (projects/boris-checkout-worker/src/prices.js is what's charged; keep in sync).
  // Only `sold` jobs are offered on the site; the rest stay in the Worker for old ?jobs= links, pilots and old carts.
  JOBS: [
    { id: "boris", name: "Boris", monthly: 1997, sold: true, jobs: ["intake", "receptionist", "marketing"] },
    { id: "ads", name: "Ads Manager", monthly: 1500, addon: 1000, sold: true },
    { id: "receptionist", name: "Receptionist", monthly: 1750 },
    { id: "intake", name: "Intake", monthly: 2500 },
    { id: "case", name: "Case Manager", monthly: 1500 },
    { id: "marketing", name: "Marketing", monthly: 750 },
    { id: "full", name: "Full Team", monthly: 3500 },
    { id: "growth", name: "Growth", monthly: 3500 },
  ],
  // the one plan card (home #pricing) and the plan on /start/
  PLAN: {
    id: "boris",
    name: "Boris",
    tag: "One plan · everything included",
    job: "Every job below, one flat price",
    line: "Receptionist, Intake and Marketing, every call recorded and transcribed, the Firm Brain, chat and the app for your whole firm.",
    lines: [
      "Receptionist: every call answered 24/7, in English or Spanish, after hours too",
      "Intake: qualifies new cases on the call and sends the retainer once you OK it",
      "Marketing: where your cases come from and what each signed case cost",
      "Every call recorded and transcribed",
      "The Firm Brain: your rules, team and open cases",
      "Just tell him: chat with Boris and he gets it done",
      "The Boris app for your whole firm, no per-user fees",
    ],
  },
  // Ads Manager (media buyer): added to Boris, or on its own (the quiet path for firms that only want the ads run)
  ADS_ADDON: {
    name: "Ads Manager",
    monthly: 1000,
    standalone: 1500,
    line: "Boris runs your Meta, Google Ads and Local Services ads for signed cases, and asks before spending more. Ad spend is paid to the platforms, not to us.",
    alone: "Just want Boris on your ads?",
  },
  // not sold online: shown without prices, starts with the walkthrough
  EARLY_ACCESS: {
    name: "Case Manager and Paralegal",
    label: "Early access · pilot firms",
    line: "Client check-ins, records, bills, liens and deadlines. We're turning these on with a few pilot firms first (the Paralegal needs your case software hookup and a signed BAA).",
  },
};
