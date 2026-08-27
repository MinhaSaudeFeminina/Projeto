# Web Project Inventory

Source project: `minha-saude-feminina mobile`
Destination project: `front_mobile`

This inventory records the source-of-truth behavior found before implementation.
The source project must remain read-only during the Expo migration.

## Routes And App Shell

Source file: `src/App.tsx`

The web app uses `BrowserRouter`, `Routes`, `Route`, `QueryClientProvider`,
`TooltipProvider`, `Sonner` and a shared `BottomNav`.

Routes:

| Web path | Source page | Notes |
|---|---|---|
| `/` | `src/pages/TodayPage.tsx` | Main dashboard tab. |
| `/ciclo` | `src/pages/CyclePage.tsx` | Cycle/calendar tab. |
| `/conteudos` | `src/pages/ContentsPage.tsx` | Content list/search tab. |
| `/conteudo/:id` | `src/pages/ContentDetailPage.tsx` | Content detail flow. |
| `/perfil` | `src/pages/ProfilePage.tsx` | Profile tab. |
| `/pergunta` | `src/pages/AnonymousQuestionPage.tsx` | Anonymous question flow; bottom nav hidden. |
| `/sintomas` | `src/pages/SymptomsPage.tsx` | Symptom registration flow. |
| `/lembretes` | `src/pages/RemindersPage.tsx` | Reminders flow. |
| `/apoio` | `src/pages/SupportPage.tsx` | Support/emergency contacts flow. |
| `/trilhas` | `src/pages/LifeStagesPage.tsx` | Life-stage content flow. |
| `*` | `src/pages/NotFound.tsx` | 404 fallback. |

## Static Data

Source file: `src/data/mockData.ts`

The app is static-data driven. No active backend calls were found in the source
behavior inspected so far.

Important exports:

- `mockUser`: profile, cycle averages, last period date, notification settings,
  data-sharing setting, cycles recorded and regularity.
- `mockSymptomTypes`: 14 symptom types with ids, labels and emoji icons.
- `mockSymptoms`: current sample symptom entries.
- `mockReminders`: sample reminders with completion state.
- `mockPeriods`: period ranges used by the cycle calendar.
- `contentCategories`: 10 content categories with labels, icons and colors.
- `mockContents`: educational health articles with normal, UBS and home-care
  text sections.
- `healthTips`: daily health tips.
- `quickActions`: quick action ids, labels and icons.
- `lifeStages`: life-stage cards.
- `emergencyContacts`: useful support numbers.
- `chatResponses`: keyword-based anonymous question responses.

## Pages And Business Rules

### `TodayPage.tsx`

- Calculates `cycleDay` from `mockUser.lastPeriodDate` and
  `mockUser.cycleAverageDays`.
- Maps cycle day to phases: Menstrual, Folicular, Ovulatoria and Lutea.
- Shows greeting by current hour.
- Picks daily tip from `healthTips`.
- Filters today's symptoms by ISO date.
- Shows up to three incomplete reminders.
- Navigates to `/sintomas` and `/lembretes`.
- Includes `MedicalDisclaimer`.

### `CyclePage.tsx`

- Holds current month in local state, initially March 2026.
- Builds calendar statuses from actual periods, predicted periods, fertile
  window, ovulation day and symptom dates.
- Supports previous/next month navigation.
- Calculates current cycle day and days until next period.
- Navigates to `/sintomas`.
- Includes compact `MedicalDisclaimer`.

### `ContentsPage.tsx`

- Holds active category and search text in local state.
- Filters content by selected category.
- Filters content by title or summary.
- Shows empty state text when no content matches.
- Navigates to `/conteudo/:id`.

### `ContentDetailPage.tsx`

- Reads `id` route param.
- Looks up content in `mockContents`.
- Shows "Conteudo nao encontrado." when the id is missing.
- Shows three content sections: normal, UBS guidance and home care.
- Uses Sonner toast for save/share/reminder feedback.
- Uses `navigate(-1)` for back behavior.
- Includes `MedicalDisclaimer`.

