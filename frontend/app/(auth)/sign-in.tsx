import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
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

export default function SignInScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignIn = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError("Preencha email e palavra-passe.");
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)/home");
    } catch (e: any) {
      setError(e.message ?? "Falha no login.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      // On web the page redirects; on native the auth state listener picks it up.
      if (Platform.OS !== "web") router.replace("/(tabs)/home");
    } catch (e: any) {
      setError(e.message ?? "Erro Google.");
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
          <View style={styles.brandRow}>
            <View style={styles.boltCircle}>
              <MaterialCommunityIcons name="flash" size={22} color="#fff" />
            </View>
            <Text style={styles.brandText}>
              <Text style={{ color: colors.brand }}>Flash</Text>
              <Text style={{ color: colors.text }}>Clean</Text>
            </Text>
          </View>
          <Text style={styles.title}>Bem-vindo de volta</Text>
          <Text style={styles.subtitle}>Entre para reservar limpezas em segundos.</Text>

          <View style={styles.field}>
            <MaterialCommunityIcons name="email-outline" size={20} color={colors.textMuted} />
            <TextInput
              testID="sign-in-email-input"
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
              testID="sign-in-password-input"
              style={styles.input}
              placeholder="Palavra-passe"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {error && (
            <Text testID="sign-in-error" style={styles.error}>
              {error}
            </Text>
          )}

          <TouchableOpacity
            testID="sign-in-submit-button"
            style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
            onPress={onSignIn}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>{loading ? "A entrar..." : "Entrar"}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity
            testID="sign-in-google-button"
            style={styles.googleBtn}
            onPress={onGoogle}
            disabled={loading}
          >
            <MaterialCommunityIcons name="google" size={20} color={colors.text} />
            <Text style={styles.googleText}>Continuar com Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="sign-in-go-signup-button"
            onPress={() => router.push("/(auth)/sign-up")}
            style={styles.footerRow}
          >
            <Text style={styles.footerText}>Não tem conta? </Text>
            <Text style={[styles.footerText, { color: colors.brand, fontWeight: "700" }]}>
              Registar
            </Text>
          </TouchableOpacity>

          {Platform.OS !== "web" && (
            <Text style={styles.deepLinkHint} testID="sign-in-deeplink-hint">
              Redirect Google: {Linking.createURL("auth")}
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.xxl, paddingTop: spacing.xl },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: spacing.xxl },
  boltCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  title: { fontSize: 26, fontWeight: "800", color: colors.text, marginTop: 6 },
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
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: spacing.xl },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, fontSize: 13 },
  googleBtn: {
    flexDirection: "row",
    gap: 10,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  googleText: { color: colors.text, fontSize: 15, fontWeight: "600" },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: spacing.xxl },
  footerText: { color: colors.textMuted, fontSize: 14 },
  deepLinkHint: { color: colors.textMuted, fontSize: 10, textAlign: "center", marginTop: 16 },
});
