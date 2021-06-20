import React, { useEffect } from "react";

/**
 * Debounce [[useEffect]] invocations.
 * @param effect Side effect
 * @param deps Dependencies
 * @param delayMS Duration(ms) to delay side effect
 */
export function useDebounceEffect(
  effect: React.EffectCallback,
  deps: React.DependencyList,
  delayMS: number
): void {
  useEffect(() => {
    // schedule the side effect
    const timer = setTimeout(effect, delayMS);
    // schedule the cancel of the side effect
    return () => clearTimeout(timer);
  }, deps);
}
