import { defineFeature } from '@amiceli/vitest-cucumber';

defineFeature('./features/500.feature', ({ Scenario }) => {
  Scenario('加载 500 页面', ({ Given, When, Then }) => {
    Given('用户访问服务器错误的页面', () => {});
    When('页面加载时', () => {});
    Then('应该显示 500 错误信息', () => {});
  });
});
