import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import QuickBookingSheet from "@/src/components/QuickBookingSheet";
import { listServices, Service } from "@/src/lib/catalog";
import { colors, radii, shadow, spacing } from "@/src/theme";

export default function ServicosScreen() {
  const [search, setSearch] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | undefined>();

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await listServices();
      setServices(data);
    } catch (e: any) {
      setError(e.message ?? "Erro a carregar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const list = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Serviços</Text>
        <Text style={styles.headerSub}>
          Escolha o serviço que melhor se adapta a si.
        </Text>
      </View>
      <View style={styles.searchField}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
        <TextInput
          testID="servicos-search-input"
          style={styles.searchInput}
          placeholder="Procurar serviço"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        {error && (
          <Text testID="servicos-error" style={{ color: colors.danger }}>
            {error}
          </Text>
        )}
        {loading && !services.length && (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator color={colors.brand} />
          </View>
        )}
        {list.map((s) => (
          <Pressable
            key={s.id}
            testID={`servico-item-${s.slug}`}
            onPress={() => {
              setSelected(s.id);
              setOpen(true);
            }}
            style={styles.row}
          >
            {s.image_url ? (
              <Image source={s.image_url} style={styles.thumb} contentFit="cover" />
            ) : (
              <View style={[styles.thumb, { backgroundColor: "#EAF0FE" }]} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{s.name}</Text>
              {!!s.description && (
                <Text style={styles.desc} numberOfLines={2}>
                  {s.description}
                </Text>
              )}
              <View style={styles.metaRow}>
                <MaterialCommunityIcons name="arrow-right" size={14} color={colors.brand} />
                <Text style={styles.metaCta}>Ver detalhes &amp; reservar</Text>
              </View>
            </View>
          </Pressable>
        ))}
        <View style={{ height: 90 }} />
      </ScrollView>
      <QuickBookingSheet
        visible={open}
        onClose={() => setOpen(false)}
        initialServiceId={selected}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: 6, paddingBottom: spacing.sm },
  headerTitle: { fontSize: 24, fontWeight: "800", color: colors.text },
  headerSub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  searchField: {
    marginHorizontal: spacing.lg,
    marginTop: 8,
    marginBottom: spacing.md,
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
  list: { paddingHorizontal: spacing.lg, gap: 12 },
  row: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: 10,
    gap: 12,
    ...shadow.card,
  },
  thumb: { width: 90, height: 90, borderRadius: radii.md },
  name: { fontSize: 14, fontWeight: "800", color: colors.text },
  desc: { fontSize: 12, color: colors.textMuted, marginTop: 4, lineHeight: 16 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  metaCta: { fontSize: 12, color: colors.brand, fontWeight: "800" },
});
