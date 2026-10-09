# Checkpoint — tenant-scoped contact fields

Development branch only; production database unchanged.

- Owners/admins can define up to 20 text, number or date fields for a company in Settings, and activate/deactivate them without deleting stored values.
- Contact details display the company fields and save each value through an atomic PostgreSQL function. The database validates field membership, type, length, date, and tenant ownership. Inactive values remain visible but cannot be changed.
- The workspace snapshot now loads definitions and contact values from Supabase. Demo contacts keep empty custom values.
- A fresh disposable PostgreSQL database applied **48 migrations** and passed ten SQL checks. The new test confirmed valid writes, invalid date/unknown-field rejection, member updates, cross-company denial, and preservation after deactivation.
- `npm run check`, 36 Node tests, and `npm run build` passed. Local HTTP redirected unauthenticated Settings access and returned 401 for unauthenticated field mutations.
- Browser verification of authenticated editing remains pending because this local test stack provides PostgreSQL with an Auth SQL shim, not a running Supabase Auth/PostgREST service.
