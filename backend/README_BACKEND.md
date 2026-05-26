# TechGear Backend (ASP.NET Core Web API)

This backend satisfies the Web transactionnel requirements:
- ASP.NET Core Web API
- Entity Framework Core + LINQ
- Swagger
- Identity + JWT
- AutoMapper
- Serilog
- Role-based authorization (`Admin`, `User`)

## 1. Prerequisites

Install .NET 8 SDK (required):
- `winget install --id Microsoft.DotNet.SDK.8 --source winget`

Verify:
- `dotnet --version`

## 2. Project location

- Solution: `backend/TechGear.Backend.sln`
- API project: `backend/TechGear.Api`
- Postman collection: `backend/postman/TechGear-API.postman_collection.json`

## 3. Configure MSSQL connection

Update `backend/TechGear.Api/appsettings.json`:
- `ConnectionStrings:DefaultConnection` already points to `dicjwin01`, DB `projet-prog4e06`, user `prog4e06`
- set password using one of these options:
	- environment variable `MSSQL_PASSWORD`
	- `Mssql:Password` in appsettings (not recommended for git)
- `Jwt:Key` with at least 32 chars

Example (PowerShell session):
- `$env:MSSQL_PASSWORD = "YOUR_PASSWORD_FROM_prog4e06.PublishSettings"`

If you get a LocalDB error (`(localdb)\\MSSQLLocalDB` not found), it means `MSSQL_PASSWORD` was not set for the current terminal session before running the API.

If you get `server not found`, `host unknown`, or error `53` for `dicjwin01`, this is a network/DNS issue (not code):
- connect to the school network or required VPN first
- then test with:
	- `pwsh ./scripts/test-sql-connectivity.ps1 -Password "YOUR_PASSWORD"`

## 4. Run migrations and start

From `backend/TechGear.Api`:

1. `dotnet restore`
2. `dotnet tool install --global dotnet-ef` (if needed)
3. If `dotnet-ef` is not found in PowerShell, run once per session:
	- `$env:PATH = "$env:PATH;$env:USERPROFILE\.dotnet\tools"`
4. `dotnet ef database update`
5. `dotnet run`

Recommended run sequence in PowerShell:
- `$env:MSSQL_PASSWORD = "YOUR_PASSWORD_FROM_prog4e06.PublishSettings"`
- `dotnet ef database update`
- `dotnet run`

## 4.1 Offline testing (outside Cegep network)

You can fully test the API using local SQL Server in Docker, then switch back to `dicjwin01` later.

From `backend/TechGear.Api`:

1. Start local SQL Server container:
	- `pwsh ./scripts/start-local-sql.ps1 -SaPassword "YourStrong!Passw0rd"`
2. Run API against local DB (`appsettings.Local.json`):
	- `pwsh ./scripts/run-local-api.ps1 -SqlPassword "YourStrong!Passw0rd"`
3. Stop/remove local SQL container when done:
	- `pwsh ./scripts/stop-local-sql.ps1`

Local mode uses:
- server: `localhost,14333`
- database: `TechGearShopDb.Local`
- environment: `ASPNETCORE_ENVIRONMENT=Local`

## 4.2 Quick offline testing (no SQL Server at all)

If Docker is unavailable, run the API with EF InMemory just for local validation:

From `backend/TechGear.Api`:

1. `powershell -ExecutionPolicy Bypass -File .\scripts\run-test-api.ps1`

Notes:
- Uses `ASPNETCORE_ENVIRONMENT=Test` and `appsettings.Test.json`
- No MSSQL connectivity is required
- Starts with `dotnet run --no-launch-profile` to avoid `launchSettings.json` forcing Development
- This mode is for smoke testing endpoints only; final validation must still use MSSQL (`dicjwin01`)

Or use helper script:
- `pwsh ./scripts/apply-migrations.ps1 -MssqlPassword "YOUR_PASSWORD"`

Swagger:
- `https://localhost:xxxx/swagger`

## 5. Authentication and roles

Admin seeded at startup:
- username: `admin`
- password: `Admin123!`

Public endpoints:
- `GET /api/products`
- `GET /api/products/{id}`

User endpoints (JWT required):
- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart/{id}`
- `DELETE /api/cart/{id}`
- `DELETE /api/cart`
- `POST /api/orders`
- `GET /api/orders/mine`

Admin endpoints (Admin JWT required):
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`
- `GET /api/orders`

## 6. IIS publish (dicjwin01)

From `backend/TechGear.Api`:

1. Use the profile template `Properties/PublishProfiles/Buffet03-IIS.pubxml`
2. Adjust `PublishUrl` to your Buffet 03 target path if needed
3. `dotnet publish -c Release /p:PublishProfile=Buffet03-IIS`
3. Deploy to IIS site on dicjwin01
4. Ensure app pool has DB access and appsettings production values

Or use helper script:
- `pwsh ./scripts/publish-buffet03.ps1 -MssqlPassword "YOUR_PASSWORD" -JwtKey "YOUR_32_CHAR_MIN_KEY"`

## 8. Current status in this repo

- Initial migration has already been generated in `backend/TechGear.Api/Migrations`.
- Compilation is successful.
- Database update currently depends on reachable SQL Server (`dicjwin01`) or a local SQL runtime.

## 7. Logging

Serilog writes logs to:
- console
- `backend/TechGear.Api/logs/techgear-*.log`
