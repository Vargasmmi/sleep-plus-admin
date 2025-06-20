import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api/shopify": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/employees": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/customers": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/subscriptions": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/evaluations": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/stores": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/calls": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/sales": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/campaigns": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/achievements": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/scripts": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/commissions": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/shopifySettings": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/shopifyProducts": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/shopifyCustomers": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/shopifyCoupons": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/activityLogs": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/webhooks": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/webhookEvents": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  define: {
    // Define global variables for compatibility
    'process.env': {},
    'global': {},
  },
  optimizeDeps: {
    // Exclude problematic Node.js libraries
    exclude: ['shopify-api-node']
  },
});
