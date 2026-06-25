// Static services data for FlashClean
import { colors } from "@/src/theme";

export type Service = {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  badgeColor: string;
  iconName: "home" | "office-building" | "tools" | "car" | "sofa" | "broom";
  rating: number;
  reviews: string;
  priceFrom: number;
  image: string;
  description: string;
};

export const SERVICES: Service[] = [
  {
    id: "casas",
    name: "Limpeza de Casas",
    shortName: "Casas",
    badge: "Mais Reservado",
    badgeColor: colors.accent,
    iconName: "home",
    rating: 4.9,
    reviews: "320+",
    priceFrom: 35.99,
    image:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=70",
    description: "Limpeza completa para o seu lar com produtos ecológicos.",
  },
  {
    id: "escritorios",
    name: "Limpeza de Escritórios",
    shortName: "Escritórios",
    badge: "Melhor Avaliado",
    badgeColor: colors.brand,
    iconName: "office-building",
    rating: 4.9,
    reviews: "180+",
    priceFrom: 35.99,
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=70",
    description: "Espaços de trabalho impecáveis e produtividade renovada.",
  },
  {
    id: "pos-obra",
    name: "Limpeza Pós-Obra",
    shortName: "Pós-Obra",
    badge: "Rápida",
    badgeColor: colors.iconGreen,
    iconName: "tools",
    rating: 4.8,
    reviews: "150+",
    priceFrom: 69.99,
    image:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=70",
    description: "Remova pó, tinta e detritos após obras de remodelação.",
  },
  {
    id: "carros",
    name: "Limpeza Automóvel",
    shortName: "Automóvel",
    badge: "Novo",
    badgeColor: colors.iconPurple,
    iconName: "car",
    rating: 4.7,
    reviews: "90+",
    priceFrom: 19.99,
    image:
      "https://images.unsplash.com/photo-1605164599901-db7f68c4b1a3?auto=format&fit=crop&w=800&q=70",
    description: "Lavagem completa interior e exterior ao domicílio.",
  },
  {
    id: "estofos",
    name: "Limpeza de Estofos",
    shortName: "Estofos",
    badge: "Premium",
    badgeColor: colors.iconOrange,
    iconName: "sofa",
    rating: 4.8,
    reviews: "75+",
    priceFrom: 49.99,
    image:
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=70",
    description: "Tratamento profundo de sofás, colchões e cadeiras.",
  },
  {
    id: "vidros",
    name: "Limpeza de Vidros",
    shortName: "Vidros",
    badge: "Express",
    badgeColor: colors.brand,
    iconName: "broom",
    rating: 4.6,
    reviews: "60+",
    priceFrom: 24.99,
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=70",
    description: "Janelas e vidros brilhantes, sem manchas.",
  },
];

export const PLANS = [
  { id: "weekly", label: "Semanal", discount: "-20%", from: "8,99€/h", popular: true },
  { id: "biweekly", label: "Quinzenal", discount: "-10%", from: "9,99€/h", popular: false },
  { id: "monthly", label: "Mensal", discount: "-5%", from: "14,99€/h", popular: false },
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
