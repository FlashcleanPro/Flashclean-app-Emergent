import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import QuickBookingSheet from "@/src/components/QuickBookingSheet";
import { colors, shadow } from "@/src/theme";

type TabItem = {
  key: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: string;
};

const LEFT_TABS: TabItem[] = [
  { key: "home", label: "Início", icon: "home", route: "/(tabs)/home" },
  { key: "servicos", label: "Serviços", icon: "view-grid-outline", route: "/(tabs)/servicos" },
];

const RIGHT_TABS: TabItem[] = [
  { key: "reservas", label: "Reservas", icon: "calendar-blank-outline", route: "/(tabs)/reservas" },
  { key: "perfil", label: "Perfil", icon: "account-outline", route: "/(tabs)/perfil" },
];

function CustomTabBar(props: any) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [quickOpen, setQuickOpen] = useState(false);
  const activeRoute = props.state.routes[props.state.index].name; // e.g. "home"

  const renderTab = (t: TabItem) => {
    const active = activeRoute === t.key;
    return (
      <Pressable
        key={t.key}
        testID={`tab-${t.key}`}
        onPress={() => router.navigate(t.route as any)}
        style={styles.tabBtn}
      >
        <MaterialCommunityIcons
          name={t.icon}
          size={22}
          color={active ? colors.brand : colors.textMuted}
        />
        <Text style={[styles.tabLabel, active && { color: colors.brand, fontWeight: "700" }]}>
          {t.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <>
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {LEFT_TABS.map(renderTab)}
        <View style={styles.centerSlot}>
          <Pressable
            testID="tab-reserva-rapida"
            onPress={() => setQuickOpen(true)}
            style={styles.centerBtn}
          >
            <MaterialCommunityIcons name="flash" size={26} color="#fff" />
          </Pressable>
          <Text style={styles.centerLabel}>Reserva{"\n"}Rápida</Text>
        </View>
        {RIGHT_TABS.map(renderTab)}
      </View>
      <QuickBookingSheet visible={quickOpen} onClose={() => setQuickOpen(false)} />
    </>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(p) => <CustomTabBar {...p} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="servicos" />
      <Tabs.Screen name="reservas" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingHorizontal: 6,
    alignItems: "flex-start",
    ...Platform.select({
      ios: shadow.card,
      android: {},
    }),
  },
  tabBtn: { flex: 1, alignItems: "center", paddingTop: 6, paddingBottom: 4 },
  tabLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  centerSlot: { flex: 1, alignItems: "center" },
  centerBtn: {
    marginTop: -22,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.floating,
    borderWidth: 4,
    borderColor: colors.card,
  },
  centerLabel: {
    fontSize: 11,
    color: colors.text,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 13,
  },
});
