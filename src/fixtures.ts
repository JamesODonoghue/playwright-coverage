import type {
  Fixtures,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
  TestType,
} from '@playwright/test';
import {promises as fs} from 'fs';

import {attachmentName} from './data';

const coverageFixtures: Fixtures<
  {},
  {},
  PlaywrightTestArgs & PlaywrightTestOptions,
  PlaywrightWorkerArgs & PlaywrightWorkerOptions
> = {
  page: async ({page}, use, testInfo) => {
    if (page.coverage == null) {
      return use(page);
    }

    await page.coverage.startJSCoverage({
      resetOnNavigation: false,
    });

    await use(page);

    const result = await page.coverage.stopJSCoverage();

    const resultFile = testInfo.outputPath('v8-coverage.json');
    await fs.writeFile(resultFile, JSON.stringify({result}));

    testInfo.attachments.push({
      name: attachmentName,
      contentType: 'application/json',
      path: resultFile,
    });
  },
};

export function mixinFixtures<
  T extends PlaywrightTestArgs & PlaywrightTestOptions,
  W extends PlaywrightWorkerArgs & PlaywrightWorkerOptions,
>(base: TestType<T, W>): TestType<T, W> {
  return base.extend(coverageFixtures);
}
