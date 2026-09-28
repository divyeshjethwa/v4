import type { RefObject } from 'react';
import type { View } from 'react-native';

// Web never uses this (the browser's View Transitions do the reveal); see snapshot.native.ts.
export function snapshot(_ref: RefObject<View | null>): Promise<string> {
  return Promise.reject(new Error('snapshot is native-only'));
}
