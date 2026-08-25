# Migration Map

Source project: `minha-saude-feminina mobile`
Destination project: `front_mobile`

This document starts the migration map required before implementation. Later
tasks will expand each section with detailed route, component, data, service,
API and asset mappings.

## Ground Rules

- The original React/Lovable project is read-only and remains the functional
  and visual source of truth.
- Implementation happens only inside the existing Expo project in
  `front_mobile`.
- Do not create another Expo project.
- Use `App.tsx` as the main entry point.
- Use React Navigation with screens in `src/pages`.
- Do not use Expo Router as the primary navigation model.
- Do not port HTML, DOM APIs, Tailwind CSS or Radix/shadcn components directly.
- Preserve business rules before visual polish.

## Route Mapping

Source: `minha-saude-feminina mobile/src/App.tsx`

Navigation must be configured from `front_mobile/App.tsx` using React
Navigation. Main tab routes remain visible in bottom navigation; secondary
flows should be stack screens where the bottom tab can be hidden.

| Web path | Mobile route name | Params | Source file | Mobile file | Navigator role | Bottom tab |
|---|---|---|---|---|---|---|
| `/` | `Today` | none | `src/pages/TodayPage.tsx` | `front_mobile/src/pages/TodayPage.tsx` | tab screen | visible |
| `/ciclo` | `Cycle` | none | `src/pages/CyclePage.tsx` | `front_mobile/src/pages/CyclePage.tsx` | tab screen | visible |
| `/conteudos` | `Contents` | none | `src/pages/ContentsPage.tsx` | `front_mobile/src/pages/ContentsPage.tsx` | tab screen | visible |
| `/perfil` | `Profile` | none | `src/pages/ProfilePage.tsx` | `front_mobile/src/pages/ProfilePage.tsx` | tab screen | visible |
| `/conteudo/:id` | `ContentDetail` | `id: string` | `src/pages/ContentDetailPage.tsx` | `front_mobile/src/pages/ContentDetailPage.tsx` | stack screen | hidden |
| `/pergunta` | `AnonymousQuestion` | none | `src/pages/AnonymousQuestionPage.tsx` | `front_mobile/src/pages/AnonymousQuestionPage.tsx` | stack screen | hidden |
| `/sintomas` | `Symptoms` | optional `sourceAction?: string` | `src/pages/SymptomsPage.tsx` | `front_mobile/src/pages/SymptomsPage.tsx` | stack screen | hidden |
| `/lembretes` | `Reminders` | none | `src/pages/RemindersPage.tsx` | `front_mobile/src/pages/RemindersPage.tsx` | stack screen | hidden |
| `/apoio` | `Support` | none | `src/pages/SupportPage.tsx` | `front_mobile/src/pages/SupportPage.tsx` | stack screen | hidden |
| `/trilhas` | `LifeStages` | none | `src/pages/LifeStagesPage.tsx` | `front_mobile/src/pages/LifeStagesPage.tsx` | stack screen | hidden |
| `*` | `NotFound` | optional `attemptedRoute?: string` | `src/pages/NotFound.tsx` | `front_mobile/src/pages/NotFoundPage.tsx` | stack/fallback screen | hidden |

Back behavior from source `navigate(-1)` must become React Navigation
`goBack()` when possible, with fallback to the `Today` route.

Navigation implementation status:

- `front_mobile/src/utils/navigationTypes.ts` defines `RootStackParamList` and
  `MainTabParamList` for every route in the navigation contract.
- `front_mobile/App.tsx` now starts from `NavigationContainer` with a root
  native stack and bottom tabs.
- Bottom tabs are wired for `Today`, `Cycle`, `Contents` and `Profile`.
- Stack screens are wired for `ContentDetail`, `AnonymousQuestion`,
  `Symptoms`, `Reminders`, `Support`, `LifeStages` and `NotFound`.
- `front_mobile/src/utils/navigation.ts` implements the mobile back fallback:
  use `goBack()` when history exists, otherwise navigate to the `Today` tab.
