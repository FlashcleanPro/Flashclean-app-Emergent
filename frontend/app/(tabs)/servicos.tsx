import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import QuickBookingSheet from "@/src/components/QuickBookingSheet";
import { SERVICES } from "@/src/data/services";
import { colors, radii, shadow, spacing } from "@/src/theme";

export default function ServicosScreen() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | undefined>();

  const list = SERVICES.filter((s) =>
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
      >
        {list.map((s) => (
          <Pressable
            key={s.id}
            testID={`servico-item-${s.id}`}
            onPress={() => {
              setSelected(s.id);
              setOpen(true);
            }}
            style={styles.row}
          >
            <Image source={s.image} style={styles.thumb} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <View style={styles.rowHead}>
                <Text style={styles.name}>{s.name}</Text>
                <View style={[styles.tinyBadge, { backgroundColor: s.badgeColor }]}>
                  <Text
                    style={[
                      styles.tinyBadgeText,
                      { color: s.badgeColor === colors.accent ? colors.brandDark : "#fff" },
                    ]}
                  >
                    {s.badge}
                  </Text>
                </View>
              </View>
              <Text style={styles.desc} numberOfLines={2}>
                {s.description}
              </Text>
              <View style={styles.metaRow}>
                <MaterialCommunityIcons name="star" size={13} color={colors.star} />
                <Text style={styles.metaText}>
                  {s.rating} · {s.reviews} avaliações
                </Text>
                <Text style={styles.price}>
                  · Desde {s.priceFrom.toFixed(2).replace(".", ",")}€
                </Text>
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
  rowHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 },
  name: { fontSize: 14, fontWeight: "800", color: colors.text, flex: 1 },
  tinyBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: radii.pill },
  tinyBadgeText: { fontSize: 9, fontWeight: "800" },
  desc: { fontSize: 12, color: colors.textMuted, marginTop: 4, lineHeight: 16 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8, flexWrap: "wrap" },
  metaText: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
  price: { fontSize: 12, color: colors.brand, fontWeight: "800" },
});
