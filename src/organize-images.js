import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Source and target directories
const sourceDir = 'C:/Users/mchu3/Downloads/KUMBA_Website_FA (2)/KUMBA_Website_FA';
const targetDir = join(__dirname, 'assets', 'images');

// Create directories if they don't exist
const directories = ['buttons', 'characters', 'home', 'mint'];

async function createDirectories() {
    for (const dir of directories) {
        const fullPath = join(targetDir, dir);
        try {
            await fs.mkdir(fullPath, { recursive: true });
            console.log(`Created directory: ${fullPath}`);
        } catch (error) {
            console.error(`Error creating directory ${fullPath}:`, error);
        }
    }
}

// Copy files from source to target directories
async function copyFiles(source, target) {
    try {
        const items = await fs.readdir(source);

        for (const item of items) {
            const sourcePath = join(source, item);
            const stat = await fs.stat(sourcePath);

            if (stat.isFile() && item.match(/\.(png|jpg|jpeg|gif|svg)$/i)) {
                const targetPath = join(target, item.toLowerCase());
                await fs.copyFile(sourcePath, targetPath);
                console.log(`Copied ${sourcePath} to ${targetPath}`);
            }
        }
    } catch (error) {
        console.error(`Error copying files from ${source}:`, error);
    }
}

// Main function to organize images
async function organizeImages() {
    try {
        await createDirectories();

        const sourceDirs = {
            'Buttons': 'buttons',
            'Animated_Characters': 'characters',
            'Home': 'home',
            'Mint': 'mint'
        };

        for (const [sourceSubDir, targetSubDir] of Object.entries(sourceDirs)) {
            const sourcePath = join(sourceDir, sourceSubDir);
            const targetPath = join(targetDir, targetSubDir);
            await copyFiles(sourcePath, targetPath);
        }

        console.log('Image organization complete!');
    } catch (error) {
        console.error('Error organizing images:', error);
    }
}

// Run the script
organizeImages(); 