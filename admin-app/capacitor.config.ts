import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.ashva.admin',
  appName: 'ASHVA Admin',
  webDir: 'www',
  backgroundColor: '#17110D',
  server: { androidScheme: 'https' },
  ios: {
    contentInset: 'never',
    backgroundColor: '#17110D',
  },
};
export default config;
