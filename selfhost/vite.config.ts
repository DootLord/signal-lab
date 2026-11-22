import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
const here=fileURLToPath(new URL('.',import.meta.url));
export default defineConfig({root:here,publicDir:fileURLToPath(new URL('../public',import.meta.url)),plugins:[react()],build:{outDir:fileURLToPath(new URL('../dist-selfhost/site',import.meta.url)),emptyOutDir:true}});
