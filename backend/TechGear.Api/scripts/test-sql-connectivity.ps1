param(
    [Parameter(Mandatory = $false)]
    [string]$Server = "dicjwin01",

    [Parameter(Mandatory = $false)]
    [string]$Database = "projet-prog4e06",

    [Parameter(Mandatory = $false)]
    [string]$User = "prog4e06",

    [Parameter(Mandatory = $false)]
    [string]$Password = "",

    [Parameter(Mandatory = $false)]
    [int]$Port = 1433
)

$ErrorActionPreference = 'Continue'

Write-Host "=== DNS ===" -ForegroundColor Cyan
Resolve-DnsName $Server | Select-Object Name,IPAddress,Type
if ($LASTEXITCODE -ne 0) {
    Write-Warning "DNS resolution failed for $Server"
}

Write-Host "`n=== TCP ===" -ForegroundColor Cyan
Test-NetConnection $Server -Port $Port | Select-Object ComputerName,RemoteAddress,TcpTestSucceeded

if (-not $Password) {
    Write-Warning "No password supplied; skipping SQL login test."
    Write-Host "Use: .\\scripts\\test-sql-connectivity.ps1 -Password \"yourPassword\""
    exit 0
}

Write-Host "`n=== SQL Login ===" -ForegroundColor Cyan
try {
    Add-Type -AssemblyName System.Data
    $cs = "Server=$Server;Database=$Database;User Id=$User;Password=$Password;Encrypt=True;TrustServerCertificate=True;Connection Timeout=5"
    $conn = New-Object System.Data.SqlClient.SqlConnection($cs)
    $conn.Open()
    Write-Host "SQL connection successful." -ForegroundColor Green
    $conn.Close()
}
catch {
    Write-Error $_.Exception.Message
    exit 1
}
