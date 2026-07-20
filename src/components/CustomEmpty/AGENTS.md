# CustomEmpty 组件约定

## 简介

基于 antd `Empty` 组件封装的通用空状态组件，使用 `PRESENTED_IMAGE_SIMPLE` 默认图片。

## 使用场景

- 列表/表格无数据时的空状态展示
- 可选的点击事件用于触发重新加载或重置筛选

## 代码示例

```tsx
import { CustomEmpty } from '@/components';
import type { CustomEmptyProps } from '@/components';

// 基础用法
<CustomEmpty />

// 自定义描述
<CustomEmpty description="暂无数据" />

// 可点击的空状态
<CustomEmpty description="没有找到匹配的账号" onClick={handleReset} />
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `description` | `string \| null` | `null` | 空状态的描述文字，设为 `null` 不显示描述 |
| `onClick` | `() => void` | - | 可选的点击事件，用于触发重新加载或重置筛选 |

> 其他 antd `Empty` 组件支持的 props 均可用。

## 注意事项

- `description` 默认为 `null`（不显示描述）
- 有 `onClick` 时显示为可点击态（cursor: pointer）

## 依赖

- antd Empty
