param(
    [Parameter(Mandatory = $true)]
    [string]$SqlPassword
)

$ErrorActionPreference = 'Stop'

$env:ASPNETCORE_ENVIRONMENT = "Local"
$env:MSSQL_PASSWORD = $SqlPassword
$env:PATH = "$env:PATH;$env:USERPROFILE\.dotnet\tools"

Write-Host "Applying migrations on local SQL container..."
dotnet ef database update

Write-Host "Starting API in Local environment..."
dotnet run