### `SymptomsPage.tsx`

- Holds selected symptoms in local state.
- Selecting a symptom adds it with intensity `leve` and empty notes.
- Selecting again removes it.
- Intensity can be changed to `leve`, `moderado` or `intenso`.
- Save button appears only when at least one symptom is selected.
- Save shows success feedback and navigates back.

### `RemindersPage.tsx`

- Holds reminders in local state, seeded from `mockReminders`.
- Tapping completion toggles `completed`.
- Completed reminders are visually de-emphasized and crossed out.
- Toggle shows success feedback.
- Add button is present visually but has no implemented flow.

### `AnonymousQuestionPage.tsx`

- Holds messages and input in local state.
- Starts with a welcome bot message.
- Empty/whitespace input is ignored.
- User message is appended immediately.
- Bot response is appended after 800 ms.
- Response is chosen by keyword: `corrimento`, `colica`/`colica` with accent,
  `atraso`/`atrasou`, `normal`, or default.
- UBS guidance is appended to every bot answer.
- Uses DOM scroll ref behavior that must be replaced in React Native.

### `ProfilePage.tsx`

- Shows user profile data and cycle stats from `mockUser`.
- Holds notification and data-sharing toggles in local state.
- Navigates to `/apoio` and `/trilhas`.
- Edit profile button is present visually but has no implemented flow.

### `SupportPage.tsx`

- Shows emergency CTA for Ligue 180.
- Shows educational violence-against-women copy.
- Lists `emergencyContacts`.
- Shows UBS guidance copy.
- Uses `navigate(-1)` for back behavior.

### `LifeStagesPage.tsx`

- Lists `lifeStages` as cards.
- Shows optional age chip.
- "Ver conteudos" CTA is visual only in the source.
- Uses `navigate(-1)` for back behavior.

### `NotFound.tsx`

- Logs missing route to console.
- Shows 404 text and link to `/`.
- Web-only link must become mobile navigation fallback.

### `Index.tsx`

- Lovable placeholder only.
- Not part of the main route configuration.
- Should not be migrated as an application screen.

## Custom Components

### `BottomNav.tsx`

- Uses React Router location and navigation.
- Tabs: Hoje, Ciclo, Conteudos, Perfil.
- Center plus button opens quick actions.
- Uses `QuickActionsModal`.

### `QuickActionsModal.tsx`

- Uses `quickActions`.
- Maps action ids:
  - `pergunta` -> `/pergunta`
  - `conteudo` -> `/conteudos`
  - `sintomas`, `corrimento`, `colica`, `humor` -> `/sintomas`
  - `lembrete` -> `/lembretes`
  - `menstruacao` -> `/ciclo`
- Web modal/backdrop must become a React Native sheet/modal.

### `MedicalDisclaimer.tsx`

- Normal copy: "Estas informacoes nao substituem avaliacao medica. Procure
  sempre a UBS para confirmacao e acompanhamento."
- Compact copy: "Essas informacoes nao substituem avaliacao medica."
- This is a health-safety rule and must be preserved.

### `NavLink.tsx`

- React Router compatibility wrapper.
- Web-only; should not be migrated directly.

## Generated Web UI Components

Source folder: `src/components/ui/`

The folder contains 49 shadcn/Radix-style generated components. They depend on
DOM elements, Tailwind classes and web libraries such as Radix UI, Sonner,
cmdk, Vaul, Recharts, react-day-picker and embla-carousel-react.

Direct source app usage found:

- `App.tsx` imports `Toaster as Sonner` from `components/ui/sonner`.
- `App.tsx` imports `TooltipProvider` from `components/ui/tooltip`.

Migration rule: do not port this generated web UI directly. Recreate only the
needed primitives in `front_mobile/src/components/ui` and
`front_mobile/src/components/layout` with React Native components.

## Public Assets

Source folder: `public/`

