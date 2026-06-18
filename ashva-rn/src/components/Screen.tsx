/** Safe-area screen wrapper. Uses real device insets (notch / Dynamic Island /
 *  gesture pill / Android nav bar) so layout adapts to ANY device automatically. */
import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';

export function Screen({
  children,
  style,
  edges = { top: true, bottom: true },
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: { top?: boolean; bottom?: boolean };
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.root,
        { paddingTop: edges.top ? insets.top : 0, paddingBottom: edges.bottom ? insets.bottom : 0 },
        style,
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={C.base} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.base },
});
