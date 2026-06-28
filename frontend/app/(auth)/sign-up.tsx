import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/lib/auth";
import { colors, radii, shadow, spacing } from "@/src/theme";

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!email.trim() || password.length < 6) {
      setError("Email válido e palavra-passe (mín. 6) obrigatórios.");
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim() || undefined);
      router.replace("/(tabs)/home");
    } catch (e: any) {
      setError(e.message ?? "Falha no registo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            testID="sign-up-back-button"
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>

          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Reserve serviços de limpeza em menos de 60 segundos.</Text>

          <View style={styles.field}>
            <MaterialCommunityIcons name="account-outline" size={20} color={colors.textMuted} />
            <TextInput
              testID="sign-up-name-input"
              style={styles.input}
              placeholder="Nome completo (opcional)"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>
          <View style={styles.field}>
            <MaterialCommunityIcons name="email-outline" size={20} color={colors.textMuted} />
            <TextInput
              testID="sign-up-email-input"
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.field}>
            <MaterialCommunityIcons name="lock-outline" size={20} color={colors.textMuted} />
            <TextInput
              testID="sign-up-password-input"
              style={styles.input}
              placeholder="Palavra-passe (mín. 6)"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {error && (
            <Text testID="sign-up-error" style={styles.error}>
              {error}
            </Text>
          )}

          <TouchableOpacity
            testID="sign-up-submit-button"
            style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
            onPress={onSubmit}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>{loading ? "A criar..." : "Criar conta"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="sign-up-go-signin-button"
            onPress={() => router.replace("/(auth)/sign-in")}
            style={styles.footerRow}
          >
            <Text style={styles.footerText}>Já tem conta? </Text>
            <Text style={[styles.footerText, { color: colors.brand, fontWeight: "700" }]}>
              Entrar
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.xxl, paddingTop: spacing.lg },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  title: { fontSize: 26, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 6, marginBottom: spacing.xl },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 12,
    ...shadow.card,
  },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 0 },
  error: { color: colors.danger, marginBottom: 8, fontSize: 13 },
  primaryBtn: {
    backgroundColor: colors.brand,
    height: 52,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    ...shadow.floating,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: spacing.xxl },
  footerText: { color: colors.textMuted, fontSize: 14 },
});