- Temporary placeholders were replaced by the migrated page components in
  `front_mobile/App.tsx`: `TodayPage`, `CyclePage`, `ContentsPage`,
  `ProfilePage`, `ContentDetailPage`, `AnonymousQuestionPage`,
  `SymptomsPage`, `RemindersPage`, `SupportPage`, `LifeStagesPage` and
  `NotFoundPage`.

## Page Mapping

| Source page | Mobile page | Services/utilities expected | Migration notes |
|---|---|---|---|
| `TodayPage.tsx` | `front_mobile/src/pages/TodayPage.tsx` | `cycleService`, `symptomsService`, `remindersService`, date helpers | Preserve greeting, cycle phase, days until next period, today's symptoms, upcoming reminders, daily tip and disclaimer. |
| `CyclePage.tsx` | `front_mobile/src/pages/CyclePage.tsx` | `cycleService`, `date` and `cycle` utils | Preserve month navigation, period/predicted/fertile/ovulation/symptom markers, stats and symptom CTA. |
| `ContentsPage.tsx` | `front_mobile/src/pages/ContentsPage.tsx` | `contentService`, `text` utils | Preserve category filter, search by title/summary and empty state. |
| `ContentDetailPage.tsx` | `front_mobile/src/pages/ContentDetailPage.tsx` | `contentService`, navigation helper | Preserve id lookup, not-found state, sections, disclaimer and save/share/reminder feedback. |
| `SymptomsPage.tsx` | `front_mobile/src/pages/SymptomsPage.tsx` | `symptomsService` | Preserve select/deselect behavior, default intensity `leve`, intensity changes, save button visibility and success feedback. |
| `RemindersPage.tsx` | `front_mobile/src/pages/RemindersPage.tsx` | `remindersService`, date helpers | Preserve reminder list, completed toggle, completed visual state and success feedback. |
| `AnonymousQuestionPage.tsx` | `front_mobile/src/pages/AnonymousQuestionPage.tsx` | `anonymousQuestionService` | Preserve blank validation, welcome message, delayed bot response and UBS guidance. Replace DOM scroll ref with React Native list/scroll behavior. |
| `ProfilePage.tsx` | `front_mobile/src/pages/ProfilePage.tsx` | `profileService` | Preserve user/cycle info, stats, notification toggle, data-sharing toggle and support/life-stage links. |
| `SupportPage.tsx` | `front_mobile/src/pages/SupportPage.tsx` | `supportService` | Preserve 180 CTA, violence guidance, emergency contacts and UBS guidance. |
| `LifeStagesPage.tsx` | `front_mobile/src/pages/LifeStagesPage.tsx` | static data access | Preserve life-stage cards, optional age chip and visual content CTA. |
| `NotFound.tsx` | `front_mobile/src/pages/NotFoundPage.tsx` | navigation helper | Replace web anchor with mobile fallback navigation to `Today`. |
| `Index.tsx` | excluded | none | Lovable placeholder not wired as a main route; do not migrate as a product screen. |

Phase 7 migration status:

- `TodayPage`, `CyclePage`, `ContentsPage`, `ContentDetailPage`,
  `SymptomsPage`, `RemindersPage` and `AnonymousQuestionPage` are migrated
  under `front_mobile/src/pages`.
- `ProfilePage` is migrated and uses `AppContext` plus `profileService` for
  shared profile/preference state.
- `SupportPage` is migrated and uses `supportService` for emergency contacts
  and support copy.
- `LifeStagesPage` is migrated from static `lifeStages` data and routes its
  content CTA to the Conteudos tab.
- `NotFoundPage` is migrated as a mobile fallback with a button back to the
  Hoje tab.
- `front_mobile/App.tsx` imports the real migrated pages instead of
  `PlaceholderPage`.
- Search validation for web-only page imports/patterns returned no matches for
  `react-router-dom`, `lucide-react`, `sonner`, Radix imports, DOM globals,
  HTML element JSX and `className` in `front_mobile/src/pages`.

## Component Mapping

