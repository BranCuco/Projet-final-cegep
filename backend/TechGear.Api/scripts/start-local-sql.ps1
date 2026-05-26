param(
    [Parameter(Mandatory = $true)]
    [string]$SaPassword,

    [Parameter(Mandatory = $false)]
    [string]$ContainerName = "techgear-sql-local",

    [Parameter(Mandatory = $false)]
    [int]$HostPort = 14333
)

$ErrorActionPreference = 'Stop'

Write-Host "Starting local SQL Server container..."

$existing = docker ps -a --filter "name=$ContainerName" --format "{{.Names}}"
if ($existing -contains $ContainerName) {
    docker rm -f $ContainerName | Out-Null
}

docker pull mcr.microsoft.com/mssql/server:2022-latest | Out-Null

docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=$SaPassword" -p "${HostPort}:1433" --name $ContainerName -d mcr.microsoft.com/mssql/server:2022-latest | Out-Null

Write-Host "Waiting for SQL Server to accept connections on localhost:$HostPort..."
$maxTries = 30
for ($i = 1; $i -le $maxTries; $i++) {
    $test = Test-NetConnection localhost -Port $HostPort -WarningAction SilentlyContinue
    if ($test.TcpTestSucceeded) {
        Write-Host "SQL Server container is reachable." -ForegroundColor Green
        exit 0
    }
    Start-Sleep -Seconds 2
}

Write-Error "SQL Server container did not become reachable in time. Check: docker logs $ContainerName"
