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
     price itself from its own table (src/prices.js), so JOBS below is for display only: keep them in sync.
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

  // Prices approved 10/24 09:57. Flat monthly price, never a cut of fees or settlements.
  // Online orders pay one launch fee (LAUNCH_FEE), waived on annual. Bigger custom deals are quoted on the walkthrough.
  LAUNCH_FEE: 995,
  // "Build your Boris" (/start/). Display copy + prices; the Worker's src/prices.js is what's charged.
  // includes: picking it removes those from the cart. covers (Full Team): auto-switch when they'd cost as much.
  JOBS: [
    { id: "receptionist", name: "Receptionist", line: "Every call answered, 24/7, in English or Spanish. Books callbacks, routes the urgent ones.", monthly: 1750 },
    { id: "intake", name: "Intake", line: "Includes the Receptionist. Qualifies new cases on the call and sends the retainer once you OK it.", monthly: 2500, includes: ["receptionist"] },
    { id: "case", name: "Case Manager", line: "Weekly client check-ins, chases records and bills, answers \"where's my case?\" from the file.", monthly: 1500 },
    { id: "marketing", name: "Marketing", line: "The analyst. Where your cases come from and what each signed case cost. Reviews and referrals.", monthly: 750 },
    { id: "ads", name: "Ads Manager", line: "Runs your Meta, Google Ads and Local Services ads for signed cases. Asks before spending more.", monthly: 1500, addon: 1000, fine: "$1,000/mo when added to any other job. Ad spend is paid to the platforms, not to us." },
    { id: "full", name: "Full Team", line: "Receptionist, Intake, Case Manager and Marketing. Every core job, one price.", monthly: 3500, covers: ["receptionist", "intake", "case", "marketing"], featured: true },
    { id: "paralegal", name: "Paralegal", line: "Records, bills, liens, PIP and deadlines for up to 200 open files. Needs your case software hookup.", monthly: 2500, walkthrough: true },
  ],
  SEATS: [
    {
      id: "answers",
      name: "Answers",
      job: "Receptionist",
      start: "receptionist",
      setup: 995,
      foundingSetup: 0,
      monthly: 1750,
      selfServe: true,
      lines: ["Answers every call, 24/7", "English and Spanish", "Takes the message, books the callback", "Every call summed up and logged"],
    },
    {
      id: "intake",
      name: "Intake",
      job: "Receptionist + Intake",
      start: "intake",
      setup: 995,
      monthly: 2500,
      lines: ["Everything in Answers", "Qualifies new cases on the call", "Sends the retainer once you OK it", "Calls back leads until they sign or say no"],
    },
    {
      id: "full",
      name: "Full Team",
      job: "Receptionist, Intake, Case Manager, Marketing",
      start: "full",
      setup: 995,
      monthly: 3500,
      featured: true,
      lines: ["Everything in Intake", "Case Manager: weekly client check-ins", "Marketing: where cases come from, cost per case", "Works inside your case software"],
    },
  ],
  ADDON: {
    name: "Paralegal seat",
    monthly: 2500,
    line: "Records, bills, liens, PIP and deadlines for up to 200 open files per seat. Starts with a 20-minute walkthrough (it needs your case software hookup and a signed BAA).",
  },
  // The Ads Manager (media buyer): $1,000/mo added to any job, $1,500/mo on its own.
  ADS_ADDON: {
    name: "Ads Manager",
    monthly: 1000,
    standalone: 1500,
    line: "Add to any plan. Runs your Meta, Google Ads and Local Services accounts for signed cases. Ad spend is paid to the platforms, not to us.",
  },
};
