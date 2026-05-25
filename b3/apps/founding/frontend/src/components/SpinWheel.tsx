import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import Animated, { type SharedValue, useAnimatedStyle } from "react-native-reanimated";

import { VILLAGE_IMAGES, colors } from "@/src/theme";

export const SPIN_SEGMENT_COUNT = 8;
export const SPIN_SEGMENT_LABELS = [
  "+100 XP",
  "+250 XP",
  "+500 XP",
  "+1000 XP",
  "Builder Key",
  "Culture Key",
  "Vision Key",
  "Mystery Box",
] as const;
export const SPIN_SEGMENT_COLORS = [
  colors.emerald,
  colors.emerald,
  colors.emerald,
  colors.gold,
  colors.blue,
  colors.emerald,
  "#A78BFA",
  colors.gold,
] as const;

const DISC_RATIO = 0.72;
const SEGMENT_ANGLE = 360 / SPIN_SEGMENT_COUNT;
const SEGMENT_SKEW = 90 - SEGMENT_ANGLE;

type Props = {
  size: number;
  rotation: SharedValue<number>;
};

function WheelDisc({ size }: { size: number }) {
  const radius = size / 2;

  return (
    <View style={[styles.disc, { width: size, height: size, borderRadius: radius }]}>
      {SPIN_SEGMENT_COLORS.map((color, i) => (
        <View
          key={i}
          style={[
            styles.sliceWrap,
            {
              width: radius,
              height: radius,
              left: radius,
              transform: [{ rotate: `${i * SEGMENT_ANGLE}deg` }],
            },
          ]}
        >
          <View style={[styles.slice, { backgroundColor: color, transform: [{ skewY: `-${SEGMENT_SKEW}deg` }] }]} />
        </View>
      ))}
      {SPIN_SEGMENT_LABELS.map((label, i) => {
        const mid = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
        return (
          <View
            key={`label-${i}`}
            style={[
              styles.labelWrap,
              {
                width: size,
                height: size,
                transform: [{ rotate: `${mid}deg` }],
              },
            ]}
            pointerEvents="none"
          >
            <Text style={styles.label} numberOfLines={1}>
              {label}
            </Text>
          </View>
        );
      })}
      <View style={[styles.hub, { width: size * 0.18, height: size * 0.18, borderRadius: size * 0.09 }]} />
    </View>
  );
}

export function SpinWheel({ size, rotation }: Props) {
  const discSize = size * DISC_RATIO;
  const discOffset = (size - discSize) / 2;

  const discStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View style={[styles.discClip, { left: discOffset, top: discOffset, width: discSize, height: discSize, borderRadius: discSize / 2 }]}>
        <Animated.View style={[{ width: discSize, height: discSize }, discStyle]}>
          <WheelDisc size={discSize} />
        </Animated.View>
      </View>
      <Image
        source={{ uri: VILLAGE_IMAGES.spinWheel }}
        style={[styles.frame, { width: size, height: size }]}
        contentFit="contain"
        pointerEvents="none"
      />
      <View style={styles.pointer} pointerEvents="none" />
    </View>
  );
}

/** Additive rotation so the segment at `segmentIndex` lands under the top pointer. */
export function computeSpinDelta(segmentIndex: number, currentRotation: number): number {
  const landAngle = 360 - (segmentIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2);
  const normalized = ((landAngle - (currentRotation % 360)) + 360) % 360;
  return 360 * 6 + normalized;
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  discClip: {
    position: "absolute",
    overflow: "hidden",
    zIndex: 1,
  },
  disc: {
    overflow: "hidden",
    backgroundColor: colors.bg,
    borderWidth: 2,
    borderColor: colors.gold + "88",
  },
  sliceWrap: {
    position: "absolute",
    top: 0,
    transformOrigin: "0% 100%",
  },
  slice: {
    width: "100%",
    height: "100%",
  },
  labelWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: "8%",
  },
  label: {
    color: "#000",
    fontSize: 9,
    fontWeight: "800",
    textAlign: "center",
    maxWidth: 56,
    textShadowColor: "rgba(255,255,255,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  hub: {
    position: "absolute",
    alignSelf: "center",
    top: "41%",
    backgroundColor: colors.gold,
    borderWidth: 2,
    borderColor: colors.goldDeep,
    zIndex: 2,
  },
  frame: {
    position: "absolute",
    zIndex: 2,
  },
  pointer: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 22,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: colors.gold,
    zIndex: 3,
  },
});
