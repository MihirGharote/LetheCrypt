import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        signup: resolve(__dirname, 'signup.html'),
        passwords: resolve(__dirname, 'passwords.html'),
        edit: resolve(__dirname, 'edit.html'),
        notFound: resolve(__dirname, 'notFound.html'),
      },
    },
  },
});
