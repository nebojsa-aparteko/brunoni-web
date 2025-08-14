import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import fs from 'fs';

// Get the current brand from the public symlink
const getCurrentBrand = () => {
  try {
    const publicLink = fs.readlinkSync('public');
    return publicLink.slice(7); // Remove 'public.' prefix
  } catch (error) {
    console.error('Error reading public symlink:', error);
    return 'brunoni'; // Default to brunoni if symlink read fails
  }
};

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const rootDir = process.cwd();
  const brand = getCurrentBrand();
  const brandDir = path.join(rootDir, `public.${brand}`);

  return {
    appType: 'spa',
    root: brandDir,
    envDir: rootDir,
    plugins: [
      react({
        jsxRuntime: 'classic',
        babel: {
          presets: [
            ['@babel/preset-react', { runtime: 'classic' }],
          ],
        },
        include: '**/*.{jsx,js,ts,tsx}',
      }),
      svgr()
    ],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, 'src'),
        'src': path.resolve(rootDir, 'src'),
        '/src': path.resolve(rootDir, 'src')
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
      force: true,
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    esbuild: {
      loader: 'tsx',
      include: /\.[jt]sx?$/,
      exclude: [],
    },
    build: {
      outDir: path.resolve(rootDir, 'build'),
      sourcemap: true,
      emptyOutDir: true,
    },
    server: {
      port: 3000,
      open: true,
    },
  };
});