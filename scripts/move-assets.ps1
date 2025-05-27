# Create necessary directories
$directories = @(
    "public\assets\images\buttons",
    "public\assets\images\characters",
    "public\assets\images\home",
    "public\assets\images\mint"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir
        Write-Host "Created directory: $dir"
    }
}

# Source directories
$sourceRoot = "..\KUMBA_Website_FA"

# Copy button images
$buttonFiles = Get-ChildItem -Path "$sourceRoot\Buttons" -Filter "*.png"
foreach ($file in $buttonFiles) {
    Copy-Item $file.FullName -Destination "public\assets\images\buttons\" -Force
    Write-Host "Copied button: $($file.Name)"
}

# Copy character images
$characterFiles = Get-ChildItem -Path "$sourceRoot\Animated_Characters" -Filter "*.png"
foreach ($file in $characterFiles) {
    Copy-Item $file.FullName -Destination "public\assets\images\characters\" -Force
    Write-Host "Copied character: $($file.Name)"
}

# Copy home images
$homeFiles = Get-ChildItem -Path "$sourceRoot\Home" -Filter "*.png"
foreach ($file in $homeFiles) {
    Copy-Item $file.FullName -Destination "public\assets\images\home\" -Force
    Write-Host "Copied home: $($file.Name)"
}

# Copy mint images
$mintFiles = Get-ChildItem -Path "$sourceRoot\Mint" -Filter "*.png"
foreach ($file in $mintFiles) {
    Copy-Item $file.FullName -Destination "public\assets\images\mint\" -Force
    Write-Host "Copied mint: $($file.Name)"
}

Write-Host "Asset organization complete!" 