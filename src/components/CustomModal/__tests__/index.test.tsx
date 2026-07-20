import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import CustomModal from '../index';

describe('CustomModal 组件单元测试', () => {
  describe('基础渲染', () => {
    it('open 为 false 时不渲染 Modal', () => {
      const { container } = render(<CustomModal open={false} title="测试" />);
      expect(container.querySelector('.ant-modal')).toBeNull();
    });

    it('open 为 true 时渲染 Modal', () => {
      const { container } = render(<CustomModal open title="测试" />);
      expect(container.querySelector('.ant-modal')).toBeDefined();
    });

    it('正确传递 title', () => {
      const { getByText } = render(<CustomModal open title="测试标题" />);
      expect(getByText('测试标题')).toBeDefined();
    });
  });

  describe('submitter 渲染', () => {
    it('默认渲染 submitter 区域', () => {
      const { container } = render(<CustomModal open />);
      expect(container.querySelector('.ant-pro-form-submit')).toBeDefined();
    });

    it('footer 为 null 时不渲染 submitter 区域', () => {
      const { container } = render(<CustomModal open footer={null} />);
      expect(container.querySelector('.ant-pro-form-submit')).toBeNull();
    });

    it('submitter 为 false 时不渲染 submitter 区域', () => {
      const { container } = render(<CustomModal open submitter={false} />);
      expect(container.querySelector('.ant-pro-form-submit')).toBeNull();
    });
  });

  describe('静态方法存在性', () => {
    it('confirm 方法存在', () => {
      expect(typeof CustomModal.confirm).toBe('function');
    });

    it('success 方法存在', () => {
      expect(typeof CustomModal.success).toBe('function');
    });

    it('error 方法存在', () => {
      expect(typeof CustomModal.error).toBe('function');
    });

    it('warning 方法存在', () => {
      expect(typeof CustomModal.warning).toBe('function');
    });

    it('info 方法存在', () => {
      expect(typeof CustomModal.info).toBe('function');
    });
  });

  describe('onFinish 回调', () => {
    it('支持 onFinish 属性传入', () => {
      const onFinish = vi.fn().mockResolvedValue(true);
      const { container } = render(
        <CustomModal open title="测试" onFinish={onFinish}>
          <div>content</div>
        </CustomModal>,
      );

      expect(container.querySelector('.ant-modal')).toBeDefined();
    });
  });

  describe('静态方法', () => {
    it('confirm 方法是函数类型', () => {
      expect(typeof CustomModal.confirm).toBe('function');
    });

    it('success 方法是函数类型', () => {
      expect(typeof CustomModal.success).toBe('function');
    });

    it('error 方法是函数类型', () => {
      expect(typeof CustomModal.error).toBe('function');
    });
  });
});
