import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import QuickBookingSheet from "@/src/components/QuickBookingSheet";
import { BENEFITS, PLANS, SERVICES, STEPS } from "@/src/data/services";
import { colors, radii, shadow, spacing } from "@/src/theme";

function Logo() {
  return (
    <View style={styles.logoWrap} testID="header-logo">
      <View style={styles.boltCircle}>
        <MaterialCommunityIcons name="flash" size={20} color="#fff" />
      </View>
      <View>
        <Text style={styles.logoText}>
          <Text style={{ color: colors.brand }}>Flash</Text>
          <Text style={{ color: colors.text }}>Clean</Text>
        </Text>
        <Text style={styles.logoTag}>LIMPEZA PROFISSIONAL</Text>
      </View>
    </View>
  );
}

function ServiceIcon({ name, color }: { name: string; color: string }) {
  const map: Record<string, any> = {
    home: "home-variant",
    "office-building": "office-building",
    tools: "tools",
    car: "car",
    sofa: "sofa",
    broom: "broom",
  };
  return <MaterialCommunityIcons name={map[name] ?? "home-variant"} size={22} color={color} />;
}

export default function HomeScreen() {
  const [search, setSearch] = useState("");
  const [quickOpen, setQuickOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>();

  const openBooking = (id?: string) => {
    setSelectedService(id);
    setQuickOpen(true);
  };

  const topServices = SERVICES.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        testID="home-scroll"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Logo />
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} testID="header-notifications">
              <MaterialCommunityIcons name="bell-outline" size={20} color={colors.text} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} testID="header-messages">
              <MaterialCommunityIcons name="message-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* TITLE */}
        <Text style={styles.title}>O que pretende limpar hoje?</Text>
        <Text style={styles.subtitle}>Reserve em menos de 60 segundos.</Text>

        {/* SEARCH */}
        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
            <TextInput
              testID="home-search-input"
              style={styles.searchInput}
              placeholder="Procurar serviço"
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn} testID="home-filter-button">
            <MaterialCommunityIcons name="tune-variant" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* BANNER */}
        <View style={styles.banner} testID="home-banner">
          <View style={styles.bannerLeft}>
            <View style={styles.promoTag}>
              <MaterialCommunityIcons name="tag" size={12} color={colors.brandDark} />
              <Text style={styles.promoText}>Até 50% OFF na primeira reserva</Text>
            </View>
            <Text style={styles.bannerTitleWhite}>Limpeza Profissional</Text>
            <Text style={styles.bannerTitleYellow}>em poucos cliques</Text>
            <Text style={styles.bannerDesc}>
              Escolha o serviço, personalize as opções e reserve online em menos de 1 minuto.
            </Text>
            <TouchableOpacity
              style={styles.bannerBtn}
              onPress={() => openBooking()}
              testID="banner-reservar-button"
            >
              <Text style={styles.bannerBtnText}>Reservar Serviço</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color={colors.brand} />
            </TouchableOpacity>
          </View>

          <View style={styles.bannerRight}>
            <Image
              source="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=70"
              style={styles.bannerImage}
              contentFit="cover"
            />
            <View style={styles.bannerBadge}>
              <View style={styles.bannerBadgeAvatars}>
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.avatarDot,
                      { left: i * 12, backgroundColor: ["#FFC107", "#22C55E", "#1453E5"][i] },
                    ]}
                  />
                ))}
              </View>
              <View style={{ marginLeft: 38 }}>
                <Text style={styles.bannerBadgeNum}>500+</Text>
                <Text style={styles.bannerBadgeText}>clientes satisfeitos</Text>
              </View>
            </View>
          </View>
        </View>

        {/* BENEFITS */}
        <View style={styles.benefits} testID="home-benefits">
          {BENEFITS.map((b) => (
            <View key={b.id} style={styles.benefitCol}>
              <MaterialCommunityIcons name={b.icon as any} size={26} color={b.color} />
              <Text style={styles.benefitText}>{b.label}</Text>
            </View>
          ))}
        </View>

        {/* SERVICES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nossos serviços</Text>
          <TouchableOpacity style={styles.linkRow} testID="services-see-all">
            <Text style={styles.linkText}>Ver todos</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color={colors.brand} />
          </TouchableOpacity>
        </View>

        <View style={styles.servicesRow}>
          {topServices.map((s) => (
            <Pressable
              key={s.id}
              style={styles.serviceCard}
              onPress={() => openBooking(s.id)}
              testID={`service-card-${s.id}`}
            >
              <View style={styles.serviceImageWrap}>
                <Image source={s.image} style={styles.serviceImage} contentFit="cover" />
                <View style={[styles.serviceBadge, { backgroundColor: s.badgeColor }]}>
                  <MaterialCommunityIcons
                    name="star"
                    size={10}
                    color={s.badgeColor === colors.accent ? colors.brandDark : "#fff"}
                  />
                  <Text
                    style={[
                      styles.serviceBadgeText,
                      { color: s.badgeColor === colors.accent ? colors.brandDark : "#fff" },
                    ]}
                  >
                    {s.badge}
                  </Text>
                </View>
                <View style={styles.serviceIconCircle}>
                  <ServiceIcon name={s.iconName} color={colors.brand} />
                </View>
              </View>
              <Text style={styles.serviceName} numberOfLines={1}>
                {s.name}
              </Text>
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name="star" size={12} color={colors.star} />
                <Text style={styles.ratingText}>
                  {s.rating} ({s.reviews})
                </Text>
              </View>
              <Text style={styles.servicePrice}>
                Desde {s.priceFrom.toFixed(2).replace(".", ",")}€
              </Text>
            </Pressable>
          ))}
        </View>

        {/* PLANS */}
        <View style={styles.plansCard} testID="home-plans">
          <View style={styles.plansLeft}>
            <View style={styles.plansIcon}>
              <MaterialCommunityIcons name="refresh" size={22} color={colors.accent} />
            </View>
            <Text style={styles.plansTitle}>Planos de limpezas{"\n"}recorrentes</Text>
            <Text style={styles.plansDesc}>
              Economize com planos semanais, quinzenais ou mensais!
            </Text>
          </View>
          <View style={styles.plansRight}>
            {PLANS.map((p) => (
              <Pressable
                key={p.id}
                style={[styles.planCard, p.popular && styles.planCardPopular]}
                onPress={() => openBooking()}
                testID={`plan-${p.id}`}
              >
                <Text style={styles.planLabel}>{p.label}</Text>
                <Text style={styles.planDiscount}>{p.discount}</Text>
                <Text style={styles.planFromLabel}>Desde</Text>
                <Text style={styles.planFromPrice}>{p.from}</Text>
                {p.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Mais escolhido</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* HOW IT WORKS */}
        <Text style={styles.stepsTitle}>Reserva em menos de 60 segundos</Text>
        <View style={styles.stepsRow}>
          {STEPS.map((s, idx) => (
            <View key={s.id} style={styles.stepItem}>
              <View style={styles.stepIconCircle}>
                <MaterialCommunityIcons name={s.icon as any} size={20} color={colors.brand} />
              </View>
              <Text style={styles.stepLabel}>
                <Text style={{ color: colors.brand, fontWeight: "800" }}>{s.id}</Text>{" "}
                {s.label}
              </Text>
              {idx < STEPS.length - 1 && (
                <View style={styles.stepArrow}>
                  <MaterialCommunityIcons name="chevron-right" size={14} color={colors.textMuted} />
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <QuickBookingSheet
        visible={quickOpen}
        onClose={() => setQuickOpen(false)}
        initialServiceId={selectedService}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
    marginBottom: spacing.md,
  },
  logoWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  boltCircle: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 19, fontWeight: "800", letterSpacing: -0.3 },
  logoTag: { fontSize: 8, color: colors.textMuted, letterSpacing: 1.4, fontWeight: "700" },
  headerActions: { flexDirection: "row", gap: 10 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: colors.brand,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },

  // Title
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginTop: 4 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2, marginBottom: spacing.md },

  // Search
  searchRow: { flexDirection: "row", gap: 10, marginBottom: spacing.md },
  searchField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    height: 48,
    ...shadow.card,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: 0 },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },

  // Banner
  banner: {
    flexDirection: "row",
    backgroundColor: colors.brandDark,
    borderRadius: 24,
    overflow: "hidden",
    height: 210,
    marginBottom: spacing.md,
  },
  bannerLeft: { flex: 6, padding: 14, justifyContent: "center" },
  promoTag: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    marginBottom: 10,
  },
  promoText: { color: colors.brandDark, fontSize: 11, fontWeight: "700" },
  bannerTitleWhite: { color: "#fff", fontSize: 19, fontWeight: "800", lineHeight: 22 },
  bannerTitleYellow: { color: colors.accent, fontSize: 19, fontWeight: "800", lineHeight: 22 },
  bannerDesc: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    marginTop: 8,
    marginBottom: 12,
    lineHeight: 15,
  },
  bannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: radii.md,
    gap: 8,
  },
  bannerBtnText: { color: colors.brand, fontSize: 13, fontWeight: "800" },
  bannerRight: { flex: 4, position: "relative" },
  bannerImage: { width: "100%", height: "100%" },
  bannerBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    left: 10,
    backgroundColor: "rgba(11,30,92,0.85)",
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  bannerBadgeAvatars: { width: 50, height: 22, position: "relative" },
  avatarDot: {
    position: "absolute",
    top: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#fff",
  },
  bannerBadgeNum: { color: colors.accent, fontWeight: "800", fontSize: 13 },
  bannerBadgeText: { color: "#fff", fontSize: 10 },

  // Benefits
  benefits: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  benefitCol: { flex: 1, alignItems: "center", gap: 8, paddingHorizontal: 4 },
  benefitText: { fontSize: 11, color: colors.text, textAlign: "center", lineHeight: 13, fontWeight: "600" },

  // Sections
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  linkText: { color: colors.brand, fontWeight: "700", fontSize: 13 },

  // Service cards
  servicesRow: { flexDirection: "row", gap: 10, marginBottom: spacing.lg },
  serviceCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 8,
    ...shadow.card,
  },
  serviceImageWrap: { borderRadius: radii.md, overflow: "hidden", position: "relative", height: 92 },
  serviceImage: { width: "100%", height: "100%" },
  serviceBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  serviceBadgeText: { fontSize: 9, fontWeight: "800" },
  serviceIconCircle: {
    position: "absolute",
    bottom: -14,
    left: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
  serviceName: { marginTop: 18, fontSize: 12, fontWeight: "800", color: colors.text },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  ratingText: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
  servicePrice: { color: colors.brand, fontSize: 12, fontWeight: "800", marginTop: 4 },

  // Plans
  plansCard: {
    flexDirection: "row",
    backgroundColor: colors.brandDark,
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: spacing.lg,
    gap: 10,
  },
  plansLeft: { flex: 1.05, justifyContent: "center" },
  plansIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,193,7,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  plansTitle: { color: "#fff", fontSize: 14, fontWeight: "800", lineHeight: 18 },
  plansDesc: { color: "rgba(255,255,255,0.8)", fontSize: 11, marginTop: 6, lineHeight: 14 },
  plansRight: { flex: 1.4, flexDirection: "row", gap: 6 },
  planCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    position: "relative",
  },
  planCardPopular: { borderWidth: 2, borderColor: colors.accent },
  planLabel: { fontSize: 11, color: colors.text, fontWeight: "700" },
  planDiscount: { fontSize: 14, color: colors.brand, fontWeight: "800", marginTop: 2 },
  planFromLabel: { fontSize: 9, color: colors.textMuted, marginTop: 4 },
  planFromPrice: { fontSize: 12, color: colors.text, fontWeight: "800" },
  popularBadge: {
    position: "absolute",
    bottom: -8,
    left: -2,
    right: -2,
    backgroundColor: colors.accent,
    paddingVertical: 3,
    borderRadius: radii.pill,
    alignItems: "center",
  },
  popularText: { fontSize: 9, fontWeight: "800", color: colors.brandDark },

  // Steps
  stepsTitle: {
    fontSize: 14,
    color: colors.brand,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  stepsRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  stepItem: { flex: 1, alignItems: "center", position: "relative" },
  stepIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EAF0FE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  stepLabel: { fontSize: 10, color: colors.text, fontWeight: "600", textAlign: "center" },
  stepArrow: {
    position: "absolute",
    right: -7,
    top: 10,
  },
});
