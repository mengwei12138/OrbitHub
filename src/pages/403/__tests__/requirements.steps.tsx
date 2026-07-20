import { defineFeature } from '@amiceli/vitest-cucumber';

defineFeature('./features/403.feature', ({ Scenario }) => {
  Scenario('加载 403 页面', ({ Given, When, Then }) => {
    Given('用户访问无权限的页面', () => {});
    When('页面加载时', () => {});
    Then('应该显示 403 错误信息', () => {});
  });
});
