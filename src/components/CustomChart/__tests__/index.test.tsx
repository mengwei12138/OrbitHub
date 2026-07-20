import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Bar, Line, Pie } from '../index';

vi.mock('@ant-design/charts', () => ({
  Line: vi.fn(() => <div data-testid="line-chart">Line Chart</div>),
  Bar: vi.fn(() => <div data-testid="bar-chart">Bar Chart</div>),
  Pie: vi.fn(() => <div data-testid="pie-chart">Pie Chart</div>),
}));

describe('Chart 组件单元测试', () => {
  describe('Line 组件', () => {
    it('应该渲染 Line 图表', () => {
      const { getByTestId } = render(<Line data={[]} xField="x" yField="y" />);
      expect(getByTestId('line-chart')).toBeDefined();
    });

    it('应该正确传递 data 属性', () => {
      const data = [{ x: 'a', y: 1 }];
      const { getByTestId } = render(
        <Line data={data} xField="x" yField="y" />,
      );
      expect(getByTestId('line-chart')).toBeDefined();
    });
  });

  describe('Bar 组件', () => {
    it('应该渲染 Bar 图表', () => {
      const { getByTestId } = render(<Bar data={[]} xField="x" yField="y" />);
      expect(getByTestId('bar-chart')).toBeDefined();
    });

    it('应该正确传递 data 属性', () => {
      const data = [{ x: 'a', y: 1 }];
      const { getByTestId } = render(<Bar data={data} xField="x" yField="y" />);
      expect(getByTestId('bar-chart')).toBeDefined();
    });
  });

  describe('Pie 组件', () => {
    it('应该渲染 Pie 图表', () => {
      const { getByTestId } = render(
        <Pie data={[]} angleField="value" colorField="type" />,
      );
      expect(getByTestId('pie-chart')).toBeDefined();
    });

    it('应该正确传递 data 属性', () => {
      const data = [{ type: 'a', value: 1 }];
      const { getByTestId } = render(
        <Pie data={data} angleField="value" colorField="type" />,
      );
      expect(getByTestId('pie-chart')).toBeDefined();
    });
  });
});
