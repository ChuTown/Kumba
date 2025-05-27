const fs = require('fs');
const path = require('path');

// Get the current working directory
const currentDir = process.cwd();
const sourceDir = path.join(currentDir, '..', 'KUMBA_Website_FA (2)', 'KUMBA_Website_FA');
const targetDir = path.join(currentDir, 'public', 'assets', 'images');

console.log('Source directory:', sourceDir);
console.log('Target directory:', targetDir);

// Create directories if they don't exist
const directories = ['buttons', 'characters', 'home', 'mint'];
directories.forEach(dir => {
    const fullPath = path.join(targetDir, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`Created directory: ${fullPath}`);
    }
});

// Copy files from source to target directories
function copyFiles(source, target) {
    if (!fs.existsSync(source)) {
        console.log(`Source directory ${source} does not exist`);
        return;
    }

    const items = fs.readdirSync(source);

    items.forEach(item => {
        const sourcePath = path.join(source, item);
        const stat = fs.statSync(sourcePath);

        if (stat.isFile() && item.match(/\.(png|jpg|jpeg|gif|svg)$/i)) {
            const targetPath = path.join(target, item);
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`Copied ${sourcePath} to ${targetPath}`);
        }
    });
}

// Copy button images
copyFiles(path.join(sourceDir, 'Buttons'), path.join(targetDir, 'buttons'));

// Copy character images
copyFiles(path.join(sourceDir, 'Animated_Characters'), path.join(targetDir, 'characters'));

// Copy home images
copyFiles(path.join(sourceDir, 'Home'), path.join(targetDir, 'home'));

// Copy mint images
copyFiles(path.join(sourceDir, 'Mint'), path.join(targetDir, 'mint'));

console.log('Asset organization complete!'); 