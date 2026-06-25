import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/lib/auth";
import { colors, radii, shadow, spacing } from "@/src/theme";

const ITEMS: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }[] = [
  { icon: "account-edit-outline", label: "Editar perfil" },
  { icon: "map-marker-outline", label: "Moradas" },
  { icon: "credit-card-outline", label: "Métodos de pagamento" },
  { icon: "bell-outline", label: "Notificações" },
  { icon: "shield-check-outline", label: "Privacidade e segurança" },
  { icon: "help-circle-outline", label: "Ajuda e suporte" },
];

export default function PerfilScreen() {
  const { user, signOut } = useAuth();

  const onLogout = async () => {
    await signOut();
    router.replace("/(auth)/sign-in");
  };

  const initials = (user?.full_name || user?.email || "?")
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.full_name ?? "Cliente FlashClean"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.providers}>
          {user?.auth_providers?.includes("password") && (
            <View style={styles.pill}>
              <MaterialCommunityIcons name="email-outline" size={12} color={colors.brand} />
              <Text style={styles.pillText}>Email</Text>
            </View>
          )}
          {user?.auth_providers?.includes("google") && (
            <View style={styles.pill}>
              <MaterialCommunityIcons name="google" size={12} color={colors.brand} />
              <Text style={styles.pillText}>Google</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.card}>
        {ITEMS.map((it, idx) => (
          <TouchableOpacity
            key={it.label}
            testID={`profile-row-${idx}`}
            style={[styles.row, idx < ITEMS.length - 1 && styles.rowDivider]}
            onPress={() => {}}
          >
            <View style={styles.rowIcon}>
              <MaterialCommunityIcons name={it.icon} size={18} color={colors.brand} />
            </View>
            <Text style={styles.rowLabel}>{it.label}</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity testID="profile-logout-button" style={styles.logout} onPress={onLogout}>
        <MaterialCommunityIcons name="logout" size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Terminar sessão</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg },
  header: { alignItems: "center", paddingTop: spacing.lg, paddingBottom: spacing.lg },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    ...shadow.floating,
  },
  avatarText: { color: "#fff", fontSize: 24, fontWeight: "800" },
  name: { fontSize: 18, fontWeight: "800", color: colors.text },
  email: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  providers: { flexDirection: "row", gap: 6, marginTop: 10 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: "#EAF0FE",
  },
  pillText: { fontSize: 11, color: colors.brand, fontWeight: "700" },
  card: { backgroundColor: colors.card, borderRadius: radii.lg, ...shadow.card },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EAF0FE",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.text },
  logout: {
    flexDirection: "row",
    alignSelf: "center",
    gap: 8,
    paddingVertical: 14,
    marginTop: spacing.lg,
    alignItems: "center",
  },
  logoutText: { color: colors.danger, fontWeight: "700", fontSize: 14 },
});
