import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import QuickBookingSheet from "@/src/components/QuickBookingSheet";
import { Booking, listMyBookings, subscribeToMyBookings } from "@/src/lib/bookings";
import { listServices, Service } from "@/src/lib/catalog";
import { useAuth } from "@/src/lib/auth";
import { colors, radii, shadow, spacing } from "@/src/theme";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmada",
  in_progress: "Em curso",
  completed: "Concluída",
  cancelled: "Cancelada",
};

const STATUS_COLOR: Record<string, { bg: string; fg: string }> = {
  pending: { bg: "#FFF4D6", fg: "#A36B00" },
  confirmed: { bg: "#E6F7EF", fg: "#1FB36B" },
  in_progress: { bg: "#EAF0FE", fg: "#1453E5" },
  completed: { bg: "#EAF0FE", fg: "#1453E5" },
  cancelled: { bg: "#FBE7E7", fg: "#E53935" },
};

export default function ReservasScreen() {
  const { profile, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  const clientId = profile?.id ?? null;

  const load = useCallback(async () => {
    if (!clientId) {
      setItems([]);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const [bk, sv] = await Promise.all([listMyBookings(clientId), listServices()]);
      setItems(bk);
      setServices(sv);
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    if (!clientId) return;
    setLive(true);
    const off = subscribeToMyBookings(clientId, (row, event) => {
      setItems((prev) => {
        if (event === "DELETE") return prev.filter((b) => b.id !== row.id);
        const idx = prev.findIndex((b) => b.id === row.id);
        if (idx === -1) return [row, ...prev];
        const copy = prev.slice();
        copy[idx] = row;
        return copy;
      });
    });
    return () => {
      setLive(false);
      off();
    };
  }, [clientId]);

  const labelFor = (id: string | null) =>
    services.find((s) => s.id === id)?.name ?? "Serviço";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>As minhas reservas</Text>
        <View style={styles.subRow}>
          <Text style={styles.sub}>Sincronizado em tempo real com Admin e Pro.</Text>
          <View style={styles.liveDot} testID="reservas-live-status">
            <View style={[styles.dot, { backgroundColor: live ? colors.success : colors.textMuted }]} />
            <Text style={[styles.liveText, { color: live ? colors.success : colors.textMuted }]}>
              {live ? "Ligado" : "Offline"}
            </Text>
          </View>
        </View>
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
        {authLoading || (loading && items.length === 0) ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator color={colors.brand} />
          </View>
        ) : null}
        {!loading && items.length === 0 && (
          <View style={styles.empty} testID="reservas-empty">
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={32} color={colors.brand} />
            </View>
            <Text style={styles.emptyTitle}>Sem reservas ainda</Text>
            <Text style={styles.emptySub}>
              Faça a sua primeira reserva e veja-a aqui em tempo real.
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
        {items.map((b) => {
          const status = b.status ?? "pending";
          const sc = STATUS_COLOR[status] ?? STATUS_COLOR.pending;
          return (
            <View key={b.id} style={styles.card} testID={`reserva-${b.id}`}>
              <View style={styles.cardRow}>
                <Text style={styles.cardTitle}>{labelFor(b.service_id)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.statusText, { color: sc.fg }]}>
                    {STATUS_LABEL[status] ?? status}
                  </Text>
                </View>
              </View>
              <View style={styles.meta}>
                <MaterialCommunityIcons name="calendar" size={14} color={colors.textMuted} />
                <Text style={styles.metaText}>
                  {b.scheduled_date}
                  {b.scheduled_time ? ` · ${b.scheduled_time.slice(0, 5)}` : ""}
                </Text>
              </View>
              {!!b.service_address && (
                <View style={styles.meta}>
                  <MaterialCommunityIcons name="map-marker" size={14} color={colors.textMuted} />
                  <Text style={styles.metaText}>
                    {b.service_address}
                    {b.city ? `, ${b.city}` : ""}
                  </Text>
                </View>
              )}
              {b.total_price != null && (
                <View style={styles.meta}>
                  <MaterialCommunityIcons name="currency-eur" size={14} color={colors.brand} />
                  <Text style={[styles.metaText, { color: colors.brand, fontWeight: "700" }]}>
                    {Number(b.total_price).toFixed(2).replace(".", ",")} €
                  </Text>
                </View>
              )}
              {b.is_recurring && (
                <View style={styles.meta}>
                  <MaterialCommunityIcons name="sync" size={14} color={colors.brand} />
                  <Text style={[styles.metaText, { color: colors.brand, fontWeight: "700" }]}>
                    Plano {b.frequency}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
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
  subRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  sub: { fontSize: 12, color: colors.textMuted, flex: 1 },
  liveDot: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 11, fontWeight: "700" },
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
  card: { backgroundColor: colors.card, borderRadius: radii.lg, padding: 14, ...shadow.card },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 15, fontWeight: "800", color: colors.text, flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill },
  statusText: { fontSize: 11, fontWeight: "800" },
  meta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  metaText: { fontSize: 12, color: colors.textMuted },
  error: { color: colors.danger, marginBottom: 8 },
});