| Source artifact | Mobile target | Responsibility |
|---|---|---|
| `src/components/BottomNav.tsx` | `front_mobile/App.tsx` | Bottom tab visuals plus route wiring for Today, Cycle, Contents and Profile. Implemented as a custom React Navigation tab bar with the preserved center quick-action button. |
| `src/components/QuickActionsModal.tsx` | `front_mobile/src/components/layout/QuickActionsSheet.tsx` | Mobile sheet/modal for quick actions and action-to-route mapping. Implemented with `Modal`, touch actions, the preserved id-to-route mapping and an accessible center tab-bar trigger. |
| `src/components/MedicalDisclaimer.tsx` | `front_mobile/src/components/ui/MedicalDisclaimer.tsx` | Preserve normal and compact health-safety copy. Implemented with React Native `View`/`Text`. |
| `src/components/NavLink.tsx` | excluded | React Router wrapper; replace with React Navigation actions. |
| `src/components/ui/button.tsx` | `front_mobile/src/components/ui/AppButton.tsx` | Recreate only needed button variants with `Pressable`. Implemented with variants, sizes, loading and disabled states. |
| `src/components/ui/card.tsx` | `front_mobile/src/components/ui/AppCard.tsx` | Recreate card surface with `View` and `StyleSheet`. Implemented with optional title, subtitle and footer. |
| `src/components/ui/input.tsx` | `front_mobile/src/components/ui/AppTextInput.tsx` | Recreate text entry with `TextInput`. Implemented with label, helper/error text and multiline support. |
| `src/components/ui/switch.tsx` and source toggle patterns | `front_mobile/src/components/ui/AppToggle.tsx` | Recreate boolean toggle with React Native-compatible control. Implemented with `Switch`, label and description. |
| `src/components/ui/badge.tsx` and chip spans | `front_mobile/src/components/ui/AppChip.tsx` | Recreate badges/chips for categories, symptoms and age labels. Implemented with tone variants and selected/disabled states. |
| `src/components/ui/sonner.tsx`, `src/components/ui/toast.tsx`, `sonner` calls | `front_mobile/src/components/ui/FeedbackMessage.tsx` | Replace web toast success messages with mobile-compatible feedback. Implemented with success/info/warning variants and optional dismiss. |
| Generated Radix/shadcn UI folder | excluded as direct ports | Do not migrate DOM/Tailwind/Radix wrappers; recreate only required mobile primitives. |
| Page-level headers and back buttons | `front_mobile/src/components/layout/AppHeader.tsx` | Shared title/back/header pattern. Implemented with optional back and side actions. |
| Page containers and safe bottom spacing | `front_mobile/src/components/layout/SafeAreaScreen.tsx` and `front_mobile/src/components/layout/AppScreen.tsx` | Shared safe-area and scroll/container behavior. Implemented with safe-area and scroll/static modes. |

## Static Data Mapping

Source: `minha-saude-feminina mobile/src/data/mockData.ts`

Target: `front_mobile/src/data/mockData.ts`

| Source export | Target export | Notes |
|---|---|---|
| `mockUser` | `mockUser` plus `UserProfile` type | Preserve profile, cycle averages, settings and stats. |
| `mockSymptomTypes` | `mockSymptomTypes` plus `SymptomType` type | Preserve ids, labels and emoji icons. |
| `mockSymptoms` | `mockSymptoms` plus `SymptomEntry` type | Preserve dates, intensity values and notes. |
| `mockReminders` | `mockReminders` plus `Reminder` type | Preserve title, type, date and completed state. |
| `mockPeriods` | `mockPeriods` plus `PeriodRange` type | Preserve period ranges for calendar logic. |
| `contentCategories` | `contentCategories` plus `ContentCategory` type | Preserve category ids, labels, icons and colors. |
| `mockContents` | `mockContents` plus `ContentArticle` type | Preserve article sections and source copy. |
| `healthTips` | `healthTips` | Preserve daily tip rotation input. |
| `quickActions` | `quickActions` plus `QuickAction` type | Preserve labels, ids and route mapping. |
| `lifeStages` | `lifeStages` plus `LifeStage` type | Preserve age labels and descriptions. |
| `emergencyContacts` | `emergencyContacts` plus `EmergencyContact` type | Preserve contact names, numbers and descriptions. |
| `chatResponses` | `chatResponses` | Preserve keyword response content. |

