import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "@/constants/theme";

export type TabIconName = "home" | "motion" | "settings";

type TabIconProps = {
  name: TabIconName;
  focused: boolean;
  size?: number;
};

function HomeIcon({ focused, size }: { focused: boolean; size: number }) {
  const color = focused ? colors.primary : colors.textTertiary;
  return (
    <View
      style={[
        iconStyles.home,
        {
          width: size,
          height: size,
          borderColor: color,
          backgroundColor: focused ? colors.primarySoft : "transparent",
        },
      ]}
    >
      <View style={[iconStyles.homeRoof, { borderBottomColor: color }]} />
      <View style={[iconStyles.homeDoor, { backgroundColor: color }]} />
    </View>
  );
}

function MotionIcon({ focused, size }: { focused: boolean; size: number }) {
  const color = focused ? colors.primary : colors.textTertiary;
  const dotSize = size / 7;
  const containerPadding = size / 12;
  const innerSize = size - containerPadding * 2;

  // 8 positions forming an octagon
  const positions = [
    { top: 0, left: innerSize / 2 - dotSize / 2 },
    { top: innerSize * 0.15, right: innerSize * 0.08 },
    { top: innerSize / 2 - dotSize / 2, right: 0 },
    { bottom: innerSize * 0.15, right: innerSize * 0.08 },
    { bottom: 0, left: innerSize / 2 - dotSize / 2 },
    { bottom: innerSize * 0.15, left: innerSize * 0.08 },
    { top: innerSize / 2 - dotSize / 2, left: 0 },
    { top: innerSize * 0.15, left: innerSize * 0.08 },
  ];

  return (
    <View
      style={{
        width: size,
        height: size,
        padding: containerPadding,
      }}
    >
      <View style={{ flex: 1, position: "relative" }}>
        {positions.map((pos, index) => (
          <View
            key={index}
            style={[
              {
                position: "absolute",
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: focused ? color : "transparent",
                borderWidth: 1.5,
                borderColor: color,
              },
              pos,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function SettingsIcon({ focused, size }: { focused: boolean; size: number }) {
  const color = focused ? colors.primary : colors.textTertiary;
  const innerSize = size * 0.4;
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 6 tick marks around a central circle */}
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <View
          key={deg}
          style={{
            position: "absolute",
            width: 2,
            height: size * 0.18,
            backgroundColor: color,
            borderRadius: 1,
            transform: [
              { rotate: `${deg}deg` },
              { translateY: -size * 0.35 },
            ],
          }}
        />
      ))}
      <View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          borderWidth: 1.8,
          borderColor: color,
          backgroundColor: focused ? colors.primarySoft : "transparent",
        }}
      />
    </View>
  );
}

export function TabIcon({ name, focused, size = 26 }: TabIconProps) {
  return (
    <View style={[styles.container, focused && styles.containerFocused]}>
      {name === "home" && <HomeIcon focused={focused} size={size} />}
      {name === "motion" && <MotionIcon focused={focused} size={size} />}
      {name === "settings" && <SettingsIcon focused={focused} size={size} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  containerFocused: {},
});

const iconStyles = StyleSheet.create({
  home: {
    borderWidth: 1.8,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
    overflow: "visible",
  },
  homeRoof: {
    position: "absolute",
    top: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  homeDoor: {
    width: 6,
    height: 8,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    marginBottom: 2,
  },
});
