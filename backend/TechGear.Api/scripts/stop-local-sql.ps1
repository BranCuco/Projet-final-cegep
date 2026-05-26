param(
    [Parameter(Mandatory = $false)]
    [string]$ContainerName = "techgear-sql-local"
)

$ErrorActionPreference = 'Stop'

$existing = docker ps -a --filter "name=$ContainerName" --format "{{.Names}}"
if ($existing -contains $ContainerName) {
    docker rm -f $ContainerName | Out-Null
    Write-Host "Container $ContainerName removed."
}
else {
    Write-Host "Container $ContainerName not found."
}
