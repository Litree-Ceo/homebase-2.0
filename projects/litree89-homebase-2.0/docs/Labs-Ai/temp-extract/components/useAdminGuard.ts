import { useEffect, useState } from "react";

// Client-side helper to optionally show/hide admin UI after server validation.
// Relies on NEXT_PUBLIC_ADMIN_VALIDATE_URL responding with { admin: true } or { ok: true }.
export function useAdminGuard() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function validate() {
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_ADMIN_VALIDATE_URL!, {
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled) {
          setAuthorized(Boolean(data?.admin || data?.ok));
        }
      } catch {
        if (!cancelled) setAuthorized(false);
      }
    }
    validate();
    return () => {
      cancelled = true;
    };
  }, []);

  return authorized;
}
