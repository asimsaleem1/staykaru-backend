# Backend Cleanup Script - Remove unnecessary files and folders
# This script removes test scripts, documentation, and other non-essential files

Write-Host "Starting cleanup of unnecessary files..." -ForegroundColor Green

# Define files and folders to keep (essential for backend functionality)
$essentialFiles = @(
    '.dockerignore',
    '.editorconfig', 
    '.env',
    '.env.example',
    '.gitignore',
    '.prettierrc',
    'Dockerfile',
    'eslint.config.mjs',
    'jest.config.js',
    'jsconfig.json',
    'nest-cli.json',
    'package-lock.json',
    'package.json',
    'Procfile',
    'README.md',
    'tsconfig.build.json',
    'tsconfig.json',
    'tsconfig.test.json'
)

$essentialFolders = @(
    '.git',
    '.github',
    'dist',
    'node_modules',
    'src',
    'test'
)

# Get all items in the current directory
$allItems = Get-ChildItem -Path "." -Force

# Count files to be deleted
$filesToDelete = @()
$foldersToDelete = @()

foreach ($item in $allItems) {
    if ($item.PSIsContainer) {
        # It's a folder
        if ($essentialFolders -notcontains $item.Name) {
            $foldersToDelete += $item
        }
    } else {
        # It's a file
        if ($essentialFiles -notcontains $item.Name) {
            $filesToDelete += $item
        }
    }
}

Write-Host "`nFiles to be deleted ($($filesToDelete.Count)):" -ForegroundColor Yellow
foreach ($file in $filesToDelete) {
    Write-Host "  - $($file.Name)" -ForegroundColor Red
}

Write-Host "`nFolders to be deleted ($($foldersToDelete.Count)):" -ForegroundColor Yellow  
foreach ($folder in $foldersToDelete) {
    Write-Host "  - $($folder.Name)/" -ForegroundColor Red
}

Write-Host "`nThis will delete $($filesToDelete.Count) files and $($foldersToDelete.Count) folders." -ForegroundColor Cyan
$confirmation = Read-Host "`nDo you want to proceed? (y/N)"

if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
    Write-Host "`nDeleting files..." -ForegroundColor Green
    
    # Delete files
    foreach ($file in $filesToDelete) {
        try {
            Remove-Item $file.FullName -Force
            Write-Host "  ✓ Deleted: $($file.Name)" -ForegroundColor Green
        }
        catch {
            Write-Host "  ✗ Failed to delete: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    # Delete folders
    foreach ($folder in $foldersToDelete) {
        try {
            Remove-Item $folder.FullName -Recurse -Force
            Write-Host "  ✓ Deleted folder: $($folder.Name)" -ForegroundColor Green
        }
        catch {
            Write-Host "  ✗ Failed to delete folder: $($folder.Name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "`n✅ Cleanup completed successfully!" -ForegroundColor Green    Write-Host "`nRemaining essential files:" -ForegroundColor Cyan
    Get-ChildItem -Path "." -Force | ForEach-Object {
        if ($_.PSIsContainer) {
            Write-Host "  📁 $($_.Name)/" -ForegroundColor Blue
        } else {
            Write-Host "  📄 $($_.Name)" -ForegroundColor White
        }
    }
} else {
    Write-Host "`nCleanup cancelled." -ForegroundColor Yellow
}

Write-Host "`nScript completed." -ForegroundColor Cyan
