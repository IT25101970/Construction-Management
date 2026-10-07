# Quality inspection

This contribution contains the inspection backend, inspection screen, audit form,
summary report, and shared files needed to build and run them. Existing project,
task, and workforce modules are retained. The frontend entry opens inspections.

From `ConstructionManagemnet`, configure `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`
for your local MySQL database, then run `./mvnw spring-boot:run` (Windows:
`mvnw.cmd spring-boot:run`).

From `ConstructionManagemnet/frontend`, run `npm ci` and `npm run dev`.
Create a project through the existing `/api/projects` API before scheduling an
inspection. The UI runs at http://localhost:5173 and calls the backend on port 8080.

Inspection endpoints are under `/api/inspections`; summary reports are available
at `/api/inspections/reports/summary`. Failed inspections automatically schedule
follow-up inspections.