## Business Rule Mapping

| Source behavior | Source location | Mobile target | Rule to preserve |
|---|---|---|---|
| Cycle day calculation | `TodayPage.tsx`, `CyclePage.tsx` | `front_mobile/src/utils/cycle.ts`, `front_mobile/src/services/cycleService.ts` | Calculate days since `lastPeriodDate`, derive cycle day and days until next period from `cycleAverageDays`. |
| Cycle phase labels | `TodayPage.tsx` | `cycleService` | `cycleDay <= 5` Menstrual; `<= 13` Folicular; `<= 16` Ovulatoria; otherwise Lutea. |
| Calendar day tags | `CyclePage.tsx` | `cycleService`, `cycle` utils | Mark actual periods, predicted periods, fertile window, ovulation and symptom days. |
| Daily health tip | `TodayPage.tsx` | `cycleService` or page helper | Select `healthTips[today.getDate() % healthTips.length]`. |
| Today symptoms | `TodayPage.tsx` | `symptomsService` | Filter symptoms by today's ISO date. |
| Upcoming reminders | `TodayPage.tsx` | `remindersService` | Show incomplete reminders, limited to three. |
| Content filtering | `ContentsPage.tsx` | `contentService`, `text` utils | Filter by category and case-insensitive title/summary search. |
| Content not-found | `ContentDetailPage.tsx` | `contentService` | Unknown id shows a visible not-found state. |
| Content feedback | `ContentDetailPage.tsx` | `FeedbackMessage` | Preserve success meanings: content saved, link copied, reminder added. |
| Symptom selection | `SymptomsPage.tsx` | `symptomsService` | Select adds symptom with `leve`; deselect removes; intensity updates by type. |
| Symptom save | `SymptomsPage.tsx` | `symptomsService`, `FeedbackMessage`, navigation helper | Save only when selected list is non-empty; feedback includes count; navigate back. |
| Reminder completion | `RemindersPage.tsx` | `remindersService` | Toggle `completed`, update visual state and show success feedback. |
| Anonymous response selection | `AnonymousQuestionPage.tsx` | `anonymousQuestionService` | Keyword matching for corrimento, colica, atraso/atrasou, normal, default. |
| Anonymous input validation | `AnonymousQuestionPage.tsx` | `anonymousQuestionService` or screen validation | Empty/whitespace input must not send a message. |
| Anonymous delayed response | `AnonymousQuestionPage.tsx` | `AnonymousQuestionPage.tsx` with service output | Append bot response after short delay and include UBS guidance. |
| Profile toggles | `ProfilePage.tsx` | `profileService` and optional context | Notification and data-sharing booleans toggle immediately. |
| Quick action navigation | `QuickActionsModal.tsx` | `QuickActionsSheet`, navigation types | Preserve source id-to-route mapping for menstruacao, sintomas, corrimento, colica, humor, lembrete, pergunta and conteudo. |
| Medical disclaimer | `MedicalDisclaimer.tsx` | `front_mobile/src/components/ui/MedicalDisclaimer.tsx` | Preserve normal and compact health-safety copy in educational flows. |

## Global State Decision

Profile/preferences state is shared app state because the Perfil screen mutates
notification and data-sharing values through the same profile boundary used by
other profile-aware flows. `front_mobile/src/context/AppContext.tsx` wraps
`profileService` and exposes the current profile, profile load error,
preference updates and refresh behavior.

Redux is not justified for the current migrated behavior. Existing state is
limited to local form/list/chat state plus profile/preferences, so Context API
keeps the architecture simpler while preserving a single shared boundary for
profile data.

## API Boundary Mapping

The source app currently uses static data and local component state. No active
`fetch`, `axios`, Supabase or external backend request was found in the app
flows inspected. Even so, the Expo destination must keep API access isolated in
`front_mobile/src/api` so a future backend can replace static adapters without
rewriting screens.

