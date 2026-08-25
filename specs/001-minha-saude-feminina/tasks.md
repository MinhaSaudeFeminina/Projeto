# Tasks: Minha Saúde Feminina

**Input**: Design documents from `specs/001-minha-saude-feminina/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/openapi.yaml](./contracts/openapi.yaml), [quickstart.md](./quickstart.md)

**Tests**: Required by the feature plan for authentication, authorization, admin user management, editorial workflow, audit, history, notifications, UTF-8, accent preservation, accent-tolerant search, accessibility, and absence of active mobile endpoints.

**Organization**: Tasks are grouped by user story in priority order so each administrative flow can be implemented and tested independently after the shared foundation is complete.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare Laravel backend, React admin web, PostgreSQL/UTF-8 assumptions, and shared conventions for the admin-only increment.

- [X] T001 Update backend environment documentation for Laravel, PostgreSQL, mail, admin API base URL, and UTF-8 in backend/README.md
- [X] T002 Update backend environment variables for PostgreSQL, mail, app URL, and admin auth in backend/.env.example
- [X] T003 [P] Document admin API client conventions and UTF-8 JSON handling in frontend/src/services/api/README.md
- [X] T004 [P] Document backend service conventions for audit, content, notifications, and search in backend/app/Services/README.md
- [X] T005 [P] Document backend policy conventions for administrative permissions in backend/app/Policies/README.md
- [X] T006 [P] Document portal admin route and layout conventions in frontend/src/routes/README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish schema, core models, auth primitives, authorization middleware, UTF-8 handling, audit base, and admin route structure required by all stories.

**CRITICAL**: No user story work can begin until this phase is complete.

### Tests for Foundation

- [X] T007 [P] Create UTF-8 persistence test for Portuguese text in backend/tests/Feature/Foundation/Utf8PersistenceTest.php
- [X] T008 [P] Create UTF-8 JSON response test in backend/tests/Feature/Foundation/Utf8JsonResponseTest.php
- [X] T009 [P] Create admin authorization middleware test in backend/tests/Feature/Admin/AdminAuthorizationMiddlewareTest.php
- [X] T010 [P] Create audit sanitizer unit test for tokens, passwords, and payload minimization in backend/tests/Unit/Audit/AuditSanitizerTest.php
- [X] T011 [P] Create no-mobile-routes contract regression test in backend/tests/Feature/Contracts/NoMobileIncrementRoutesTest.php

### Implementation for Foundation

- [X] T012 Create administrative identity, roles, permissions, and role_permission migrations in backend/database/migrations/2026_06_13_000001_create_admin_identity_tables.php
- [X] T013 Create content categories, life stages, and age ranges migrations in backend/database/migrations/2026_06_13_000002_create_content_taxonomy_tables.php
- [X] T014 Create educational contents and content taxonomy pivot migrations in backend/database/migrations/2026_06_13_000003_create_educational_content_tables.php
- [X] T015 Create content revisions migration in backend/database/migrations/2026_06_13_000004_create_content_revisions_table.php
- [X] T016 Create editorial audit events migration in backend/database/migrations/2026_06_13_000005_create_editorial_audit_events_table.php
- [X] T017 Create admin notifications migration in backend/database/migrations/2026_06_13_000006_create_admin_notifications_table.php
- [X] T018 [P] Implement admin role helpers on the user model in backend/app/Models/User.php
- [X] T019 [P] Implement AdminRole model in backend/app/Models/AdminRole.php
- [X] T020 [P] Implement Permission model in backend/app/Models/Permission.php
- [X] T021 [P] Implement ContentCategory model in backend/app/Models/ContentCategory.php
- [X] T022 [P] Implement LifeStage model in backend/app/Models/LifeStage.php
- [X] T023 [P] Implement AgeRange model in backend/app/Models/AgeRange.php
- [X] T024 [P] Implement EducationalContent model in backend/app/Models/EducationalContent.php
- [X] T025 [P] Implement ContentRevision model in backend/app/Models/ContentRevision.php
- [X] T026 [P] Implement EditorialAuditEvent model in backend/app/Models/EditorialAuditEvent.php
- [X] T027 [P] Implement AdminNotification model in backend/app/Models/AdminNotification.php
- [X] T028 Seed canonical admin roles and permissions in backend/database/seeders/AdminRolePermissionSeeder.php
- [X] T029 Seed canonical life stages and age ranges in backend/database/seeders/ContentTaxonomySeeder.php
- [X] T030 Implement audit sanitizer in backend/app/Services/Audit/AuditSanitizer.php
- [X] T031 Implement append-only audit recorder in backend/app/Services/Audit/AuditRecorder.php
- [X] T032 Implement admin role middleware in backend/app/Http/Middleware/EnsureAdminRole.php
- [X] T033 Register admin middleware aliases and API middleware in backend/bootstrap/app.php
- [X] T034 Define versioned `/api/v1/admin` route group in backend/routes/api.php
- [X] T035 Create shared admin API resource response helper with PT-BR messages in backend/app/Http/Resources/Admin/Concerns/UsesAdminApiResponses.php
- [X] T036 Create frontend admin API client with UTF-8 JSON assumptions in frontend/src/services/api/client.ts

**Checkpoint**: Foundation ready. User story implementation can now begin.

---

## Phase 3: User Story 1 - Acessar o portal administrativo (Priority: P1) MVP

**Goal**: Usuária administrativa acessa o portal com credenciais próprias and executes only actions allowed by her profile.

**Independent Test**: Authenticate active and inactive administrative users, verify dashboard access, verify logout, and verify a low-privilege user is blocked from protected actions.

### Tests for User Story 1

- [X] T037 [P] [US1] Create backend admin login/logout/me feature test in backend/tests/Feature/Admin/AdminAuthTest.php
- [X] T038 [P] [US1] Create inactive admin access feature test in backend/tests/Feature/Admin/InactiveAdminAccessTest.php
- [X] T039 [P] [US1] Create frontend admin login page test in frontend/src/tests/pages/AdminLoginPage.test.tsx
- [X] T040 [P] [US1] Create frontend authenticated route guard test in frontend/src/tests/routes/AdminRoutes.test.tsx

### Implementation for User Story 1

- [X] T041 [US1] Implement admin login request validation in backend/app/Http/Requests/Admin/LoginAdminRequest.php
- [X] T042 [US1] Implement admin auth controller for login, logout, and me in backend/app/Http/Controllers/Api/V1/Admin/AuthController.php
- [X] T043 [US1] Add admin auth routes in backend/routes/api.php
- [X] T044 [US1] Implement admin auth API service in frontend/src/services/api/adminAuthApi.ts
- [X] T045 [US1] Implement admin auth state store in frontend/src/state/adminAuthStore.ts
- [X] T046 [US1] Implement admin login page in frontend/src/pages/AdminLoginPage.tsx
- [X] T047 [US1] Implement authenticated admin route guard in frontend/src/routes/AdminRoutes.tsx
- [X] T048 [US1] Implement initial admin dashboard shell in frontend/src/pages/DashboardPage.tsx
- [X] T049 [US1] Review PT-BR login, logout, and access-denied copy in frontend/src/pages/AdminLoginPage.tsx

**Checkpoint**: US1 is independently functional and testable.

---

## Phase 4: User Story 2 - Gerenciar usuárias administrativas e permissões (Priority: P1)

**Goal**: Admin cadastra, edita, desativa, reativa, and assigns administrative profiles.

**Independent Test**: Create administrative users, change profile, deactivate access, verify blocked access, and verify audit records for access changes.

### Tests for User Story 2

- [X] T050 [P] [US2] Create admin user management backend test in backend/tests/Feature/Admin/AdminUserManagementTest.php
- [X] T051 [P] [US2] Create admin role assignment backend test in backend/tests/Feature/Admin/AdminRoleAssignmentTest.php
- [X] T052 [P] [US2] Create admin user management page test in frontend/src/tests/pages/AdminUserManagementPage.test.tsx
- [X] T053 [P] [US2] Create admin user audit test in backend/tests/Feature/Admin/AdminUserAuditTest.php

### Implementation for User Story 2

- [X] T054 [US2] Implement admin user policy in backend/app/Policies/AdminUserPolicy.php
- [X] T055 [US2] Implement admin user create request validation in backend/app/Http/Requests/Admin/StoreAdminUserRequest.php
- [X] T056 [US2] Implement admin user update request validation in backend/app/Http/Requests/Admin/UpdateAdminUserRequest.php
- [X] T057 [US2] Implement admin user controller in backend/app/Http/Controllers/Api/V1/Admin/AdminUserController.php
- [X] T058 [US2] Implement roles and permissions read controller in backend/app/Http/Controllers/Api/V1/Admin/RolePermissionController.php
- [X] T059 [US2] Add admin user, role, and permission routes in backend/routes/api.php
- [X] T060 [US2] Implement admin user API service in frontend/src/services/api/adminUserApi.ts
- [X] T061 [US2] Implement role and permission API service in frontend/src/services/api/rolePermissionApi.ts
- [X] T062 [US2] Implement admin user list page in frontend/src/pages/AdminUserListPage.tsx
- [X] T063 [US2] Implement admin user form page in frontend/src/pages/AdminUserFormPage.tsx
- [X] T064 [US2] Implement role selector component in frontend/src/components/admin/RoleSelector.tsx
- [X] T065 [US2] Add Admin-only navigation guards for user management in frontend/src/routes/AdminRoutes.tsx

**Checkpoint**: US2 is independently functional and testable.

---

## Phase 5: User Story 3 - Criar e editar conteúdos educativos (Priority: P1)

**Goal**: Acadêmica/autora creates educational content drafts, edits own drafts, associates category/life stages/age ranges, and preserves history.

**Independent Test**: Create own draft, edit own draft, associate taxonomies, block editing another author draft, and verify revision history.

### Tests for User Story 3

- [X] T066 [P] [US3] Create content draft backend test in backend/tests/Feature/Admin/ContentDraftTest.php
- [X] T067 [P] [US3] Create content ownership authorization test in backend/tests/Feature/Admin/ContentOwnershipTest.php
- [X] T068 [P] [US3] Create content taxonomy association test in backend/tests/Feature/Admin/ContentTaxonomyTest.php
- [X] T069 [P] [US3] Create content revision backend test in backend/tests/Feature/Admin/ContentRevisionTest.php
- [X] T070 [P] [US3] Create content editor page test in frontend/src/tests/pages/ContentEditorPage.test.tsx
- [X] T071 [P] [US3] Create PT-BR content accent rendering test in frontend/src/tests/i18n/ContentAccentRendering.test.tsx

### Implementation for User Story 3

- [X] T072 [US3] Implement educational content policy in backend/app/Policies/EducationalContentPolicy.php
- [X] T073 [US3] Implement content create request with category, life stages, age ranges, and UTF-8 validation in backend/app/Http/Requests/Admin/StoreContentRequest.php
- [X] T074 [US3] Implement content update request with own-draft constraints in backend/app/Http/Requests/Admin/UpdateContentRequest.php
- [X] T075 [US3] Implement content revision recorder in backend/app/Services/Content/ContentRevisionRecorder.php
- [X] T076 [US3] Implement content slug and search text preparation service in backend/app/Services/Content/ContentTextPreparationService.php
- [X] T077 [US3] Implement admin content controller for create, list, detail, and update in backend/app/Http/Controllers/Api/V1/Admin/ContentController.php
- [X] T078 [US3] Implement taxonomy read controller for categories, life stages, and age ranges in backend/app/Http/Controllers/Api/V1/Admin/TaxonomyController.php
- [X] T079 [US3] Add content and taxonomy routes in backend/routes/api.php
- [X] T080 [US3] Implement content API service in frontend/src/services/api/contentApi.ts
- [X] T081 [US3] Implement taxonomy API service in frontend/src/services/api/taxonomyApi.ts
- [X] T082 [US3] Implement content list page in frontend/src/pages/ContentListPage.tsx
- [X] T083 [US3] Implement content editor page with category, life-stage, and age-range controls in frontend/src/pages/ContentEditorPage.tsx
- [X] T084 [US3] Implement editorial status badge in frontend/src/components/content/EditorialStatusBadge.tsx
- [X] T085 [US3] Review content editor PT-BR copy and accent preservation in frontend/src/pages/ContentEditorPage.tsx

**Checkpoint**: US3 is independently functional and testable.

---

## Phase 6: User Story 4 - Revisar, aprovar ou solicitar ajustes (Priority: P1)

**Goal**: Revisor/professor reviews content in review, approves it, or requests adjustments with an editorial comment.

**Independent Test**: Submit content for review, request adjustments, resubmit, approve, and verify authorization and audit events.

### Tests for User Story 4

- [X] T086 [P] [US4] Create editorial workflow backend test for submit, adjustments, and approval in backend/tests/Feature/Admin/EditorialWorkflowTest.php
- [X] T087 [P] [US4] Create editorial authorization backend test in backend/tests/Feature/Admin/EditorialAuthorizationTest.php
- [X] T088 [P] [US4] Create review queue page test in frontend/src/tests/pages/ReviewQueuePage.test.tsx
- [X] T089 [P] [US4] Create editorial transition unit test in backend/tests/Unit/Content/EditorialWorkflowServiceTest.php

### Implementation for User Story 4

- [X] T090 [US4] Implement editorial workflow service for draft, in-review, approved transitions in backend/app/Services/Content/EditorialWorkflowService.php
- [X] T091 [US4] Implement review action request validation in backend/app/Http/Requests/Admin/ReviewContentRequest.php
- [X] T092 [US4] Implement editorial action controller for submit-review, request-adjustments, and approve in backend/app/Http/Controllers/Api/V1/Admin/EditorialActionController.php
- [X] T093 [US4] Add submit-review, request-adjustments, and approve routes in backend/routes/api.php
- [X] T094 [US4] Implement editorial API service in frontend/src/services/api/editorialApi.ts
- [X] T095 [US4] Implement review queue page in frontend/src/pages/ReviewQueuePage.tsx
- [X] T096 [US4] Implement review action dialog with required adjustment comment in frontend/src/components/content/ReviewActionDialog.tsx
- [X] T097 [US4] Add review and approval actions to content detail UI in frontend/src/pages/ContentEditorPage.tsx

**Checkpoint**: US4 is independently functional and testable.

---

## Phase 7: User Story 5 - Publicar e arquivar conteúdos (Priority: P1)

**Goal**: Admin publishes approved content and archives published content with audit and publication metadata.

**Independent Test**: Block publication without approval, publish approved content, archive published content, and verify metadata/history.

### Tests for User Story 5

- [X] T098 [P] [US5] Create publish/archive workflow backend test in backend/tests/Feature/Admin/PublishArchiveContentTest.php
- [X] T099 [P] [US5] Create publish/archive authorization backend test in backend/tests/Feature/Admin/PublishArchiveAuthorizationTest.php
- [X] T100 [P] [US5] Create publication metadata backend test in backend/tests/Feature/Admin/PublicationMetadataTest.php

### Implementation for User Story 5

- [X] T101 [US5] Extend editorial workflow service with publish and archive transitions in backend/app/Services/Content/EditorialWorkflowService.php
- [X] T102 [US5] Extend editorial action controller with publish and archive actions in backend/app/Http/Controllers/Api/V1/Admin/EditorialActionController.php
- [X] T103 [US5] Add publish and archive routes in backend/routes/api.php
- [X] T104 [US5] Add publish and archive methods to editorial API service in frontend/src/services/api/editorialApi.ts
- [X] T105 [US5] Add Admin-only publish and archive controls in frontend/src/pages/ContentListPage.tsx
- [X] T106 [US5] Add publication and archive metadata display in frontend/src/pages/ContentAuditPage.tsx

**Checkpoint**: US5 is independently functional and testable.

---

## Phase 8: User Story 6 - Consultar auditoria editorial e histórico (Priority: P1)

**Goal**: Authorized administrative users view audit events and revision history according to permissions.

**Independent Test**: Complete the editorial cycle and verify creation, edit, submit, adjustment, approval, publication, archive, and revision records.

### Tests for User Story 6

- [X] T107 [P] [US6] Create content audit backend test in backend/tests/Feature/Admin/ContentAuditTest.php
- [X] T108 [P] [US6] Create content history backend test in backend/tests/Feature/Admin/ContentHistoryTest.php
- [X] T109 [P] [US6] Create audit authorization backend test in backend/tests/Feature/Admin/AuditAuthorizationTest.php
- [X] T110 [P] [US6] Create content audit page test in frontend/src/tests/pages/ContentAuditPage.test.tsx

### Implementation for User Story 6

- [X] T111 [US6] Implement content audit controller in backend/app/Http/Controllers/Api/V1/Admin/ContentAuditController.php
- [X] T112 [US6] Implement content revision controller in backend/app/Http/Controllers/Api/V1/Admin/ContentRevisionController.php
- [X] T113 [US6] Add content audit and revision routes in backend/routes/api.php
- [X] T114 [US6] Implement audit API service in frontend/src/services/api/auditApi.ts
- [X] T115 [US6] Implement content audit page with event list and revision history in frontend/src/pages/ContentAuditPage.tsx
- [X] T116 [US6] Implement audit event timeline component in frontend/src/components/content/AuditTimeline.tsx

**Checkpoint**: US6 is independently functional and testable.

---

## Phase 9: User Story 7 - Receber notificações administrativas (Priority: P2)

**Goal**: Administrative users receive panel and e-mail notifications for editorial events that require attention.

**Independent Test**: Generate submit, adjustment, approval, publication, and archive events; verify correct recipients, panel notifications, UTF-8 e-mails, and minimized content exposure.

### Tests for User Story 7

- [X] T117 [P] [US7] Create admin notification backend test in backend/tests/Feature/Admin/AdminNotificationTest.php
- [X] T118 [P] [US7] Create notification recipient resolver unit test in backend/tests/Unit/Notifications/AdminNotificationRecipientResolverTest.php
- [X] T119 [P] [US7] Create admin notification e-mail rendering test in backend/tests/Feature/Mail/AdminNotificationMailTest.php
- [X] T120 [P] [US7] Create admin notifications page test in frontend/src/tests/pages/AdminNotificationsPage.test.tsx

### Implementation for User Story 7

- [X] T121 [US7] Implement admin notification recipient resolver in backend/app/Services/Notifications/AdminNotificationRecipientResolver.php
- [X] T122 [US7] Implement admin notification service in backend/app/Services/Notifications/AdminNotificationService.php
- [X] T123 [US7] Implement admin action required mailable in backend/app/Mail/AdminActionRequiredMail.php
- [X] T124 [US7] Implement admin notification mail sender in backend/app/Services/Notifications/AdminNotificationMailSender.php
- [X] T125 [US7] Implement admin notification controller in backend/app/Http/Controllers/Api/V1/Admin/AdminNotificationController.php
- [X] T126 [US7] Add admin notification routes in backend/routes/api.php
- [X] T127 [US7] Configure mail UTF-8 sender defaults in backend/config/mail.php
- [X] T128 [US7] Implement notification API service in frontend/src/services/api/notificationApi.ts
- [X] T129 [US7] Implement admin notifications page in frontend/src/pages/AdminNotificationsPage.tsx
- [X] T130 [US7] Add notifications indicator to admin layout in frontend/src/components/layout/AdminLayout.tsx

**Checkpoint**: US7 is independently functional and testable.

---

## Phase 10: User Story 8 - Buscar conteúdos no portal (Priority: P2)

**Goal**: Administrative users search and filter contents with accent-tolerant matching while displayed text preserves correct accents.

**Independent Test**: Create content containing “menstruação”, search “menstruacao”, verify result is found and displayed with correct spelling; repeat for “saúde” and “prevenção”.

### Tests for User Story 8

- [X] T131 [P] [US8] Create accent-tolerant admin search backend test in backend/tests/Feature/Admin/AccentTolerantAdminSearchTest.php
- [X] T132 [P] [US8] Create search normalizer unit test in backend/tests/Unit/Search/AccentInsensitiveSearchNormalizerTest.php
- [X] T133 [P] [US8] Create content search performance smoke test in backend/tests/Feature/Performance/ContentSearchPerformanceTest.php
- [X] T134 [P] [US8] Create frontend content search test in frontend/src/tests/pages/ContentSearch.test.tsx

### Implementation for User Story 8

- [X] T135 [US8] Implement accent-insensitive search normalizer in backend/app/Services/Search/AccentInsensitiveSearchNormalizer.php
- [X] T136 [US8] Implement content search query service in backend/app/Services/Content/AdminContentSearchQuery.php
- [X] T137 [US8] Add normalized search index update handling in backend/app/Services/Content/ContentTextPreparationService.php
- [X] T138 [US8] Apply q, status, category, life stage, age range, and author filters in backend/app/Http/Controllers/Api/V1/Admin/ContentController.php
- [X] T139 [US8] Implement content search and filter API parameters in frontend/src/services/api/contentApi.ts
- [X] T140 [US8] Implement content search input in frontend/src/components/content/ContentSearchInput.tsx
- [X] T141 [US8] Implement content filter controls in frontend/src/components/content/ContentFilters.tsx
- [X] T142 [US8] Wire search and filters into content list page in frontend/src/pages/ContentListPage.tsx

**Checkpoint**: US8 is independently functional and testable.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Validate quality gates, documentation, accessibility, UTF-8, contracts, and MVP boundaries across all selected stories.

- [ ] T143 [P] Validate OpenAPI admin route coverage in backend/tests/Feature/Contracts/OpenApiAdminRouteCoverageTest.php
- [ ] T144 [P] Add admin accessibility regression checks in frontend/src/tests/accessibility/AdminAccessibility.test.tsx
- [ ] T145 [P] Add backend log and error minimization regression test in backend/tests/Feature/Foundation/SensitiveLogMinimizationTest.php
- [ ] T146 [P] Add frontend global PT-BR accent rendering test in frontend/src/tests/i18n/GlobalAccentRendering.test.tsx
- [ ] T147 Review backend documentation for admin-only MVP boundaries in backend/README.md
- [ ] T148 Review frontend documentation for admin roles, editorial workflow, and PT-BR copy in frontend/README.md
- [ ] T149 Review no-mobile implementation boundary documentation in specs/001-minha-saude-feminina/quickstart.md
- [ ] T150 Run backend automated test suite using backend/phpunit.xml
- [ ] T151 Run admin web test suite using frontend/vitest.config.ts
- [ ] T152 Execute quickstart validation scenarios in specs/001-minha-saude-feminina/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundation**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 US1 Admin Access**: Depends on Foundation.
- **Phase 4 US2 Admin Users and Permissions**: Depends on US1 and Foundation.
- **Phase 5 US3 Content Drafts**: Depends on Foundation and can start after US1.
- **Phase 6 US4 Review and Approval**: Depends on US3 content draft workflow.
- **Phase 7 US5 Publish and Archive**: Depends on US4 approval workflow.
- **Phase 8 US6 Audit and History**: Depends on US3 and should be completed before release.
- **Phase 9 US7 Notifications**: Depends on workflow events from US4 and US5.
- **Phase 10 US8 Search**: Depends on content schema from Foundation and US3.
- **Phase 11 Polish**: Depends on all selected stories.

### User Story Dependencies

- **US1 Acessar o portal administrativo**: MVP slice after Foundation.
- **US2 Gerenciar usuárias administrativas e permissões**: Requires US1 authentication.
- **US3 Criar e editar conteúdos educativos**: Requires Foundation and authenticated admin shell.
- **US4 Revisar, aprovar ou solicitar ajustes**: Requires US3 drafts.
- **US5 Publicar e arquivar conteúdos**: Requires US4 approval.
- **US6 Consultar auditoria editorial e histórico**: Reuses audit/revision events from US3-US5.
- **US7 Receber notificações administrativas**: Reuses workflow events from US4-US5.
- **US8 Buscar conteúdos no portal**: Reuses content and taxonomy data from US3.

### Within Each User Story

- Tests must be written first and fail before implementation.
- Migrations/models before services.
- Services before controllers/endpoints.
- Endpoints before frontend integration.
- Backend authorization and audit checks are part of story completion.
- PT-BR/UTF-8 verification is part of story completion, not only polish.

## Parallel Opportunities

- Setup documentation tasks T003-T006 can run in parallel.
- Foundation tests T007-T011 can run in parallel.
- Foundation models T018-T027 can run in parallel after migrations are defined.
- User story tests marked [P] can run in parallel within each story.
- Frontend service/page work can run in parallel with backend controllers after API contracts are stable.
- US6 audit UI and US8 search UI can be developed in parallel after US3 content APIs are stable.

## Parallel Example: User Story 3

```text
Task: "T066 [P] [US3] Create content draft backend test in backend/tests/Feature/Admin/ContentDraftTest.php"
Task: "T067 [P] [US3] Create content ownership authorization test in backend/tests/Feature/Admin/ContentOwnershipTest.php"
Task: "T068 [P] [US3] Create content taxonomy association test in backend/tests/Feature/Admin/ContentTaxonomyTest.php"
Task: "T070 [P] [US3] Create content editor page test in frontend/src/tests/pages/ContentEditorPage.test.tsx"
```

## Parallel Example: User Story 7

```text
Task: "T117 [P] [US7] Create admin notification backend test in backend/tests/Feature/Admin/AdminNotificationTest.php"
Task: "T118 [P] [US7] Create notification recipient resolver unit test in backend/tests/Unit/Notifications/AdminNotificationRecipientResolverTest.php"
Task: "T119 [P] [US7] Create admin notification e-mail rendering test in backend/tests/Feature/Mail/AdminNotificationMailTest.php"
Task: "T120 [P] [US7] Create admin notifications page test in frontend/src/tests/pages/AdminNotificationsPage.test.tsx"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundation.
3. Complete Phase 3 US1 Admin Access.
4. Stop and validate login, logout, route guard, inactive user blocking, and role-blocked action.

### Incremental Delivery

1. Deliver admin access and dashboard shell.
2. Add admin user/profile management.
3. Add content drafts with category/life-stage/age-range associations.
4. Add review, approval, publication, and archiving.
5. Add audit/history views.
6. Add panel/e-mail notifications.
7. Add accent-tolerant search and final quality gates.

### Quality Gates

- No admin endpoint works without authentication.
- No role can execute actions outside its permissions.
- No active mobile or final-user endpoint is introduced.
- Every editorial transition creates audit.
- Published content has approval metadata.
- All visible admin text and e-mails preserve Português do Brasil with accents and cedilha.
- Searches without accents find accented content without changing displayed spelling.
- Logs and e-mails do not expose passwords, tokens, or unnecessary full content.

## Notes

- [P] tasks use different files and can be parallelized when dependencies are met.
- [US1] through [US8] map to the user stories in spec.md.
- Tests are included because the current feature plan explicitly requires coverage.
- Keep implementation scoped to backend, PostgreSQL, portal admin, and e-mail admin. Do not implement app mobile or active mobile endpoints in this increment.
