import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Use the automatic JSX runtime
      jsxRuntime: 'automatic',
      // Include all JS/TS/JSX/TSX files
      include: '**/*.{js,jsx,ts,tsx}',
      // Enable fast refresh
      fastRefresh: true,
      // Babel configuration
      babel: {
        presets: [
          ['@babel/preset-react', {
            runtime: 'automatic',
            importSource: 'react'
          }]
        ],
        plugins: [
          ['@babel/plugin-transform-react-jsx', {
            runtime: 'automatic'
          }]
        ]
      }
    })
  ],
  server: {
    port: 3000,
    open: true,
    host: true,
    hmr: true
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: []
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'chart.js'],
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  define: {
    'process.env': {}
  }
});
