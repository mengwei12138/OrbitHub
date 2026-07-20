import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TrialStatusCard } from '../index';

describe('TrialStatusCard', () => {
  it('试用态展示 Tab 与试用说明条', () => {
    render(<TrialStatusCard trialRemaining={3} selectedMode="trial" />);
    expect(screen.getByRole('tab', { name: '免费试用' })).toBeTruthy();
    expect(
      screen.getByText(
        /免费试用：仅图片素材、不支持虚拟人物、不扣积分。剩余 3 次/u,
      ),
    ).toBeTruthy();
  });

  it('付费态不展示试用说明条', () => {
    render(<TrialStatusCard trialRemaining={3} selectedMode="standard" />);
    expect(screen.queryByText(/仅图片素材/u)).toBeNull();
  });

  it('试用次数用尽时不展示免费试用 Tab', () => {
    render(<TrialStatusCard trialRemaining={0} selectedMode="standard" />);
    expect(screen.queryByRole('tab', { name: '免费试用' })).toBeNull();
    expect(screen.getByRole('tab', { name: '标准质量' })).toBeTruthy();
  });

  it('试用态点击标准质量切换到付费模式', () => {
    const onModeChange = vi.fn();
    render(
      <TrialStatusCard
        trialRemaining={3}
        selectedMode="trial"
        onModeChange={onModeChange}
      />,
    );
    fireEvent.click(screen.getByRole('tab', { name: '标准质量' }));
    expect(onModeChange).toHaveBeenCalledWith('standard');
  });

  it('试用态点击高级质量可直接切到 premium', () => {
    const onModeChange = vi.fn();
    render(
      <TrialStatusCard
        trialRemaining={3}
        selectedMode="trial"
        onModeChange={onModeChange}
      />,
    );
    const premiumTab = screen.getByRole('tab', { name: '高级质量' });
    expect(premiumTab).not.toBeDisabled();
    fireEvent.click(premiumTab);
    expect(onModeChange).toHaveBeenCalledWith('premium');
  });

  it('付费态可选择高级质量', () => {
    const onModeChange = vi.fn();
    render(
      <TrialStatusCard
        trialRemaining={3}
        selectedMode="standard"
        onModeChange={onModeChange}
      />,
    );
    fireEvent.click(screen.getByRole('tab', { name: '高级质量' }));
    expect(onModeChange).toHaveBeenCalledWith('premium');
  });

  it('试用态点击免费试用 Tab 保持试用模式', () => {
    const onModeChange = vi.fn();
    render(
      <TrialStatusCard
        trialRemaining={2}
        selectedMode="standard"
        onModeChange={onModeChange}
      />,
    );
    fireEvent.click(screen.getByRole('tab', { name: '免费试用' }));
    expect(onModeChange).toHaveBeenCalledWith('trial');
  });
});
