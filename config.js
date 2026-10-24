/* Boris site settings. The only file to edit before publishing.
   DEMO_APP_URL: where "Explore the live demo" goes after the form (opens in a new tab).
   DEMO_FORM_ACTION: empty = nothing is sent anywhere; the visitor still gets demo access, plus a
     "send my details by email" button. Set it to a form endpoint (POST, application/x-www-form-urlencoded)
     to collect sign-ups; the field "intent" is "try" or "call".
   BOOKING_URL: a scheduling link for the 20-minute walkthrough. Empty = the button writes an email instead.
   CALL_AUDIO: true = the example calls play audio (audio/*.mp3); false = transcript-only players.
   SHOW_PRICES: true = the draft prices show; false = "Book a demo call for pricing".
   STRIPE_CHECKOUT_URL: set to a Stripe Payment Link to show "Start now" on the Answers seat (prices on only).
   FOUNDING / GUARANTEE / SHOW_PROOF_SLOTS: off until confirmed. Proof slots are never filled with made-up results. */
window.BORIS_SITE = {
  DEMO_APP_URL: "https://hireboris.com/demo/",
  DEMO_FORM_ACTION: "https://boris-leads.hireboris.workers.dev/",
  BOOKING_URL: "https://api.leadconnectorhq.com/widget/booking/ys5VGNHlqc0LOathxxMi",
  CALL_AUDIO: true,
  SHOW_PRICES: false,
  STRIPE_CHECKOUT_URL: "",
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

  // DRAFT prices (not confirmed). Flat monthly price, never a cut of fees or settlements.
  // Founding firms: setup waived on Answers, monthly price locked for as long as they stay.
  SEATS: [
    {
      id: "answers",
      name: "Answers",
      job: "Receptionist",
      setup: 2500,
      foundingSetup: 0,
      monthly: 1750,
      selfServe: true,
      lines: ["Answers every call, 24/7", "English and Spanish", "Takes the message, books the callback", "Every call summed up and logged"],
    },
    {
      id: "intake",
      name: "Intake",
      job: "Receptionist + Intake",
      setup: 2500,
      monthly: 2500,
      lines: ["Everything in Answers", "Qualifies new cases on the call", "Sends the retainer once you OK it", "Calls back leads until they sign or say no"],
    },
    {
      id: "full",
      name: "Full Team",
      job: "Every job",
      setup: 5000,
      foundingSetup: 2500,
      monthly: 3500,
      featured: true,
      lines: ["Everything in Intake", "Case Manager: weekly client check-ins", "Marketing: where cases come from, cost per case", "Works inside your case software"],
    },
  ],
  ADDON: {
    name: "Paralegal seat",
    monthly: 2500,
    line: "Add to Full Team. Records, bills, liens, PIP and deadlines for up to 200 open files per seat.",
  },
  // DRAFT: the Ads Manager (media buyer) add-on. monthly: null = no price set yet, so it shows
  // "Price on a demo call" even when SHOW_PRICES is on. Set a number to show it.
  ADS_ADDON: {
    name: "Ads Manager",
    monthly: null,
    line: "Add to any plan. Runs your Meta, Google Ads and Local Services accounts for signed cases. Ad spend is paid to the platforms, not to us.",
  },
};
