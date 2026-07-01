import { SCHEMA_VERSION } from "../config.js";

export function createEmptyQuestionnaire() {
  return {
    schemaVersion: SCHEMA_VERSION,
    clientBudget: {
      budgetRange: "",
      targetSpend: null,
      budgetType: "",
      budgetNotes: null,
    },
    guestAccountBooking: {
      accountMode: "",
      guestJourney: "",
      bookingConfirmation: "",
      cancelOnline: "",
      cancelConditions: null,
    },
    propertyRules: {
      hasPropertyRules: null,
      propertyRulesText: null,
      minimumAge: null,
      maximumGuests: null,
      pets: "",
      petsNotes: null,
      eventsParties: "",
      cancellationPolicies: "",
      hasLiabilityWaivers: null,
      liabilityWaiversText: null,
      requiresSignature: null,
      signatureDetails: null,
      localRegulations: "",
      hasSecurityDeposit: null,
      securityDepositDetails: null,
    },
    availability: {
      manageAvailability: null,
      blockDates: null,
      sameDayReservations: null,
      checkInOutMode: "",
      checkInTime: null,
      checkOutTime: null,
      flexibleDetails: null,
    },
    payments: {
      paymentMethods: [],
      paymentMethodsOther: null,
      payDuringBooking: null,
      paymentTiming: "",
      pricePerNight: null,
      cleaningFee: null,
      serviceFee: null,
      petFee: null,
      cancelBehavior: "",
      automaticRefunds: "",
      refundDetails: null,
    },
    pricingRules: {
      seasonalPricing: null,
      seasonalPricingDetails: null,
      holidayEventRates: null,
      holidayEventRatesDetails: null,
    },
    propertyDetails: {
      amenities: "",
      nearbyAttractions: "",
    },
  };
}

function readRadio(form, name) {
  const selected = form.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : "";
}

function readBooleanRadio(form, name) {
  const value = readRadio(form, name);
  if (value === "yes") return true;
  if (value === "no") return false;
  return null;
}

function readNumber(form, name) {
  const input = form.elements[name];
  if (!input || input.value === "") return null;
  const parsed = Number(input.value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readText(form, name) {
  const input = form.elements[name];
  if (!input) return "";
  return input.value.trim();
}

function readOptionalText(form, name) {
  const value = readText(form, name);
  return value === "" ? null : value;
}

function readCheckboxes(form, name) {
  return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map(
    (el) => el.value,
  );
}

export function serializeFromForm(form) {
  const data = createEmptyQuestionnaire();

  data.clientBudget = {
    budgetRange: readRadio(form, "budgetRange"),
    targetSpend: readNumber(form, "targetSpend"),
    budgetType: readRadio(form, "budgetType"),
    budgetNotes: readOptionalText(form, "budgetNotes"),
  };

  data.guestAccountBooking = {
    accountMode: readRadio(form, "accountMode"),
    guestJourney: readText(form, "guestJourney"),
    bookingConfirmation: readRadio(form, "bookingConfirmation"),
    cancelOnline: readRadio(form, "cancelOnline"),
    cancelConditions: readOptionalText(form, "cancelConditions"),
  };

  data.propertyRules = {
    hasPropertyRules: readBooleanRadio(form, "hasPropertyRules"),
    propertyRulesText: readOptionalText(form, "propertyRulesText"),
    minimumAge: readNumber(form, "minimumAge"),
    maximumGuests: readNumber(form, "maximumGuests"),
    pets: readText(form, "pets"),
    petsNotes: readOptionalText(form, "petsNotes"),
    eventsParties: readText(form, "eventsParties"),
    cancellationPolicies: readText(form, "cancellationPolicies"),
    hasLiabilityWaivers: readBooleanRadio(form, "hasLiabilityWaivers"),
    liabilityWaiversText: readOptionalText(form, "liabilityWaiversText"),
    requiresSignature: readBooleanRadio(form, "requiresSignature"),
    signatureDetails: readOptionalText(form, "signatureDetails"),
    localRegulations: readText(form, "localRegulations"),
    hasSecurityDeposit: readBooleanRadio(form, "hasSecurityDeposit"),
    securityDepositDetails: readOptionalText(form, "securityDepositDetails"),
  };

  data.availability = {
    manageAvailability: readBooleanRadio(form, "manageAvailability"),
    blockDates: readBooleanRadio(form, "blockDates"),
    sameDayReservations: readBooleanRadio(form, "sameDayReservations"),
    checkInOutMode: readRadio(form, "checkInOutMode"),
    checkInTime: readOptionalText(form, "checkInTime"),
    checkOutTime: readOptionalText(form, "checkOutTime"),
    flexibleDetails: readOptionalText(form, "flexibleDetails"),
  };

  data.payments = {
    paymentMethods: readCheckboxes(form, "paymentMethods"),
    paymentMethodsOther: readOptionalText(form, "paymentMethodsOther"),
    payDuringBooking: readBooleanRadio(form, "payDuringBooking"),
    paymentTiming: readRadio(form, "paymentTiming"),
    pricePerNight: readNumber(form, "pricePerNight"),
    cleaningFee: readNumber(form, "cleaningFee"),
    serviceFee: readNumber(form, "serviceFee"),
    petFee: readNumber(form, "petFee"),
    cancelBehavior: readText(form, "cancelBehavior"),
    automaticRefunds: readRadio(form, "automaticRefunds"),
    refundDetails: readOptionalText(form, "refundDetails"),
  };

  data.pricingRules = {
    seasonalPricing: readBooleanRadio(form, "seasonalPricing"),
    seasonalPricingDetails: readOptionalText(form, "seasonalPricingDetails"),
    holidayEventRates: readBooleanRadio(form, "holidayEventRates"),
    holidayEventRatesDetails: readOptionalText(form, "holidayEventRatesDetails"),
  };

  data.propertyDetails = {
    amenities: readText(form, "amenities"),
    nearbyAttractions: readText(form, "nearbyAttractions"),
  };

  return data;
}

function setRadio(form, name, value) {
  if (value === null || value === undefined || value === "") return;
  const input = form.querySelector(`input[name="${name}"][value="${value}"]`);
  if (input) input.checked = true;
}

function setBooleanRadio(form, name, value) {
  if (value === true) setRadio(form, name, "yes");
  else if (value === false) setRadio(form, name, "no");
}

function setField(form, name, value) {
  const input = form.elements[name];
  if (!input || value === null || value === undefined) return;
  input.value = value;
}

function setCheckboxes(form, name, values) {
  if (!Array.isArray(values)) return;
  form.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.checked = values.includes(input.value);
  });
}