| API module | Initial backing source | Called by service | Purpose |
|---|---|---|---|
| `front_mobile/src/api/types.ts` | new local types | all API modules | Define normalized `ApiResult<T>` and error shape. |
| `front_mobile/src/api/contentApi.ts` | `front_mobile/src/data/mockData.ts` | `contentService` | List categories/articles and fetch article by id. |
| `front_mobile/src/api/profileApi.ts` | `front_mobile/src/data/mockData.ts` plus local state | `profileService` | Read profile and update preference toggles. |
| `front_mobile/src/api/symptomsApi.ts` | `front_mobile/src/data/mockData.ts` plus local state | `symptomsService` | Read symptom types/entries and save selected symptoms. |
| `front_mobile/src/api/remindersApi.ts` | `front_mobile/src/data/mockData.ts` plus local state | `remindersService` | Read reminders and toggle completion. |
| `front_mobile/src/api/supportApi.ts` | `front_mobile/src/data/mockData.ts` | `supportService` | Read emergency contacts and support content. |

Screens in `front_mobile/src/pages` must not contain raw HTTP logic. They should
call services/hooks, and those services may call `src/api`.

## Asset Mapping

| Source asset | Mobile decision |
|---|---|
| `public/favicon.ico` | Candidate visual reference for future Expo app icon work; do not overwrite current Expo icons until asset task T050. |
| `public/placeholder.svg` | Do not migrate unless a placeholder is explicitly needed; only used by Lovable placeholder `Index.tsx`. |
| `public/robots.txt` | Exclude; web-only. |
| `front_mobile/assets/images/*` | Existing Expo template assets; preserve until the asset migration task decides replacements. |

Asset migration status:

- `public/favicon.ico` was copied to `front_mobile/src/assets/favicon.ico` as
  the preserved source visual reference.
- `public/placeholder.svg` remains excluded because the mapped source screen
  that used it is not a product route.
- `public/robots.txt` remains excluded because it is web-only.
- Existing Expo template assets under `front_mobile/assets/images/` were left
  untouched.

## Shared Base Migration Status

- `front_mobile/src/utils/theme.ts` recreates the source CSS/Tailwind color,
  spacing, typography, radius and card shadow tokens as React Native-friendly
  constants.
- `front_mobile/src/data/mockData.ts` now contains the static source data from
  `minha-saude-feminina mobile/src/data/mockData.ts` plus exported TypeScript
  types for profile, symptoms, reminders, periods, content categories, quick
  actions, life stages, emergency contacts and anonymous messages.
- Source data remains local and static at this stage; API adapters and services
  will wrap it in later Phase 5 tasks.
- `front_mobile/src/utils/date.ts` provides ISO date parsing, formatting,
  date comparison and day arithmetic helpers for screens/services.
- `front_mobile/src/utils/text.ts` provides accent-insensitive normalization
  and matching helpers for search/filter flows.
- `front_mobile/src/utils/cycle.ts` preserves the source cycle rules for cycle
  day, phase, predicted period, fertile window, ovulation and calendar status.
- `front_mobile/src/api/types.ts` defines the normalized `ApiResult<T>` and
  `ApiError` contract required by `api-contract.md`.
- `front_mobile/src/api/contentApi.ts` exposes local content category/article
  reads through the API boundary and returns `CONTENT_NOT_FOUND` for unknown
  content detail ids.
- `front_mobile/src/api/profileApi.ts`, `symptomsApi.ts`, `remindersApi.ts`
  and `supportApi.ts` expose local mock data behind normalized API results.
- `front_mobile/src/services/contentService.ts` preserves category filtering,
  accent-insensitive search and content detail lookup.
- `front_mobile/src/services/cycleService.ts` composes profile, period,
  symptom, health tip and calendar status rules for Today and Cycle screens.
- `front_mobile/src/services/symptomsService.ts` preserves select/deselect,
  default `leve` intensity, intensity updates and save feedback count rules.
- `front_mobile/src/services/remindersService.ts` wraps reminder listing,
  date formatting and completion feedback.
- `front_mobile/src/services/profileService.ts` wraps profile stats and
  immediate notification/data-sharing preference toggles.
- `front_mobile/src/services/supportService.ts` wraps emergency contacts and
  support screen copy.
- `front_mobile/src/services/anonymousQuestionService.ts` preserves blank
  input validation, keyword response selection and UBS guidance for anonymous
  questions.

