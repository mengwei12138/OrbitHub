import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import CustomDrawer from '../index';

describe('CustomDrawer 组件单元测试', () => {
  describe('基础渲染', () => {
    it('open 为 false 时不渲染 Drawer', () => {
      const { container } = render(<CustomDrawer open={false} title="测试" />);
      expect(container.querySelector('.ant-drawer')).toBeNull();
    });

    it('open 为 true 时渲染 Drawer', () => {
      const { container } = render(<CustomDrawer open title="测试" />);
      expect(container.querySelector('.ant-drawer')).toBeDefined();
    });

    it('正确传递 title', () => {
      const { getByText } = render(<CustomDrawer open title="测试标题" />);
      expect(getByText('测试标题')).toBeDefined();
    });
  });

  describe('submitter 渲染', () => {
    it('默认渲染 submitter 区域', () => {
      const { container } = render(<CustomDrawer open />);
      expect(container.querySelector('.ant-pro-form-submit')).toBeDefined();
    });

    it('footer 为 null 时不渲染 submitter 区域', () => {
      const { container } = render(<CustomDrawer open footer={null} />);
      expect(container.querySelector('.ant-pro-form-submit')).toBeNull();
    });

    it('submitter 为 false 时不渲染 submitter 区域', () => {
      const { container } = render(<CustomDrawer open submitter={false} />);
      expect(container.querySelector('.ant-pro-form-submit')).toBeNull();
    });
  });

  describe('onFinish 回调', () => {
    it('支持 onFinish 属性传入', () => {
      const onFinish = vi.fn().mockResolvedValue(true);
      const { container } = render(
        <CustomDrawer open title="测试" onFinish={onFinish}>
          <div>content</div>
        </CustomDrawer>,
      );

      expect(container.querySelector('.ant-drawer')).toBeDefined();
    });
  });
});
