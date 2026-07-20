import type { ButtonProps } from 'antd';

export type CountdownButtonProps = {
  /** 初始按钮文本，默认"获取验证码" */
  buttonText?: string;
  /** 倒计时时长(秒)，默认 60；onClick 返回 number 时以返回值为准 */
  duration?: number;
  /** 点击回调：返回 true 使用 duration；返回 number 则以该秒数倒计时 */
  onClick?: () => Promise<boolean | number> | boolean | number;
  /** 外部控制禁用 */
  disabled?: boolean;
  /** 按钮类型 */
  variant?: 'default' | 'primary';
} & Omit<ButtonProps, 'type' | 'onClick' | 'disabled' | 'loading' | 'variant'>;
