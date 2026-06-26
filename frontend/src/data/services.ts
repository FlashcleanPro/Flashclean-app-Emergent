// UI-only static constants (icons, labels, plan visuals).
// Real data (services, prices, bookings) comes from Supabase.

import { colors } from "@/src/theme";

export const PLANS = [
  { id: "weekly", label: "Semanal", discount: "-20%", from: "8,99€/h", popular: true, frequency: "weekly" },
  { id: "biweekly", label: "Quinzenal", discount: "-10%", from: "9,99€/h", popular: false, frequency: "biweekly" },
  { id: "monthly", label: "Mensal", discount: "-5%", from: "14,99€/h", popular: false, frequency: "monthly" },
];

export const BENEFITS = [
  { id: "verified", label: "Profissionais\nverificados", icon: "shield-check", color: colors.brand },
  { id: "eco", label: "Produtos\necológicos", icon: "leaf", color: colors.iconGreen },
  { id: "payment", label: "Pagamento\nseguro", icon: "lock", color: colors.iconPurple },
  { id: "support", label: "Apoio 24/7", icon: "headset", color: colors.iconOrange },
];

export const STEPS = [
  { id: 1, label: "Escolhe", icon: "flash" },
  { id: 2, label: "Personaliza", icon: "account" },
  { id: 3, label: "Agenda", icon: "calendar" },
  { id: 4, label: "Paga", icon: "credit-card" },
  { id: 5, label: "Relaxa", icon: "emoticon-happy" },
];

// Map service.icon (string from DB) to a MaterialCommunityIcons glyph.
export function mapServiceIcon(icon: string | null | undefined): string {
  switch ((icon || "").toLowerCase()) {
    case "home":
      return "home-variant";
    case "hard-hat":
      return "hard-hat";
    case "store":
      return "storefront";
    case "building":
      return "office-building";
    case "apartment":
      return "home-city";
    case "car":
      return "car";
    case "sofa":
      return "sofa";
    case "broom":
      return "broom";
    default:
      return "spray-bottle";
  }
}
