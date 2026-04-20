/**
 * useDoubleSubmitGuard — Prevent double-clicks on form submissions
 *
 * Usage:
 *   const { isSubmitting, guard } = useDoubleSubmitGuard();
 *   <Button disabled={isSubmitting} onClick={() => guard(handleSubmit)}>Save</Button>
 */

import { useState, useCallback } from "react";

export function useDoubleSubmitGuard() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Wraps an async function to prevent double-execution.
   * Automatically sets isSubmitting=true before the call and
   * false after it completes (or throws).
   */
  const guard = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        return await fn();
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting]
  );

  return { isSubmitting, guard };
}
