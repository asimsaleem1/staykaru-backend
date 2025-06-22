# Backend Cleanup Script
Write-Host "Starting cleanup of unnecessary files..." -ForegroundColor Green

# Files to keep
$keep = @('.dockerignore', '.editorconfig', '.env', '.env.example', '.gitignore', '.prettierrc', 'Dockerfile', 'eslint.config.mjs', 'jest.config.js', 'jsconfig.json', 'nest-cli.json', 'package-lock.json', 'package.json', 'Procfile', 'README.md', 'tsconfig.build.json', 'tsconfig.json', 'tsconfig.test.json')

# Folders to keep
$keepFolders = @('.git', '.github', 'dist', 'node_modules', 'src', 'test')

$toDelete = @()

Get-ChildItem -Force | ForEach-Object {
    if ($_.PSIsContainer) {
        if ($keepFolders -notcontains $_.Name) {
            $toDelete += $_.FullName
        }
    } else {
        if ($keep -notcontains $_.Name) {
            $toDelete += $_.FullName
        }
    }
}

Write-Host "Found $($toDelete.Count) items to delete"
foreach ($item in $toDelete) {
    Write-Host "Will delete: $item" -ForegroundColor Yellow
}

$confirm = Read-Host "Proceed with deletion? (y/N)"
if ($confirm -eq 'y') {
    foreach ($item in $toDelete) {
        try {
            if (Test-Path $item -PathType Container) {
                Remove-Item $item -Recurse -Force
                Write-Host "Deleted folder: $item" -ForegroundColor Green
            } else {
                Remove-Item $item -Force  
                Write-Host "Deleted file: $item" -ForegroundColor Green
            }
        } catch {
            Write-Host "Failed to delete: $item" -ForegroundColor Red
        }
    }
    Write-Host "Cleanup completed!" -ForegroundColor Green
} else {
    Write-Host "Cancelled" -ForegroundColor Yellow
}