| File | Notes |
|---|---|
| `favicon.ico` | Candidate visual reference/app icon input. |
| `placeholder.svg` | Used only by the Lovable placeholder `Index.tsx`; not a main flow asset. |
| `robots.txt` | Web-only; no direct Expo mobile use. |

## Styling Tokens

Source files: `src/index.css`, `tailwind.config.ts`

Important visual identity:

- Fonts: Barlow Condensed for text and headings, Leckerli One for the brand
  (`.font-display`).
- Background/foreground: cream background and deep plum-red text; every
  heading uses a single deep red tone.
- Primary: softened deep red; secondary is soft pink and accent is peach.
- Status colors: `success`, `warning`, `info`, `destructive`.
- Gradients: `--gradient-primary`, `--gradient-soft`, `--gradient-warm`,
  `--gradient-sidebar`.
- Radius token: `1rem`, with larger cards often using `rounded-2xl`.
- Animations: fade-in, scale-in, slide-up.
- Safe-area helper: `safe-bottom`.
- Dark tokens exist but the source UI appears primarily light-themed.

React Native must recreate these as plain theme constants and `StyleSheet`
styles, not as CSS/Tailwind.

## Dependencies And Scripts

Source `package.json` identifies the project as a Vite React app:

- Scripts: `dev`, `build`, `build:dev`, `lint`, `preview`, `test`,
  `test:watch`.
- Core web dependencies: React 18, React DOM, Vite, React Router DOM,
  TanStack Query.
- UI/web dependencies: Radix UI packages, Tailwind, Sonner, lucide-react,
  Recharts, react-day-picker, cmdk, Vaul, embla-carousel-react,
  input-otp, react-resizable-panels.
- Forms/testing dependencies: react-hook-form, zod, Vitest, Testing Library,
  Playwright.

Migration rule: avoid carrying web-only dependencies to Expo. Use existing Expo
and React Navigation packages, React Native primitives, local services and
small reusable components.

## Final Migration Status

All source routes listed in `src/App.tsx` now have mobile equivalents under
`front_mobile/src/pages` and are wired from `front_mobile/App.tsx` through
React Navigation.

| Source flow | Mobile status |
|---|---|
| Hoje dashboard | Migrated to `TodayPage.tsx` with cycle summary, symptoms, reminders, daily tip and disclaimer. |
| Ciclo | Migrated to `CyclePage.tsx` with month navigation, calendar markers, stats and symptom CTA. |
| Conteudos | Migrated to `ContentsPage.tsx` with category filters, search and empty state. |
| Conteudo detail | Migrated to `ContentDetailPage.tsx` with not-found, content sections and feedback messages. |
| Perfil | Migrated to `ProfilePage.tsx` with profile data, stats, toggles and links. |
| Pergunta anonima | Migrated to `AnonymousQuestionPage.tsx` with blank validation, delayed responses and UBS guidance. |
| Sintomas | Migrated to `SymptomsPage.tsx` with select/deselect, intensity and save feedback. |
| Lembretes | Migrated to `RemindersPage.tsx` with completion toggle and feedback. |
| Apoio | Migrated to `SupportPage.tsx` with Ligue 180, guidance and emergency contacts. |
| Trilhas | Migrated to `LifeStagesPage.tsx` with life-stage cards and content CTA. |
| NotFound | Migrated to `NotFoundPage.tsx` with mobile fallback to Hoje. |

Validation completed for the migrated Expo project:

- `npm run lint` passes from `front_mobile/`.
- `npx tsc --noEmit` passes from `front_mobile/`.
- `npx expo-doctor` passes all 18 checks.
- `npx expo start` starts Metro on the default port and only stops because the
  command was intentionally bounded by timeout.
- Quick actions are reachable from the center bottom-tab button and preserve
  the original action-to-route mapping.
- Searches found no raw HTTP calls, DOM APIs, React Router, Sonner, Tailwind
  `className`, or HTML JSX patterns in `front_mobile/src`.

The source project remains the read-only reference. Implementation changes were
kept under `front_mobile` plus Spec Kit documentation/task tracking files.
