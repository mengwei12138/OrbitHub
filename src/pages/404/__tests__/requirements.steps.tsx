import { defineFeature } from '@amiceli/vitest-cucumber';

defineFeature('./features/404.feature', ({ Scenario }) => {
  Scenario('加载 404 页面', ({ Given, When, Then }) => {
    Given('用户访问不存在的页面', () => {});
    When('页面加载时', () => {});
    Then('应该显示 404 错误信息', () => {});
  });
});
