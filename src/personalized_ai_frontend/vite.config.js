const path = require('path');
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'src/personalized_ai_frontend/src/personalized_ai_frontend'), // Ensure the output directory is correct
    lib: {
      entry: path.resolve(__dirname, 'src/index.jsx'),
      name: 'MyLib',
      fileName: (format) => `my-lib.${format}.js`
    },
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled into your library
      external: [
        '@dfinity/identity',
        '@dfinity/agent',
        '@dfinity/auth-client',
        '@noble/curves/ed25519'
      ],
      output: {
        // Provide global variables to use in the UMD build for externalized deps
        globals: {
          '@dfinity/identity': 'DFINITYIdentity',
          '@dfinity/agent': 'DFINITYAgent',
          '@dfinity/auth-client': 'DFINITYAuthClient',
          '@noble/curves/ed25519': 'NobleEd25519'
        }
      }
    }
  }
});
