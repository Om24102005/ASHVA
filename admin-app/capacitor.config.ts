import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.ashva.admin',
  appName: 'ASHVA Admin',
  webDir: 'www',
  server: { androidScheme: 'https' },
  ios: { contentInset: 'automatic' },
};
export default config;
