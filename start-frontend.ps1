$ErrorActionPreference = 'Stop'
Push-Location (Join-Path $PSScriptRoot 'ConstructionManagemnet/frontend')
try {
    if (-not (Test-Path -LiteralPath 'node_modules/.bin/vite.cmd')) {
        & npm.cmd ci
        if ($LASTEXITCODE -ne 0) { throw 'Could not install frontend dependencies.' }
    }
    & npm.cmd run dev -- --port 5173 --strictPort
    if ($LASTEXITCODE -ne 0) { throw 'Frontend failed to start. Check whether port 5173 is already occupied.' }
} finally {
    Pop-Location
}
