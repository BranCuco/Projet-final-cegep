param(
    [Parameter(Mandatory = $true)]
    [string]$MssqlPassword,

    [Parameter(Mandatory = $true)]
    [string]$JwtKey
)

$ErrorActionPreference = 'Stop'

$env:MSSQL_PASSWORD = $MssqlPassword
$env:Jwt__Key = $JwtKey

Write-Host "Publishing using Buffet03-IIS profile..."
dotnet publish -c Release /p:PublishProfile=Buffet03-IIS

Write-Host "Done. Output in bin/Release/net8.0/publish/Buffet03/."