## Dependency Replacement Map

| Web dependency/pattern | Mobile replacement |
|---|---|
| `react-router-dom` | React Navigation |
| `BrowserRouter`, `Routes`, `Route` | `NavigationContainer`, stack and bottom tabs |
| `sonner` | Mobile feedback component or native alert pattern |
| `@radix-ui/*` | React Native primitives/custom components |
| `lucide-react` | `@expo/vector-icons` or existing Expo icon approach; add another icon package only if justified |
| `react-dom` | Removed from the native-only destination dependencies. |
| `@tanstack/react-query` | Do not carry unless real async backend requests justify it |
| `react-hook-form`, `zod`, `@hookform/resolvers` | Local React Native form state and small validation helpers first |
| `tailwindcss`, `tailwindcss-animate`, `tailwind-merge`, `class-variance-authority`, `clsx` | `StyleSheet` plus shared theme constants; small helper only if needed |
| `react-day-picker` | Custom React Native calendar/list layout for cycle screen |
| `recharts` | React Native cards/lists first; chart dependency only if future UI requires charts |
| `cmdk`, `input-otp`, `vaul`, `embla-carousel-react`, `react-resizable-panels`, `next-themes` | Excluded; web-only or unnecessary for current flows |
| HTML elements | `View`, `Text`, `Pressable`, `TextInput`, `Image`, `ScrollView`, `FlatList`, `Modal` |
| Tailwind/CSS variables | `StyleSheet` plus shared theme constants |
| DOM refs/scrollIntoView | React Native scroll refs/list behavior |

## Destination Expo Verification

Verified under `front_mobile/`:

| Area | Current state | Migration implication |
|---|---|---|
| Project root | Existing Expo project named `front_mobile` | Reuse this project; do not create another Expo project. |
| `package.json` main | `index.ts` | Registers `App.tsx` through Expo `registerRootComponent`; Expo Router is not the app entry. |
| Scripts | `start`, `android`, `ios`, `lint` | Keep useful native Expo scripts; no source web or reset scripts are copied. |
| Expo configuration | `app.json` keeps native icon/splash assets, scheme `frontmobile`, Expo SDK 54-compatible app metadata, `web.output: single` and `experiments.reactCompiler: true`; Expo Router plugin and typed routes are disabled. | Current configuration matches the `App.tsx` + React Navigation migration path without requiring Expo Router. |
| Existing navigation scaffold | removed | Expo Router scaffold files were removed after `App.tsx` + React Navigation became the app path. |
| Template route files | removed | Template route files no longer exist in the destination app. |
| TypeScript configuration | `tsconfig.json` extends `expo/tsconfig.base`, enables `strict: true`, includes `**/*.ts`, `**/*.tsx`, `.expo/types/**/*.ts` and `expo-env.d.ts`, and defines `@/*` as a root-relative alias | Compatible with the Expo TypeScript baseline for the current scaffold; future migration files can rely on strict checking, while alias usage should be revisited if imports move exclusively under `src/`. |
| Required `src/` | Complete required folder structure now exists: `src/api/`, `src/assets/`, `src/components/layout/`, `src/components/ui/`, `src/context/`, `src/data/`, `src/hooks/`, `src/pages/`, `src/redux/`, `src/services/`, and `src/utils/` | Use these folders for all migrated implementation files. |
| Root `App.tsx` | Wires `NavigationContainer`, native stack, bottom tabs, `AppProvider` and migrated pages | This is the migrated app entry component. |
| Root `index.ts` | Registers `App.tsx` with Expo `registerRootComponent` | `package.json` points directly to this file. |
| Template components | removed | Template `components/`, `constants/`, `hooks/` and `scripts/reset-project.js` were removed to keep the destination architecture focused on `front_mobile/src`. |
| Existing assets | `assets/images/*` | Preserve until asset migration task; do not delete during verification. |

Scaffold changes completed:

- `front_mobile/package.json` now starts from `index.ts`, which registers the
  root `App.tsx`, instead of `expo-router/entry`.
