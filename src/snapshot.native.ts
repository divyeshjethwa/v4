import type { RefObject } from 'react';
import type { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

// Takes a picture of a view (used by the native theme reveal). Resolves to a local file URI.
export function snapshot(ref: RefObject<View | null>) {
  return captureRef(ref, { format: 'jpg', quality: 0.92, result: 'tmpfile' });
}
