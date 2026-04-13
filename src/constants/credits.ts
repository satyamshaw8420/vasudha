import type { PlasticType } from "../types";

export const CREDIT_RATES: Record<PlasticType, number> = {
  PET: 10,
  HDPE: 8,
  PP: 6,
  LDPE: 4,
  PVC: 0,
  PS: 0,
  OTHER: 0
};

export const BONUS_CREDITS = {
  FIRST_SCAN: 50,
  TENTH_PICKUP_BONUS: 100,
};

export const REDEMPTION_TIERS = [
  { credits: 100, valueIINR: 10 },
  { credits: 500, valueIINR: 60 }
];

export const MINIMUM_REDEMPTION_CREDITS = 200;
