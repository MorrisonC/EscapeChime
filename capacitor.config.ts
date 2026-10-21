import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lightweight.tapecipher',
  appName: 'Tape Cipher',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
