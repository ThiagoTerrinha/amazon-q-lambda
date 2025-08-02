module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: ["index.js", "!node_modules/**", "!.aws-sam/**"],
  testMatch: ["**/*.test.js"],
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
