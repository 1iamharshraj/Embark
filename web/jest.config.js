/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "lib/**/*.ts",
    "!lib/prisma.ts",
    "!lib/authOptions.ts",
    "!lib/queue.ts",
    "!lib/email.ts",
    "!lib/s3.ts",
  ],
};