export function hydrateForm(form, data) {
  if (!data) return;

  const budget = data.clientBudget || {};
  setRadio(form, "budgetRange", budget.budgetRange);
  setField(form, "targetSpend", budget.targetSpend);
  setRadio(form, "budgetType", budget.budgetType);
  setField(form, "budgetNotes", budget.budgetNotes || "");

  const guest = data.guestAccountBooking || {};
  setRadio(form, "accountMode", guest.accountMode);
  setField(form, "guestJourney", guest.guestJourney);
  setRadio(form, "bookingConfirmation", guest.bookingConfirmation);
  setRadio(form, "cancelOnline", guest.cancelOnline);
  setField(form, "cancelConditions", guest.cancelConditions || "");

  const rules = data.propertyRules || {};
  setBooleanRadio(form, "hasPropertyRules", rules.hasPropertyRules);
  setField(form, "propertyRulesText", rules.propertyRulesText || "");
  setField(form, "minimumAge", rules.minimumAge);
  setField(form, "maximumGuests", rules.maximumGuests);
  setField(form, "pets", rules.pets);
  setField(form, "petsNotes", rules.petsNotes || "");
  setField(form, "eventsParties", rules.eventsParties);
  setField(form, "cancellationPolicies", rules.cancellationPolicies);
  setBooleanRadio(form, "hasLiabilityWaivers", rules.hasLiabilityWaivers);
  setField(form, "liabilityWaiversText", rules.liabilityWaiversText || "");
  setBooleanRadio(form, "requiresSignature", rules.requiresSignature);
  setField(form, "signatureDetails", rules.signatureDetails || "");
  setField(form, "localRegulations", rules.localRegulations);
  setBooleanRadio(form, "hasSecurityDeposit", rules.hasSecurityDeposit);
  setField(form, "securityDepositDetails", rules.securityDepositDetails || "");

  const availability = data.availability || {};
  setBooleanRadio(form, "manageAvailability", availability.manageAvailability);
  setBooleanRadio(form, "blockDates", availability.blockDates);
  setBooleanRadio(form, "sameDayReservations", availability.sameDayReservations);
  setRadio(form, "checkInOutMode", availability.checkInOutMode);
  setField(form, "checkInTime", availability.checkInTime || "");
  setField(form, "checkOutTime", availability.checkOutTime || "");
  setField(form, "flexibleDetails", availability.flexibleDetails || "");

  const payments = data.payments || {};
  setCheckboxes(form, "paymentMethods", payments.paymentMethods);
  setField(form, "paymentMethodsOther", payments.paymentMethodsOther || "");
  setBooleanRadio(form, "payDuringBooking", payments.payDuringBooking);
  setRadio(form, "paymentTiming", payments.paymentTiming);
  setField(form, "pricePerNight", payments.pricePerNight);
  setField(form, "cleaningFee", payments.cleaningFee);
  setField(form, "serviceFee", payments.serviceFee);
  setField(form, "petFee", payments.petFee);
  setField(form, "cancelBehavior", payments.cancelBehavior);
  setRadio(form, "automaticRefunds", payments.automaticRefunds);
  setField(form, "refundDetails", payments.refundDetails || "");

  const pricing = data.pricingRules || {};
  setBooleanRadio(form, "seasonalPricing", pricing.seasonalPricing);
  setField(form, "seasonalPricingDetails", pricing.seasonalPricingDetails || "");
  setBooleanRadio(form, "holidayEventRates", pricing.holidayEventRates);
  setField(form, "holidayEventRatesDetails", pricing.holidayEventRatesDetails || "");

  const details = data.propertyDetails || {};
  setField(form, "amenities", details.amenities);
  setField(form, "nearbyAttractions", details.nearbyAttractions);
}

