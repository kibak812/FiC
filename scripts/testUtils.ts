type TestCase = {
  name: string;
  run: () => void;
};

export const test = (name: string, run: () => void): TestCase => ({ name, run });

export const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

export const assertEqual = <T>(actual: T, expected: T, message: string): void => {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${String(expected)}, received ${String(actual)}`);
  }
};

export const assertDeepEqual = <T>(actual: T, expected: T, message: string): void => {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${message}. Expected ${expectedJson}, received ${actualJson}`);
  }
};

export const createSeededRng = (seedInput: number | string): (() => number) => {
  const seedString = String(seedInput);
  let state = 2166136261;

  for (let i = 0; i < seedString.length; i++) {
    state ^= seedString.charCodeAt(i);
    state = Math.imul(state, 16777619);
  }

  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const pick = <T>(items: T[], rng: () => number): T => {
  assert(items.length > 0, 'Cannot pick from an empty list');
  return items[Math.floor(rng() * items.length)];
};

export const runSuite = (suiteName: string, tests: TestCase[]): void => {
  const startedAt = Date.now();

  for (const currentTest of tests) {
    currentTest.run();
  }

  const durationMs = Date.now() - startedAt;
  console.log(`${suiteName}: ${tests.length} tests passed in ${durationMs}ms`);
};
