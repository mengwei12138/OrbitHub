import { defineFeature } from '@amiceli/vitest-cucumber';
import { render, screen } from '@testing-library/react';

import Home from '../index';

defineFeature('./features/home.feature', ({ Scenario }) => {
  Scenario('加载首页', ({ Given, When, Then }) => {
    Given('用户访问首页', () => {
      render(<Home />);
    });

    When('页面加载时', () => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    Then('应该显示业务概览', () => {
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Placeholder page')).toBeInTheDocument();
    });
  });
});
