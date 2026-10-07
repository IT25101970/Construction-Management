param([switch]$Demo)
$ErrorActionPreference = 'Stop'

if (-not $env:JAVA_HOME -or -not (Test-Path -LiteralPath (Join-Path $env:JAVA_HOME 'bin/java.exe'))) {
    $javaCommand = Get-Command java.exe -ErrorAction Stop
    $env:JAVA_HOME = Split-Path (Split-Path $javaCommand.Source -Parent) -Parent
}
if (-not (Test-Path -LiteralPath (Join-Path $env:JAVA_HOME 'bin/javac.exe'))) {
    throw 'Install JDK 17 or newer and set JAVA_HOME to its installation directory.'
}

Push-Location (Join-Path $PSScriptRoot 'ConstructionManagemnet')
try {
    if ($Demo) {
        & .\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=demo'
    } else {
        & .\mvnw.cmd spring-boot:run
    }
    if ($LASTEXITCODE -ne 0) { throw 'Backend failed to start. See the error above.' }
} finally {
    Pop-Location
}
