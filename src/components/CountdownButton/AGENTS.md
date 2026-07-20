# CountdownButton 组件约定

## 简介

带倒计时功能的按钮组件，常用于获取验证码场景。点击后进入倒计时状态，倒计时结束后恢复。

## 使用场景

- 获取验证码按钮
- 需要倒计时限制的操作按钮
- 短信/邮件发送倒计时

## 代码示例

```tsx
import { CountdownButton } from '@/components';
import type { CountdownButtonProps } from '@/components';

// 基础用法
<CountdownButton onClick={() => sendVerifyCode(phone)} />

// 自定义文案和时长
<CountdownButton
  buttonText="发送验证码"
  duration={60}
  onClick={async () => {
    await sendVerifyCode(phone);
    return true;
  }}
/>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `buttonText` | `string` | `"获取验证码"` | 按钮文案 |
| `duration` | `number` | `60` | 倒计时时长（秒） |
| `onClick` | `() => Promise<boolean> \| boolean` | `undefined` | 点击回调，返回 `true` 开始倒计时 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `variant` | `'default' \| 'primary'` | `'default'` | 按钮类型变体 |

> 其他 antd `Button` 支持的 props 均可用（`type`、`onClick`、`disabled`、`loading`、`variant` 除外）。

## 注意事项

1. **onClick 返回值**：返回 `true` 时才会开始倒计时
2. **自动禁用**：倒计时期间按钮自动禁用
3. **Loading 状态**：onClick 执行期间显示 loading 状态

## 依赖

- antd Button
