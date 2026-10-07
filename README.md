# Construction Management

Spring Boot backend and React frontend for project planning, task scheduling,
quality inspection, inventory, workforce attendance, expenses, and user administration.
The application uses session authentication. Roles and permissions are checked on the server.

## Requirements

- JDK 17 with `JAVA_HOME` pointing to the JDK installation.
- Node.js 22.12 or newer and npm.
- A running MySQL instance. Use a separate database for the demonstration.

## Run the demonstration on Windows

From the repository root, the portable demonstration needs no MySQL configuration:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-backend.ps1 -Demo
```

In another terminal:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-frontend.ps1
```

Open http://localhost:5173 and use the demo accounts below. The `-Demo` option uses
a persistent H2 database in the ignored `ConstructionManagemnet/data` folder.
Omit `-Demo` to use MySQL. Both modes use the same screens, modules and API.
The first Maven/npm run downloads dependencies, so allow it to finish before the viva.

For MySQL, use the following environment settings or create an ignored
`ConstructionManagemnet/src/main/resources/application-local.properties` containing
your local `spring.datasource.url`, `spring.datasource.username`,
`spring.datasource.password` and `app.seed-demo=true`. This local file is optional
and is never included in GitHub commits.

In PowerShell, from the repository root:

```powershell
cd ConstructionManagemnet
$env:DB_URL = 'jdbc:mysql://localhost:3306/buildtrack_demo?createDatabaseIfNotExist=true&serverTimezone=UTC'
$env:DB_USERNAME = 'root'
$env:DB_PASSWORD = 'your-local-database-password'
$env:SEED_DEMO = 'true'
.\mvnw.cmd spring-boot:run
```

In a second terminal:

```powershell
cd ConstructionManagemnet/frontend
npm ci
npm run dev
```

Open http://localhost:5173. The development server forwards `/api` requests to port 8080.
Database credentials stay in the process environment; do not commit them.

New demo accounts use the password `DemoPass123!`:

| Username | Role |
| --- | --- |
| admin_sys | Administrator |
| pm_kamal | Project manager |
| sup_perera | Supervisor |
| client_road_auth | Client |

`pm_sarath` is deliberately inactive. Demo data is created only when `SEED_DEMO=true`
and the relevant database table is empty. This does not reset existing accounts.
With demonstration mode explicitly enabled, known demo accounts without passwords
receive the demo password, without replacing existing passwords or deleting records.
Other older accounts need an administrator to reset their passwords.

For a new database without demo data, leave `SEED_DEMO` unset and set
`BOOTSTRAP_ADMIN_PASSWORD` to your chosen password (8 to 72 characters).
The first startup creates username `admin` only when the users table is empty.
Sign in and use Admin Console to create other accounts. Remove the bootstrap
environment variable after the initial setup.

## Access and business rules

- Administrators manage user accounts and all modules.
- Project managers manage projects, budgets, expenses, tasks, inspections, inventory, and workforce.
- Supervisors manage tasks, inspections, inventory, and workforce. Project and finance writes are denied.
- Clients have read-only access to projects whose client organization matches their account's full name.
  Register a client's full name as the organization name used on the project.
- Stock-out cannot exceed current stock; negative quantities are rejected. Use stock adjustment
  for quantity changes rather than catalog editing. Every successful adjustment writes an audit log.
- One attendance record is allowed per worker and date. Full day is 8 hours, half day is 4 hours.
  Wages preserve the rate at the time of attendance. Monthly totals come from that month's logs.
- Budget spending counts only approved, active expenses. Negative remaining budget shows overspending.
- Expenses must reference an existing project; supplied display names are replaced with the project name.
- Failed inspections schedule a follow-up. Passing the follow-up resolves its original open defect.
- Deactivated or deleted accounts lose access on their next request. Passwords are hashed and never
  returned by the API. Existing sessions require signing in again after a role change.

## Verification

From `ConstructionManagemnet`, run `mvnw.cmd test`. Tests use an isolated H2 database
and cover authentication, CSRF, authorization, client isolation, stock validation,
attendance, expenses, milestones, inspection follow-ups, and demo initialization.

From `ConstructionManagemnet/frontend`, run `npm run lint` and `npm run build`.
GitHub Actions repeats the backend tests and frontend checks on pushes and pull requests.

The automated database tests use H2, so also verify the demonstration against your
local MySQL database before submission. The backend starts separately from Vite;
for hosting, configure the frontend server to forward `/api` to the backend, or set
`VITE_API_BASE_URL` before building and configure the allowed origin in `WebConfig`.

## Project layout

- `ConstructionManagemnet/src/main/java/...`: backend packages, one per module.
- `ConstructionManagemnet/src/main/resources`: backend configuration.
- `ConstructionManagemnet/src/test`: integration and demo initialization tests.
- `ConstructionManagemnet/frontend/src/components`: screens and forms.
- `ConstructionManagemnet/frontend/src/api`: shared API client and module APIs.

The repository retains the original contributors' module commits. Integration and
bug fixes are separate commits; they do not change earlier authorship.
