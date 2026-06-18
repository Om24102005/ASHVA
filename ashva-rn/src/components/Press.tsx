/** Pressable with a press-scale animation + light haptic — the native "feel"
 *  the web prototype faked with .press:active. Enforces a 44pt min hit target. */
import React, { useRef } from 'react';
import { Animated, Pressable, ViewStyle, StyleProp, GestureResponderEvent } from 'react-native';
import * as Haptics from 'expo-haptics';

export function Press({
  children,
  onPress,
  style,
  haptic = true,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
  accessibilityLabel?: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPressIn={() => to(0.96)}
      onPressOut={() => to(1)}
      onPress={(e) => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.(e);
      }}
    >
      <Animated.View style={[{ minHeight: 44, justifyContent: 'center', transform: [{ scale }] }, style as any]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
