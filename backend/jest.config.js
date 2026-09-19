module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["**/*.spec.ts"],
  // src/ still carries committed compiled output (src/index.js, src/server.js) that
  // would otherwise win module resolution over the TypeScript sources.
  moduleFileExtensions: ["ts", "tsx", "js", "json", "node"],
  setupFiles: ["<rootDir>/tests/setup.ts"],
  collectCoverageFrom: ["src/**/*.ts"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "src/routes/",
    "src/database/migrations/",
    "src/database/seed.ts",
    "src/models/",
    "src/repositories/",
    "src/@types/",
    "src/utils/httpResponse.ts",
  ],
  coverageThreshold: {
    global: { branches: 100, functions: 100, lines: 100, statements: 100 },
  },
  clearMocks: true,
  restoreMocks: true,
};