function isEmpty(value) {
  return value === null || value === undefined || value === "";
}

export function validateQuestionnaire(data) {
  const errors = [];
  const warnings = [];

  if (!data.clientBudget?.budgetRange) {
    errors.push("Please select a budget range.");
  }
  if (!data.clientBudget?.budgetType) {
    errors.push("Please indicate whether your budget is one-time or includes ongoing costs.");
  }
  if (
    data.clientBudget?.budgetRange === "not_sure" &&
    isEmpty(data.clientBudget?.targetSpend) &&
    isEmpty(data.clientBudget?.budgetNotes)
  ) {
    warnings.push(
      "You selected \"Not sure\" for budget range. Consider adding a target amount or notes to help us scope the project.",
    );
  }

  if (!data.guestAccountBooking?.accountMode) {
    errors.push("Please select whether guests need accounts or can book as guests.");
  }
  if (!data.guestAccountBooking?.guestJourney) {
    errors.push("Please describe the guest booking journey.");
  }
  if (!data.guestAccountBooking?.bookingConfirmation) {
    errors.push("Please select a booking confirmation approach.");
  }
  if (!data.guestAccountBooking?.cancelOnline) {
    errors.push("Please indicate whether guests can cancel online.");
  }

  if (data.propertyRules?.hasPropertyRules === null) {
    errors.push("Please indicate whether there are property-specific rules.");
  }
  if (!data.propertyRules?.pets) errors.push("Please select a pets policy.");
  if (!data.propertyRules?.eventsParties) {
    errors.push("Please select an events/parties policy.");
  }
  if (!data.propertyRules?.cancellationPolicies) {
    errors.push("Please describe your cancellation policies.");
  }
  if (data.propertyRules?.hasLiabilityWaivers === null) {
    errors.push("Please indicate whether liability waivers apply.");
  }
  if (data.propertyRules?.requiresSignature === null) {
    errors.push("Please indicate whether guests must sign anything before staying.");
  }
  if (!data.propertyRules?.localRegulations) {
    errors.push("Please describe local regulations or rental restrictions.");
  }
  if (data.propertyRules?.hasSecurityDeposit === null) {
    errors.push("Please indicate whether security deposits are required.");
  }

  if (data.availability?.manageAvailability === null) {
    errors.push("Please indicate whether you want to manage availability.");
  }
  if (data.availability?.blockDates === null) {
    errors.push("Please indicate whether you want to block dates.");
  }
  if (data.availability?.sameDayReservations === null) {
    errors.push("Please indicate whether same-day reservations are allowed.");
  }
  if (!data.availability?.checkInOutMode) {
    errors.push("Please select whether check-in/out times are fixed or flexible.");
  }

  if (!data.payments?.paymentMethods?.length) {
    errors.push("Please select at least one guest payment method.");
  }
  if (data.payments?.payDuringBooking === null) {
    errors.push("Please indicate whether payment happens during booking.");
  }
  if (!data.payments?.paymentTiming) {
    errors.push("Please select a payment timing preference.");
  }
  if (!data.payments?.cancelBehavior) {
    errors.push("Please describe what happens if a guest cancels.");
  }
  if (!data.payments?.automaticRefunds) {
    errors.push("Please select an automatic refunds preference.");
  }

  if (data.pricingRules?.seasonalPricing === null) {
    errors.push("Please indicate whether seasonal pricing applies.");
  }
  if (data.pricingRules?.holidayEventRates === null) {
    errors.push("Please indicate whether holiday or event rates apply.");
  }

  if (!data.propertyDetails?.amenities) {
    errors.push("Please list the lake house amenities.");
  }
  if (!data.propertyDetails?.nearbyAttractions) {
    errors.push("Please list nearby attractions.");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function getBudgetSoftWarning(data) {
  const budget = data.clientBudget || {};
  if (
    budget.budgetRange === "not_sure" &&
    isEmpty(budget.targetSpend) &&
    isEmpty(budget.budgetNotes)
  ) {
    return 'You selected "Not sure" for budget range. Adding a target amount or notes helps us recommend the right scope.';
  }
  return null;
}
