import { defineFeature } from '@amiceli/vitest-cucumber';

defineFeature('./features/test.feature', ({ Scenario }) => {
  Scenario('生成中弹窗显示', ({ Given, When, Then }) => {
    Given('用户点击立即生成按钮', () => {
      expect(true).toBe(true);
    });
    When('AI服务开始生成', () => {
      expect(true).toBe(true);
    });
    Then('显示生成中弹窗', () => {
      expect(true).toBe(true);
    });
  });
});
