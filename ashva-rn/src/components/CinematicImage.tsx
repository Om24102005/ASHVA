/** A photo layered over its per-bike/route gradient. If the remote image fails
 *  or is slow, the gradient carries the look (never a broken-image box) — the
 *  same resilience the web prototype had via background-image + gradient. */
import React, { useState } from 'react';
import { View, ImageBackground, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function CinematicImage({
  uri,
  grad,
  style,
  children,
}: {
  uri: string;
  grad: string[];
  style?: ViewStyle;
  children?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <View style={[styles.wrap, style]}>
      <LinearGradient colors={grad as any} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
      {!failed && (
        <ImageBackground
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          imageStyle={{ opacity: 0.55 }}
          onError={() => setFailed(true)}
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', justifyContent: 'flex-end' },
});
