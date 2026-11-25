import { defineConfig } from "cypress";

export default defineConfig({
  screenshotOnRunFailure: false,
  video: false,
  defaultCommandTimeout: 10000,
  e2e: {
    baseUrl: "http://localhost:8081",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    viewportWidth: 414,
    viewportHeight: 896,
  },
});
