import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';

class CustomReporter implements Reporter {
  onBegin(config: FullConfig, suite: Suite): void {
    console.log(`Starting run with ${suite.allTests().length} tests`);
  }

  onTestBegin(test: TestCase): void {
    console.log(`Running: ${test.title}`);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    console.log(`Finished: ${test.title} - ${result.status} (${result.duration}ms)`);
  }

  onEnd(result: FullResult): void {
    console.log(`Run finished: ${result.status}`);
  }
}

export default CustomReporter;
