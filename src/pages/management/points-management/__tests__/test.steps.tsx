import { defineFeature } from '@amiceli/vitest-cucumber';

defineFeature('./features/test.feature', ({ Scenario }) => {
  Scenario('导出报表按钮点击', ({ Given, When, Then }) => {
    Given('用户在全局积分管理页面', () => {
      // 实现
    });
    When('用户点击导出报表按钮', () => {
      // 实现
    });
    Then('应触发报表导出功能', () => {
      // 实现
    });
  });
});
