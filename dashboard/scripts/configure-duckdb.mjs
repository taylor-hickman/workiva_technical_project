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

  // Files to copy
  const files = [
    {
      src: 'duckdb-mvp.wasm',
      dest: 'duckdb-mvp.wasm'
    },
    {
      src: 'duckdb-browser-mvp.worker.js',
      dest: 'duckdb-worker.js'
    }
  ];

  for (const file of files) {
    try {
      fs.copyFileSync(
        path.join(nodeModulesPath, file.src),
        path.join(publicPath, file.dest)
      );
      console.log(`Successfully copied ${file.src} to ${file.dest}`);
    } catch (error) {
      console.error(`Error copying ${file.src}:`, error);
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
    path.join(__dirname, '..', 'public', 'vercel.json'),
    JSON.stringify(vercelConfig, null, 2)
  );
  console.log('Created vercel.json file for MIME type configuration');
}

configureDuckDB().catch(console.error);