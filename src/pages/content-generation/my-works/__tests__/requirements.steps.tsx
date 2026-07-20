import { defineFeature } from '@amiceli/vitest-cucumber';

defineFeature('./features/requirements.feature', ({ Scenario }) => {
  Scenario('占位场景', ({ Given, When, Then }) => {
    Given('准备测试环境', () => {});
    When('执行操作', () => {});
    Then('验证结果', () => {});
  });
});
