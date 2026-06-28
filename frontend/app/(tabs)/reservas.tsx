import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import QuickBookingSheet from "@/src/components/QuickBookingSheet";
import { SERVICES } from "@/src/data/services";
import { api } from "@/src/lib/api";
import { colors, radii, shadow, spacing } from "@/src/theme";

type Booking = {
  id: string;
  service_type: string;
  plan_type?: string;
  date: string;
  time?: string;
  address: string;
  status: string;
  created_at: string;
};

export default function ReservasScreen() {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.listBookings();
      setItems(data);
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const labelFor = (id: string) =>
    SERVICES.find((s) => s.id === id)?.name ?? id;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>As minhas reservas</Text>
        <Text style={styles.sub}>Acompanhe o estado das suas reservas FlashClean.</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <Text testID="reservas-error" style={styles.error}>
            {error}
          </Text>
        )}
        {!loading && items.length === 0 && (
          <View style={styles.empty} testID="reservas-empty">
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={32} color={colors.brand} />
            </View>
            <Text style={styles.emptyTitle}>Sem reservas ainda</Text>
            <Text style={styles.emptySub}>
              Faça a sua primeira reserva e veja o histórico aqui.
            </Text>
            <TouchableOpacity
              testID="reservas-new-button"
              style={styles.primaryBtn}
              onPress={() => setOpen(true)}
            >
              <Text style={styles.primaryBtnText}>Reservar agora</Text>
            </TouchableOpacity>
          </View>
        )}
        {items.map((b) => (
          <View key={b.id} style={styles.card} testID={`reserva-${b.id}`}>
            <View style={styles.cardRow}>
              <Text style={styles.cardTitle}>{labelFor(b.service_type)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: colors.successSoft }]}>
                <Text style={[styles.statusText, { color: colors.success }]}>
                  {b.status === "pending" ? "Pendente" : b.status}
                </Text>
              </View>
            </View>
            <View style={styles.meta}>
              <MaterialCommunityIcons name="calendar" size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>
                {b.date}
                {b.time ? ` · ${b.time}` : ""}
              </Text>
            </View>
            <View style={styles.meta}>
              <MaterialCommunityIcons name="map-marker" size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>{b.address}</Text>
            </View>
            {b.plan_type && b.plan_type !== "single" && (
              <View style={styles.meta}>
                <MaterialCommunityIcons name="refresh" size={14} color={colors.brand} />
                <Text style={[styles.metaText, { color: colors.brand, fontWeight: "700" }]}>
                  Plano {b.plan_type}
                </Text>
              </View>
            )}
          </View>
        ))}
        <View style={{ height: 90 }} />
      </ScrollView>
      <QuickBookingSheet visible={open} onClose={() => setOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: 6, paddingBottom: spacing.sm },
  title: { fontSize: 24, fontWeight: "800", color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: 12 },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EAF0FE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: "center", marginTop: 6, paddingHorizontal: 30 },
  primaryBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.brand,
    paddingHorizontal: 24,
    height: 46,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.floating,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 14,
    ...shadow.card,
  },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 15, fontWeight: "800", color: colors.text, flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill },
  statusText: { fontSize: 11, fontWeight: "800" },
  meta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  metaText: { fontSize: 12, color: colors.textMuted },
  error: { color: colors.danger, marginBottom: 8 },
});
