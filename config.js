/* Boris site settings. The only file to edit before publishing.
   LIVE-SAFE DEFAULTS: anything Jeremy hasn't confirmed (prices, guarantee, founding scarcity, proof) is OFF.
   SHOW_PRICES: true = the DRAFT founding prices show and Answers gets "Start now"; false = "Book a demo for pricing".
   DEMO_FORM_ACTION: empty = the form ends with a "send it by email" button (nothing is sent anywhere).
     Set it to a form endpoint (POST, application/x-www-form-urlencoded) to collect requests.
   STRIPE_CHECKOUT_URL: empty = "Start now" opens the form with "Start now with Answers" picked.
     Set it to a Stripe Payment Link for the Answers seat to let firms pay on the spot.
   FOUNDING.on: true = "Founding firms, one per market" block, "Check if your market is open" CTAs and the price lock.
     Only turn on once we keep a real market list. FOUNDING.spotsLeft: null = no counter; only ever a real number.
   GUARANTEE.on: true = the guarantee block + FAQ answer. Pick one of the options in tmp/boris-site-v2/OFFER.md first.
   SHOW_PROOF_SLOTS: true = dashed "results go here" boxes (staging review only). Never fill with made-up results. */
window.BORIS_SITE = {
  SHOW_PRICES: false, // live: off until Jeremy confirms the draft prices
  DEMO_FORM_ACTION: "",
  STRIPE_CHECKOUT_URL: "",
  CONTACT_EMAIL: "boris@socialelitemarketinggroup.com", // switch to contact@hireboris.com once the domain + inbox exist
  PARTNER_EMAIL: "boris@socialelitemarketinggroup.com",
  SHOW_PROOF_SLOTS: false,
  ANNUAL_MONTHS_FREE: 2,

  FOUNDING: {
    on: false, // live: off until Jeremy OKs one-firm-per-market and we track markets
    name: "The Boris Founding Firm Program",
    line: "One personal injury firm per market. Once your metro is taken, it's closed.",
    spotsLeft: null,
  },

  GUARANTEE: {
    on: false, // live: off until Jeremy picks a guarantee
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
      lines: ["Everything in Intake", "Case Manager: weekly client check-ins", "Marketing: lead follow-up and cost per case", "Works inside your case software"],
    },
  ],
  ADDON: {
    name: "Paralegal seat",
    monthly: 2500,
    line: "Add to Full Team. Records, bills, liens, PIP and deadlines for up to 200 open files per seat.",
  },
};
