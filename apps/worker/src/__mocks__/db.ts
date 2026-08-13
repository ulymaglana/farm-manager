import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";
import { beforeEach } from "vitest";

export const prisma: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();

// Auto-reset mock state before each test.
// This beforeEach runs in the test context (not at mock evaluation time)
// because Vitest processes __mocks__ files in the test runner environment.
// See: https://vitest.dev/guide/mocking.html#automocking-algorithm
beforeEach(() => {
  mockReset(prisma);
});
