/** ASHVA — native shell hosting the EXACT original web app (www/) in a full-screen
 *  WebView. Every animation, transition, grain/sweep/kenburns keyframe and atom is
 *  the original HTML/CSS/JS, inlined in src/originalHtml.ts and pointed at the cloud
 *  API. The web layer runs in `html.native` mode so the OS draws the real status bar
 *  and safe-area insets (viewport-fit=cover) push content clear of the notch. */
import React, { useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { ORIGINAL_HTML } from './src/originalHtml';

const BG = '#17110D';

export default function App() {
  const ref = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <WebView
        ref={ref}
        originWhitelist={['*']}
        source={{ html: ORIGINAL_HTML, baseUrl: 'https://ashva.app/' }}
        style={styles.web}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaCapturePermissionGrantType="grant"
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        setSupportMultipleWindows={false}
        overScrollMode="never"
        bounces={false}
        onLoadEnd={() => setLoading(false)}
      />
      {loading && (
        <View style={styles.boot} pointerEvents="none">
          <ActivityIndicator color="#E2542A" size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  web: { flex: 1, backgroundColor: BG },
  boot: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: BG },
});
