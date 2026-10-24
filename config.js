/* Boris site settings. The only file to edit before publishing.
   SHOW_PRICES: true = the DRAFT founding prices show; false = "Book a demo for pricing" on every seat.
   DEMO_FORM_ACTION: empty = the form shows a thank-you state and a mailto fallback (nothing is sent).
     Set it to a form endpoint (POST, application/x-www-form-urlencoded) to collect requests.
   STRIPE_CHECKOUT_URL: empty = "Start now" opens the form with "Start now with Answers" picked.
     Set it to a Stripe Payment Link for the Answers seat to let firms pay on the spot.
   GUARANTEE: the one guarantee shown on the page (see tmp/boris-site-v2/OFFER.md for the options).
   FOUNDING_SPOTS_LEFT: null = no counter. Only set a real number. Never a made-up one.
   SHOW_PROOF_SLOTS: true = dashed "results go here" boxes (staging). Set false to hide until real results exist. */
window.BORIS_SITE = {
  SHOW_PRICES: false, // live: off until Jeremy confirms the draft prices
  DEMO_FORM_ACTION: "",
  STRIPE_CHECKOUT_URL: "",
  CONTACT_EMAIL: "boris@socialelitemarketinggroup.com", // switch to contact@hireboris.com once the domain + inbox exist
  PARTNER_EMAIL: "boris@socialelitemarketinggroup.com",
  FOUNDING_SPOTS_LEFT: null,
  SHOW_PROOF_SLOTS: true,
  ANNUAL_MONTHS_FREE: 2,

  GUARANTEE: {
    name: "The Every Call Guarantee",
    line: "If Boris misses a call sent to him or fails to log it in your first 30 days, your next month is free.",
    fine: "Counts every call your firm forwards to Boris. We send you the call log so you can check.",
  },

  // DRAFT prices (not confirmed). Flat monthly price, never a cut of fees or settlements.
  // Founding firms: setup waived, monthly price locked for as long as they stay.
  SEATS: [
    {
      id: "answers",
      name: "Answers",
      job: "Receptionist",
      setup: 2500,
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
