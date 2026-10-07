# Functional QA report

Tested on 7 October 2026 with JDK 17, Node.js 24, Chrome, the running MySQL application, and isolated H2 databases for write tests.

Result: all 27 backend tests pass (0 failures, 0 errors). Frontend lint and production build pass. The browser checks below completed without JavaScript exceptions or unexpected dialogs.

| Area | Verified behavior | Result |
| --- | --- | --- |
| Authentication | Correct/wrong credentials, inactive account, session restoration, logout, password hashing and omission from responses | Pass |
| Permissions | Four-role API read matrix, admin-only users, forbidden client writes, supervisor finance writes, CSRF, disabled-account session revocation | Pass |
| Client portal | Only the matching client's projects returned; another client's project returns 404 | Pass |
| Projects | Invalid date range rejected, milestone completion and removal update progress, deleted projects unavailable and cannot receive new tasks | Pass |
| Tasks | API create, search, complete, delete, date validation, overdue report; browser create/edit/100% completion | Pass |
| Inspections | API create/edit/filter/delete; failed audit schedules follow-up; passing follow-up clears open defects | Pass |
| Inventory | API stock movement and logs, edit/delete, negative/excess stock rejection, catalog stock bypass rejected | Pass |
| Workforce | API create/edit/delete, attendance, duplicate and future date rejection, half-day pay, historical wage preservation, current-month totals | Pass |
| Finance | API create/edit/delete recalculates budget, approved-only totals, overspend warning, negative values and missing project rejected | Pass |
| Administration | API user create/edit/disable/delete, password not exposed, last active admin protected | Pass |
| Demo setup | Demo initialization and existing password preservation | Pass |
| Browser navigation | Admin: seven system modules; PM: seven modules; Supervisor: five allowed modules; Client: client portal; role-specific navigation and session restoration/logout | Pass |
| Reports | Task, inventory, payroll and budget print actions called; Chrome generated four nonempty PDFs using print styling | Pass |

## Bugs corrected during this run

- Tasks accepted a due date before their start date through the API. Create and update now reject this with HTTP 400.
- Weekly reports missed tasks that became overdue until the task list was opened. Reports now refresh overdue status themselves.
- Four report export buttons displayed a success alert without exporting. They now open the browser print dialog, where Save as PDF is available. Print styles show the report and hide page navigation/buttons.
- Inventory, workforce and user reads returned fabricated sample records when the API failed. These requests now propagate errors to the existing error handlers.

Write tests used isolated H2 databases; browser form writes used a separate in-memory backend on port 8081. They did not create or delete records in the user's MySQL project database. Reading tasks may refresh their overdue status as normal application behavior.

## Re-run automated checks

From `ConstructionManagemnet`:

```powershell
.\mvnw.cmd -B test
```

From `ConstructionManagemnet/frontend`:

```powershell
npm run lint
npm run build
```

## Limits

This is functional regression testing of the listed workflows, not proof that every possible input or environment works. Browser form create/edit was exercised for tasks; the remaining modules' write flows were tested through their API/service tests. Load, concurrent-user stress, all browser/device combinations, and an independent manual assessment were not performed. PDF generation was checked in Chrome; the actual Save as PDF destination remains a browser/user choice.
