# Admin and Emergency Access Env Vars

Keep these in your deployment secrets, not in git. Fill only the ones you use.

- ADMIN_EMAIL: server-side admin email check (preferred)
- NEXT_PUBLIC_ADMIN_EMAIL: client-side UI gating (only if the UI must know the admin email)
- ADMIN_UID: server-side UID check (optional)
- NEXT_PUBLIC_ADMIN_UID: client-side UID gating (optional)
- ADMIN_MASTER_KEY: server-only emergency override; send via `x-admin-master-key` header to `/api/verify-admin` when needed. Do not expose in client code.

After setting, restart the app so runtime picks them up.
