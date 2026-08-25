# Quickstart: Minha Saúde Feminina

**Date**: 2026-06-13  
**Scope**: Admin web + backend API + PostgreSQL.

## Preconditions

- Backend configured with PostgreSQL and UTF-8.
- Portal administrative web configured to call the backend API.
- At least one Admin user seeded or created by setup.
- Mail configured for local testing or captured by a test mailer.

## Scenario 1: Admin Login

1. Open the portal administrative login page.
2. Sign in with an active Admin user.
3. Confirm the dashboard loads.
4. Confirm protected admin routes are unavailable after logout.

**Expected result**: Active Admin can access the portal; invalid or inactive access is blocked.

## Scenario 2: Manage Administrative Users

1. As Admin, create an Acadêmica/autora.
2. As Admin, create a Revisor/professor.
3. Edit one administrative user and change the assigned profile.
4. Deactivate an administrative user.
5. Attempt login with the deactivated user.

**Expected result**: Profile changes affect permissions, deactivated users cannot access the portal, and audit events are recorded.

## Scenario 3: Validate Taxonomies

1. As Admin, open content categories.
2. Confirm categories display Portuguese text with accents.
3. Open life stages and age ranges.
4. Confirm stages such as “Gestação”, “Puerpério” and “Climatério/menopausa” are available.
5. Confirm age ranges such as “10-14”, “15-19”, “20-29”, “30-39”, “40-49” and “50+” are available.

**Expected result**: Categories, life stages and age ranges are available for content association and preserve UTF-8 text.

## Scenario 4: Draft and Submit Content

1. Sign in as Acadêmica/autora.
2. Create content titled “Saúde íntima e menstruação”.
3. Associate a category, at least one life stage and at least one age range.
4. Save it as Rascunho.
5. Edit the draft and confirm history is updated.
6. Submit it for review.

**Expected result**: Content moves from Rascunho to Em revisão, with author, timestamps and audit events.

## Scenario 5: Request Adjustments

1. Sign in as Revisor/professor.
2. Open the review queue.
3. Select the submitted content.
4. Request adjustments with an editorial comment.

**Expected result**: Content returns to Rascunho, the author is notified, and the event is audited.

## Scenario 6: Approve, Publish and Archive

1. Submit adjusted content for review again.
2. Sign in as Revisor/professor and approve it.
3. Sign in as Admin and publish the approved content.
4. Archive the published content.

**Expected result**: The content follows Rascunho → Em revisão → Aprovado → Publicado → Arquivado, with approval date, responsible users and audit history.

## Scenario 7: Permission Boundaries

1. As Acadêmica/autora, try to approve, publish and archive content.
2. As Revisor/professor, try to publish, archive and manage users.
3. As Admin, perform publication and archiving.

**Expected result**: Forbidden actions are blocked by the backend and not only hidden in the interface.

## Scenario 8: Admin Notifications

1. Submit content for review.
2. Confirm reviewers receive panel notification.
3. Request adjustments.
4. Confirm the author receives panel notification and e-mail when configured.
5. Approve, publish and archive content.

**Expected result**: Notifications reach authorized recipients with event and action information only.

## Scenario 9: Administrative E-mail UTF-8

1. Trigger an adjustment request with comment “Revisar orientação sobre prevenção e saúde íntima”.
2. Capture the administrative e-mail.
3. Verify subject and body preserve “orientação”, “prevenção” and “saúde íntima”.
4. Verify the e-mail points to the portal instead of including the complete content body.

**Expected result**: Administrative e-mail is in Português do Brasil, preserves UTF-8 and minimizes content exposure.

## Scenario 10: Accent-Tolerant Search and UTF-8

1. Ensure a content record contains “menstruação”, “saúde” and “prevenção”.
2. Search for “menstruacao”.
3. Search for “saude”.
4. Search for “prevencao”.
5. Open the returned content.

**Expected result**: Searches without accents find matching content, and displayed text preserves “menstruação”, “saúde” and “prevenção”.

## Scenario 11: Future Mobile Boundary

1. Review the OpenAPI contract.
2. Confirm all endpoints introduced by this increment are under `/api/v1/admin`.
3. Confirm there are no active app mobile auth, cycle, symptom, reminder, push, consultation question or consultation summary endpoints.
4. Confirm published content has enough state and metadata for future consumption, without implementing consumption now.

**Expected result**: The increment prepares editorial publication but does not implement mobile consumption.

## Out-of-Scope Validation

Confirm the increment does not expose or require:

- App mobile.
- Cadastro/login de usuárias finais.
- Ciclo menstrual.
- Sintomas.
- Lembretes mobile or push mobile.
- Perguntas or resumo visual para consulta.
- IA assistant.
- UBS/public service integration.
- PDF export.
- Monetization.

## Automated Validation Map

The quickstart scenarios are backed by the following repeatable checks:

| Scenarios | Automated evidence |
|---|---|
| 1–2, 7 | Admin authentication, inactive access, route guard, user management and authorization feature/UI tests |
| 3–4 | Taxonomy, UTF-8 persistence, content draft, association, revision and editor tests |
| 5–6 | Editorial workflow, review queue, publication, archive, audit and history tests |
| 8–9 | Panel notification, recipient resolution, mail rendering/failure and accent tests |
| 10 | Accent-insensitive normalizer, API search and portal search/rendering tests |
| 11 and exclusions | OpenAPI route coverage and no-mobile increment route tests |

Run the complete suites from each application directory:

```powershell
# backend/
php artisan test --configuration phpunit.xml

# frontend/
npm test
npm run lint
npm run build
```

The final execution record for this phase is kept in the completion section
below so the checked scenarios remain tied to a concrete validation run.

## Completion Record — 2026-08-24

All 11 scenarios and the out-of-scope boundary were executed through the
automated equivalents mapped above:

- Backend: **58 tests passed, 328 assertions** with `php artisan test`.
- Admin web: **20 tests passed in 14 files** with `npm test`.
- Static analysis: `npm run lint` completed with no errors (seven Fast Refresh warnings in shared UI components).
- Production bundle: `npm run build` completed successfully (bundle-size advisory only).
- Contract and boundary: active admin route coverage and absence of current-increment mobile routes passed in the backend suite.

This record validates the repeatable API and UI behavior of the quickstart. A
separate exploratory browser walkthrough may still be used for visual acceptance
in a PostgreSQL-backed staging environment, but it is not required to reproduce
the functional checks above.
