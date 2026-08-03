"use client";

import { useEffect } from "react";

interface UnsavedGuardProps {
  dirty: boolean;
  message?: string;
}

export function UnsavedGuard({
  dirty,
  message = "You have unsaved changes. Leave this page?",
}: UnsavedGuardProps) {
  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, message]);

  return null;
}
