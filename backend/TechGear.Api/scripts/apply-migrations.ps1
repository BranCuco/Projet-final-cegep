param(
    [Parameter(Mandatory = $true)]
    [string]$MssqlPassword
)

$ErrorActionPreference = 'Stop'

$env:MSSQL_PASSWORD = $MssqlPassword
$env:PATH = "$env:PATH;$env:USERPROFILE\.dotnet\tools"

Write-Host "Applying EF Core migrations to dicjwin01/projet-prog4e06..."
dotnet ef database update

Write-Host "Done."
