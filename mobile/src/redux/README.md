# Redux

Redux is intentionally not used in the current migration.

The migrated app only needs local screen state plus shared profile/preferences
state. `front_mobile/src/context/AppContext.tsx` owns that shared state through
the profile service boundary, keeping the architecture smaller while preserving
the required folder structure.

Add a Redux store here only if a future feature introduces cross-screen state
that cannot remain local or be cleanly handled by Context API.
