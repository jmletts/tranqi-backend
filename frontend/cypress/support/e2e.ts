// Support file for Cypress E2E
// Custom commands can be defined here.

// Ensure uncaught exceptions from React Native Web do not fail tests unnecessarily
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});