- `front_mobile/app.json` no longer enables the Expo Router plugin or
  `experiments.typedRoutes`; native icon, splash and app metadata were
  preserved, and `web.output` was set to `single` so Metro does not require
  Expo Router.
- Expo Router scaffold routes, template components, template hooks, template
  constants and `scripts/reset-project.js` were removed because the app uses
  `index.ts`, `App.tsx` and `front_mobile/src`.
- The existing Expo project root remains unchanged. No new Expo project was
  created.
- React Navigation base packages required by the navigation contract are
  present in `package.json`: `@react-navigation/native`,
  `@react-navigation/bottom-tabs`, `react-native-screens`,
  `react-native-safe-area-context` and `react-native-gesture-handler`.
- `@react-navigation/native-stack` is declared in `package.json` for the root
  stack navigator planned by the navigation contract and uses the Expo SDK 54
  expected range.

Current useful installed dependencies:

- Expo SDK 54, React 19.1, React Native 0.81.
- `@react-navigation/native`, `@react-navigation/bottom-tabs`,
  `react-native-screens`, `react-native-safe-area-context`,
  `react-native-gesture-handler`.
- `@expo/vector-icons`, `expo-font`, `expo-splash-screen`,
  `expo-status-bar`.

Current dependency risks:

- No app-level dependency mismatch is reported by `npx expo-doctor`.
- `npm audit --audit-level=moderate` still reports vulnerabilities in the Expo
  SDK 54 dependency tree. The automatic fix upgrades to Expo 56, so it should
  be handled as a planned SDK upgrade.

## Final Validation Notes

Validation completed after the migrated screens, services and navigation were
wired:

- `npm run lint` passes from `front_mobile/`.
- `npx tsc --noEmit` passes from `front_mobile/`.
- `npx expo-doctor` passes all 18 checks.
- `npx expo start` starts the Expo Metro server on the default port. The
  command was stopped by the validation timeout because Metro is a long-running
  process.
- Navigation validation confirms `Today`, `Cycle`, `Contents` and `Profile`
  are bottom tabs, while `ContentDetail`, `AnonymousQuestion`, `Symptoms`,
  `Reminders`, `Support`, `LifeStages` and `NotFound` are stack screens.
- Quick-action validation confirms the center tab-bar button opens
  `QuickActionsSheet` and routes `menstruacao`, `sintomas`, `corrimento`,
  `colica`, `humor`, `lembrete`, `pergunta` and `conteudo` according to the
  navigation contract.
- Stack screen back actions use `navigateBackOrToday`, preserving source back
  behavior while falling back to Hoje when no history exists.
- API boundary validation confirms normalized `ApiResult<T>` modules exist in
  `front_mobile/src/api`, services consume those adapters, and pages contain no
  raw HTTP request logic.
- Folder responsibility validation confirms migrated code is organized under
  `src/api`, `src/assets`, `src/components`, `src/context`, `src/data`,
  `src/pages`, `src/redux`, `src/services` and `src/utils`.

## Source Preservation Verification

The brownfield source project `minha-saude-feminina mobile/` was used only for
inspection and behavior comparison during this implementation pass. No task in
this pass required writing to the source project; implementation changes were
kept in `front_mobile/` and Spec Kit documentation/task files.

## Known Pendencies

- Full interactive device/emulator walkthrough is still recommended for final
  tactile validation of mobile layouts, gestures and keyboard behavior.
- `npm audit --audit-level=moderate` reports moderate vulnerabilities in the
  Expo dependency tree. The suggested automatic fix upgrades to Expo 56, so it
  should be handled as a planned SDK upgrade rather than an automatic patch.
- Add reminder and edit profile buttons are preserved as visual placeholders
  because the source app also does not implement those flows.

## Final State Architecture

Profile/preferences state is centralized in
`front_mobile/src/context/AppContext.tsx`, which wraps `profileService` and
keeps notification/data-sharing updates available to migrated screens through
Context API.

Redux remains intentionally unused. `front_mobile/src/redux/README.md`
documents the decision and the condition for introducing a store in the future:
only add Redux if a future feature introduces cross-screen state that cannot
remain local or be cleanly handled by Context API.
