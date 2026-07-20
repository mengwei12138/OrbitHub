# TabBar 组件约定

## 简介

下划线指示器 TabBar 组件，用于 Tab 页签切换。

## 使用场景

- 页面顶部 Tab 切换（如视频发布/图文发布）
- 需要通过 `onChange` 回调与外部交互

## 代码示例

```tsx
import { TabBar } from '@/components';

// 基础用法
<TabBar
  tabs={[
    { key: 'video', name: '视频发布' },
    { key: 'image', name: '图文发布' },
  ]}
  activeTab="image"
  onChange={(key) => console.log('切换到:', key)}
/>;
```

## Props

| 属性        | 类型                              | 必填 | 说明         |
| ----------- | --------------------------------- | ---- | ------------ |
| `tabs`      | `{ key: string; name: string }[]` | 是   | Tab 项列表   |
| `activeTab` | `string`                          | 是   | 当前选中 key |
| `onChange`  | `(key: string) => void`           | 是   | 切换回调     |

## 依赖样式变量

| 变量                         | 默认值             | 说明       |
| ---------------------------- | ------------------ | ---------- |
| `--color-bg-container`       | `#fff`             | 背景色     |
| `--color-border-secondary`   | `#f0f0f0`          | 底部边框色 |
| `--color-primary`            | `#1677ff`          | 选中态颜色 |
| `--color-text`               | `rgba(0,0,0,0.88)` | 文字主色   |
| `--color-text-secondary`     | `rgba(0,0,0,0.65)` | 文字次色   |
| `--spacing-lg`               | `16px`             | 水平内边距 |
| `--transition-duration-base` | `0.2s`             | 过渡时间   |
| `--border-radius-sm`         | `4px`              | 下划线圆角 |
