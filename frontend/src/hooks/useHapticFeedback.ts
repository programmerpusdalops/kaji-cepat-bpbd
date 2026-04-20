/**
 * useHapticFeedback — Web Haptics API wrapper
 *
 * Provides preset vibration patterns for native-app-like haptic feedback.
 * Falls back gracefully on devices/browsers that don't support vibration.
 */

type HapticPreset = "light" | "medium" | "success" | "error" | "warning";

const patterns: Record<HapticPreset, number | number[]> = {
  light: 10,
  medium: 25,
  success: [10, 30, 10],
  error: [50, 50, 50],
  warning: [30, 20, 30],
};

/** Fire haptic feedback with a preset pattern */
export function haptic(preset: HapticPreset = "light") {
  if ("vibrate" in navigator) {
    try {
      navigator.vibrate(patterns[preset]);
    } catch {
      // Vibration not supported or blocked
    }
  }
}

/** React hook that returns the haptic function for convenience */
export function useHapticFeedback() {
  return { haptic };
}
