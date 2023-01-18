const commonConfig = require("../../jest.config.common");

const config = {
  setupFilesAfterEnv: ["<rootDir>/../../jest.setup.failOnConsole.js"],
  collectCoverageFrom: [
    "<rootDir>/src/**/*.{ts,tsx,js}",
    "!**/node_modules/**",
    "!**/__mocks__/**",
    "!**/__tests__/**",
  ],
};

module.exports = Object.assign(config, commonConfig);
