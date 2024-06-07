// react-native-intent-launcher.d.ts
declare module 'react-native-intent-launcher' {
    export function startActivity(params: { action: string; data?: string }): void;
    export const IntentConstant: {
      ACTION_MANAGE_OVERLAY_PERMISSION: string;
    };
  }
  