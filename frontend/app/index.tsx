import { Redirect } from "expo-router";

import { useAuth } from "@/src/lib/auth";

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;
  return <Redirect href="/(tabs)/home" />;
}
