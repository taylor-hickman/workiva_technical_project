import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function configureDuckDB() {
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules', '@duckdb', 'duckdb-wasm', 'dist');
  const publicPath = path.join(__dirname, '..', 'public');

  // Create public directory if it doesn't exist
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
  }

  // Create data directory
  const dataPath = path.join(publicPath, 'data');
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
  }

  // Files to copy
  const files = [
    {
      src: 'duckdb-eh.wasm',
      dest: 'duckdb-eh.wasm'
    },
    {
      src: 'duckdb-browser.worker.js',
      dest: 'duckdb-worker.js'
    }
  ];

  for (const file of files) {
    const sourcePath = path.join(nodeModulesPath, file.src);
    const destPath = path.join(publicPath, file.dest);
    
    try {
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Successfully copied ${file.src} to ${file.dest}`);
      } else {
        console.warn(`Source file not found: ${sourcePath}`);
        // Try alternative files
        const alternatives = {
          'duckdb-eh.wasm': ['duckdb-mvp.wasm', 'duckdb.wasm'],
          'duckdb-browser.worker.js': ['duckdb-browser-mvp.worker.js', 'duckdb-worker.js']
        };
        
        const altFiles = alternatives[file.src] || [];
        let copied = false;
        for (const altFile of altFiles) {
          const altPath = path.join(nodeModulesPath, altFile);
          if (fs.existsSync(altPath)) {
            fs.copyFileSync(altPath, destPath);
            console.log(`Successfully copied alternative ${altFile} to ${file.dest}`);
            copied = true;
            break;
          }
        }
        if (!copied) {
          throw new Error(`No valid source file found for ${file.src}`);
        }
      }
    } catch (error) {
      console.error(`Error processing ${file.src}:`, error);
      process.exit(1);
    }
  }

  // Create vercel.json for proper MIME type configuration
  const vercelConfig = {
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "Cross-Origin-Opener-Policy",
            "value": "same-origin"
          },
          {
            "key": "Cross-Origin-Embedder-Policy",
            "value": "require-corp"
          }
        ]
      },
      {
        "source": "/(.*).wasm",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/wasm"
          }
        ]
      }
    ]
  };

  fs.writeFileSync(
    path.join(publicPath, 'vercel.json'),
    JSON.stringify(vercelConfig, null, 2)
  );
  console.log('Created vercel.json file for MIME type configuration');
}

configureDuckDB().catch(console.error);