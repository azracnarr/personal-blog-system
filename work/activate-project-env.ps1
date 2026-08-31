$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"

$projectPaths = @(
    "$env:JAVA_HOME\bin",
    "C:\Program Files\PostgreSQL\14\bin",
    "C:\apache-maven-3.9.9\bin",
    "C:\Program Files\nodejs"
)

$existingPath = $env:Path -split ";" | Where-Object { $_ -and ($_ -notin $projectPaths) }
$env:Path = (($projectPaths + $existingPath) | Select-Object -Unique) -join ";"

Write-Host "Project environment activated."
Write-Host "JAVA_HOME=$env:JAVA_HOME"
Write-Host "Use npm.cmd instead of npm if PowerShell blocks npm.ps1."
