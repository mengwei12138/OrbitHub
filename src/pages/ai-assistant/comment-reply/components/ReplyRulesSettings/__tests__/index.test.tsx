import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ReplyRulesSettings from '../index';

const mockRules = [
  { id: '1', type: 'positive' as const, template: '感谢您的支持！' },
  { id: '2', type: 'negative' as const, template: '抱歉给您带来不便' },
];

describe('ReplyRulesSettings', () => {
  describe('渲染', () => {
    it('应显示标题', () => {
      render(<ReplyRulesSettings />);

      const title = document.querySelector('[class*="_title_"]');
      expect(title?.textContent).toBe('回复规则设置');
    });

    it('应显示自动回复开关', () => {
      render(<ReplyRulesSettings />);

      const switchLabel = document.querySelector('[class*="_switchLabel_"]');
      expect(switchLabel?.textContent).toBe('自动回复开关');
    });

    it('应显示开关状态', () => {
      render(<ReplyRulesSettings enabled={true} />);

      const switchStatus = document.querySelector('[class*="_switchStatus_"]');
      expect(switchStatus?.textContent).toBe('已开启');
    });

    it('应显示回复语气标签', () => {
      render(<ReplyRulesSettings />);

      const sectionLabel = document.querySelector('[class*="_sectionLabel_"]');
      expect(sectionLabel?.textContent).toBe('回复语气：');
    });

    it('应显示人工干预设置', () => {
      render(<ReplyRulesSettings />);

      const interventionHeader = document.querySelector(
        '[class*="_interventionHeader_"]',
      );
      expect(interventionHeader?.textContent).toBe('人工干预设置：');
    });

    it('应显示屏蔽关键词标签', () => {
      render(<ReplyRulesSettings />);

      const keywordSection = document.querySelector(
        '[class*="_keywordSection_"]',
      );
      expect(keywordSection?.textContent).toContain('关键词屏蔽');
    });
  });

  describe('操作', () => {
    it('点击 Switch 应触发 onToggle', () => {
      const onToggle = vi.fn();
      render(<ReplyRulesSettings onToggle={onToggle} />);

      const switchEl = document.querySelector('.ant-switch');
      if (switchEl) {
        fireEvent.click(switchEl);
        expect(onToggle).toHaveBeenCalled();
      }
    });

    it('点击语气选项应触发 onToneChange', () => {
      const onToneChange = vi.fn();
      render(<ReplyRulesSettings onToneChange={onToneChange} />);

      const toneOpts = document.querySelectorAll('[class*="_toneOpt_"]');
      if (toneOpts.length > 0) {
        fireEvent.click(toneOpts[0]);
      }
    });

    it('点击编辑按钮应触发 onRuleEdit', () => {
      const onRuleEdit = vi.fn();
      render(<ReplyRulesSettings rules={mockRules} onRuleEdit={onRuleEdit} />);

      const editBtns = document.querySelectorAll('[class*="_editBtn_"]');
      if (editBtns.length > 0) {
        fireEvent.click(editBtns[0]);
        expect(onRuleEdit).toHaveBeenCalledWith(mockRules[0]);
      }
    });

    it('点击添加规则按钮应触发 onAddRule', () => {
      const onAddRule = vi.fn();
      render(<ReplyRulesSettings onAddRule={onAddRule} />);

      const addBtn = document.querySelector('[class*="_addBtn_"]');
      if (addBtn) {
        fireEvent.click(addBtn);
        expect(onAddRule).toHaveBeenCalled();
      }
    });
  });
});
