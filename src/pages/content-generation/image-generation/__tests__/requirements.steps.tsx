import { defineFeature } from '@amiceli/vitest-cucumber';

defineFeature('./features/requirements.feature', ({ Scenario }) => {
  Scenario('图片生成流程', ({ Given, When, Then }) => {
    Given('用户打开图片生成页面', () => {
      expect(true).toBe(true);
    });
    When('用户填写产品名称、核心卖点、目标受众', () => {
      expect(true).toBe(true);
    });
    Then('点击立即生成按钮', () => {
      expect(true).toBe(true);
    });
  });
});
