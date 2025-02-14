import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // Plugin de React para Vite

export default defineConfig({
  plugins: [react()], // Agrega React como plugin en Vite
  resolve: {
    alias: {
      // Aquí no es necesario mantener el alias de Chakra UI
      // Elimina cualquier alias relacionado con Chakra UI
    },
  },
  test: {
    globals: true,
    watch: false,
    environment: "jsdom",
    include: ["**/*test.{js,jsx}"],
    setupFiles: ["vitest.setup.js"], // Asegúrate de que esté configurado para JS
    coverage: {
      include: ["packages"],
    },
  },
});
