import * as vitest from 'vitest';

export * from 'vitest';
export const jest = vitest.vi;
export default { ...vitest, jest };
