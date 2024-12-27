import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.resolve(__dirname, '../node_modules/@duckdb/duckdb-wasm/dist');
const targetDir = path.resolve(__dirname, '../public');

// List all files in the source directory to find the worker file
const sourceFiles = fs.readdirSync(sourceDir);
const workerFile = sourceFiles.find(file => file.includes('worker') && file.endsWith('.js'));

if (!workerFile) {
    console.error('Could not find DuckDB worker file in node_modules');
    process.exit(1);
}

const requiredFiles = [
    {
        source: 'duckdb-mvp.wasm',
        target: 'duckdb-mvp.wasm',
        type: 'application/wasm'
    },
    {
        source: workerFile,
        target: 'duckdb-worker.js',
        type: 'text/javascript'
    }
];

// Ensure the public directory exists
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Copy each required file
for (const file of requiredFiles) {
    const sourcePath = path.join(sourceDir, file.source);
    const targetPath = path.join(targetDir, file.target);
    
    try {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Successfully copied ${file.source} to ${file.target}`);
    } catch (error) {
        console.error(`Error copying ${file.source}:`, error.message);
        process.exit(1);
    }
}

// Create a Vite configuration file for correct MIME types
const viteConfig = `{
    "headers": [
        {
            "source": "**/*.wasm",
            "headers": [{
                "key": "Content-Type",
                "value": "application/wasm"
            }]
        },
        {
            "source": "**/*.js",
            "headers": [{
                "key": "Content-Type",
                "value": "text/javascript"
            }]
        }
    ]
}`;

fs.writeFileSync(path.join(targetDir, 'vercel.json'), viteConfig);
console.log('Created vercel.json file for MIME type configuration');