// @ts-check
/** @type {import("jest").Config} */
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });
const config = {

const config = {
  testEnvironment: "jsdom",
  setupFilesAfterSetup: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/", "<rootDir>/backend/"],
};

module.exports = createJestConfig(config);
