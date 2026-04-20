/**
 * useCommandPalette — Global keyboard shortcut for opening the Command Palette
 *
 * Listens for Cmd+K (Mac) or Ctrl+K (Windows/Linux).
 * Also listens for custom "open-command-palette" events dispatched
 * from the AdminLayout header search button.
 */

import { useState, useEffect, useCallback } from "react";

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen(prev => !prev), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && open) {
        close();
      }
    };

    const handleCustomEvent = () => setOpen(true);

    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("open-command-palette", handleCustomEvent);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("open-command-palette", handleCustomEvent);
    };
  }, [open, toggle, close]);

  return { open, setOpen, toggle, close };
}
