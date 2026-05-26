$ErrorActionPreference = 'Stop'

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDirectory = Resolve-Path (Join-Path $scriptDirectory "..")
Set-Location $projectDirectory

$env:ASPNETCORE_ENVIRONMENT = "Test"
$env:DOTNET_ENVIRONMENT = "Test"
$env:UseInMemoryDatabase = "true"
$env:ASPNETCORE_URLS = "http://localhost:5227"

Write-Host "Starting API in Test mode (EF InMemory)..."
Write-Host "No SQL Server required for this mode."
Write-Host "ASPNETCORE_ENVIRONMENT=$env:ASPNETCORE_ENVIRONMENT"
Write-Host "DOTNET_ENVIRONMENT=$env:DOTNET_ENVIRONMENT"
Write-Host "ASPNETCORE_URLS=$env:ASPNETCORE_URLS"

dotnet run --no-launch-profile
