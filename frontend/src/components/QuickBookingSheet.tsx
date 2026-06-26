import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { PLANS } from "@/src/data/services";
import { useAuth } from "@/src/lib/auth";
import { createBooking } from "@/src/lib/bookings";
import { listServices, Service } from "@/src/lib/catalog";
import { colors, radii, shadow, spacing } from "@/src/theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  initialServiceId?: string;
};

export default function QuickBookingSheet({ visible, onClose, initialServiceId }: Props) {
  const { user, profile } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<string | undefined>(initialServiceId);
  const [planId, setPlanId] = useState("single");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [postal, setPostal] = useState("");
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLoadingServices(true);
    listServices()
      .then((data) => {
        setServices(data);
        if (!serviceId && data.length) setServiceId(initialServiceId ?? data[0].id);
        if (initialServiceId) setServiceId(initialServiceId);
      })
      .catch((e) => setError(e.message ?? "Erro a carregar serviços."))
      .finally(() => setLoadingServices(false));
    // Prefill from profile
    if (profile) {
      if (!name) setName(profile.full_name ?? "");
      if (!phone) setPhone(profile.phone ?? "");
      if (!address) setAddress(profile.address ?? "");
      if (!postal) setPostal(profile.postal_code ?? "");
      if (!city) setCity(profile.city ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialServiceId, profile]);

  const close = () => {
    setError(null);
    setConfirmed(null);
    setDate("");
    setTime("");
    setNotes("");
    setPlanId("single");
    onClose();
  };

  const submit = async () => {
    setError(null);
    if (!user || !profile?.id) {
      setError("Inicie sessão para reservar.");
      return;
    }
    if (!serviceId) {
      setError("Escolha um serviço.");
      return;
    }
    if (!date.trim() || !time.trim() || !address.trim() || !name.trim() || !phone.trim()) {
      setError("Preencha nome, telefone, data, hora e morada.");
      return;
    }
    setSubmitting(true);
    try {
      const plan = PLANS.find((p) => p.id === planId);
      const res = await createBooking({
        client_id: profile.id,
        service_id: serviceId,
        scheduled_date: date.trim(),
        scheduled_time: time.trim().length === 5 ? `${time.trim()}:00` : time.trim(),
        client_name: name.trim(),
        client_email: user.email ?? "",
        client_phone: phone.trim(),
        service_address: address.trim(),
        postal_code: postal.trim() || null,
        city: city.trim() || null,
        notes: notes.trim() || null,
        is_recurring: planId !== "single",
        frequency: plan?.frequency ?? "one_time",
        payment_method: "pending",
      });
      setConfirmed(res.id);
    } catch (e: any) {
      setError(e.message ?? "Erro ao criar reserva.");
    } finally {
      setSubmitting(false);
    }
  };

  const planOptions = [
    { id: "single", label: "Único", discount: "", frequency: "one_time" },
    ...PLANS,
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={close}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={close} testID="quick-book-backdrop" />
      <View style={styles.sheet}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.handle} />
          {confirmed ? (
            <View style={{ alignItems: "center", padding: spacing.xl }}>
              <View style={styles.successIcon}>
                <MaterialCommunityIcons name="check" size={32} color="#fff" />
              </View>
              <Text style={styles.confirmTitle}>Reserva confirmada!</Text>
              <Text style={styles.confirmSub}>
                A sua reserva foi enviada para Admin e Pro em tempo real. Receberá um contacto da equipa em breve.
              </Text>
              <TouchableOpacity
                testID="quick-book-close-button"
                style={styles.primaryBtn}
                onPress={close}
              >
                <Text style={styles.primaryBtnText}>Concluído</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 600 }}
            >
              <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Reserva Rápida</Text>
                <TouchableOpacity onPress={close} testID="quick-book-x-button">
                  <MaterialCommunityIcons name="close" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>
              <Text style={styles.headerSub}>Reserve em menos de 60 segundos.</Text>

              <Text style={styles.section}>Serviço</Text>
              {loadingServices && services.length === 0 ? (
                <ActivityIndicator color={colors.brand} />
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, paddingRight: spacing.lg }}
                >
                  {services.map((s) => {
                    const active = s.id === serviceId;
                    return (
                      <TouchableOpacity
                        key={s.id}
                        testID={`quick-book-service-${s.slug}`}
                        onPress={() => setServiceId(s.id)}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {s.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              <Text style={styles.section}>Plano</Text>
              <View style={styles.planRow}>
                {planOptions.map((p) => {
                  const active = p.id === planId;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      testID={`quick-book-plan-${p.id}`}
                      onPress={() => setPlanId(p.id)}
                      style={[styles.planChip, active && styles.planChipActive]}
                    >
                      <Text style={[styles.planLabel, active && { color: colors.brand }]}>
                        {p.label}
                      </Text>
                      {!!p.discount && (
                        <Text style={[styles.planDiscount, active && { color: colors.brand }]}>
                          {p.discount}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.section}>Nome</Text>
              <View style={styles.field}>
                <MaterialCommunityIcons name="account" size={20} color={colors.textMuted} />
                <TextInput
                  testID="quick-book-name-input"
                  style={styles.input}
                  placeholder="Nome completo"
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>
              <Text style={styles.section}>Telefone</Text>
              <View style={styles.field}>
                <MaterialCommunityIcons name="phone" size={20} color={colors.textMuted} />
                <TextInput
                  testID="quick-book-phone-input"
                  style={styles.input}
                  placeholder="9XX XXX XXX"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
              <Text style={styles.section}>Data</Text>
              <View style={styles.field}>
                <MaterialCommunityIcons name="calendar" size={20} color={colors.textMuted} />
                <TextInput
                  testID="quick-book-date-input"
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  value={date}
                  onChangeText={setDate}
                />
              </View>
              <Text style={styles.section}>Hora</Text>
              <View style={styles.field}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={colors.textMuted} />
                <TextInput
                  testID="quick-book-time-input"
                  style={styles.input}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textMuted}
                  value={time}
                  onChangeText={setTime}
                />
              </View>
              <Text style={styles.section}>Morada</Text>
              <View style={styles.field}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.textMuted} />
                <TextInput
                  testID="quick-book-address-input"
                  style={styles.input}
                  placeholder="Rua, número"
                  placeholderTextColor={colors.textMuted}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.section}>Código Postal</Text>
                  <View style={styles.field}>
                    <TextInput
                      testID="quick-book-postal-input"
                      style={styles.input}
                      placeholder="0000-000"
                      placeholderTextColor={colors.textMuted}
                      value={postal}
                      onChangeText={setPostal}
                    />
                  </View>
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={styles.section}>Cidade</Text>
                  <View style={styles.field}>
                    <TextInput
                      testID="quick-book-city-input"
                      style={styles.input}
                      placeholder="Cidade"
                      placeholderTextColor={colors.textMuted}
                      value={city}
                      onChangeText={setCity}
                    />
                  </View>
                </View>
              </View>
              <Text style={styles.section}>Notas (opcional)</Text>
              <View style={[styles.field, { alignItems: "flex-start", height: 80, paddingTop: 12 }]}>
                <TextInput
                  testID="quick-book-notes-input"
                  style={[styles.input, { textAlignVertical: "top" }]}
                  placeholder="Detalhes adicionais"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>

              {error && (
                <Text testID="quick-book-error" style={styles.error}>
                  {error}
                </Text>
              )}

              <TouchableOpacity
                testID="quick-book-submit-button"
                style={[styles.primaryBtn, submitting && { opacity: 0.7 }]}
                onPress={submit}
                disabled={submitting}
              >
                <Text style={styles.primaryBtnText}>
                  {submitting ? "A reservar..." : "Confirmar reserva"}
                </Text>
              </TouchableOpacity>
              <View style={{ height: 12 }} />
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(11,30,92,0.45)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingTop: 10,
    paddingBottom: spacing.xxl,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginBottom: 8,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: colors.text },
  headerSub: { color: colors.textMuted, fontSize: 13, marginTop: 2, marginBottom: spacing.md },
  section: { fontSize: 13, fontWeight: "700", color: colors.text, marginTop: spacing.md, marginBottom: 6 },
  chip: {
    paddingHorizontal: 14,
    height: 36,
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { color: colors.text, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  planRow: { flexDirection: "row", gap: 8 },
  planChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  planChipActive: { borderColor: colors.brand, backgroundColor: "#EAF0FE" },
  planLabel: { color: colors.text, fontWeight: "700", fontSize: 13 },
  planDiscount: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.bg,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: 0 },
  error: { color: colors.danger, marginTop: 12, fontSize: 13 },
  primaryBtn: {
    backgroundColor: colors.brand,
    height: 52,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
    ...shadow.floating,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.iconGreen,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  confirmTitle: { fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 6 },
  confirmSub: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
});
