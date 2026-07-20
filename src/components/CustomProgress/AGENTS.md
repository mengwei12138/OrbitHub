# CustomProgress 组件约定

## 简介

基于 antd `Progress` 封装的进度条组件，完全透传 antd Progress 所有 props，支持 `ref`。

## 使用场景

- 文件上传进度展示
- 任务完成百分比展示
- 数据处理进度展示

## 代码示例

```tsx
import { CustomProgress } from '@/components';
import type { CustomProgressRef } from '@/components';
import { useRef } from 'react';

const progressRef = useRef<CustomProgressRef>(null);

// 基础用法
<CustomProgress percent={30} />

// 显示进度值
<CustomProgress percent={75} format={(percent) => `${percent}%`} />

// 状态进度条
<CustomProgress percent={100} status="success" />
<CustomProgress percent={50} status="exception" />

// 环形进度
<CustomProgress type="circle" percent={90} />

// 获取 ref
<CustomProgress ref={progressRef} percent={60} />
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `ref` | `CustomProgressRef` (`HTMLDivElement`) | - | 进度条 DOM 元素引用 |
| `percent` | `number` | `0` | 进度百分比 (0-100) |
| `status` | `'normal' \| 'success' \| 'exception'` | - | 进度条状态 |
| `type` | `'line' \| 'circle' \| 'dashboard'` | `'line'` | 进度条类型 |
| `format` | `(percent?: number, successPercent?: number) => ReactNode` | - | 格式化函数 |
| `strokeColor` | `string \| ProgressGradient` | - | 进度条颜色 |
| `strokeWidth` | `number` | - | 进度条宽度 |
| `trailColor` | `string` | - | 轨迹颜色 |
| `size` | `number \| [number, number]` | - | 尺寸 |
| `steps` | `number` | - | 步骤数 |
| `success` | `{ percent: number; strokeColor: string }` | - | 成功部分配置 |
| `showInfo` | `boolean` | `true` | 是否显示进度值 |

> 其他 antd `Progress` 组件支持的 props 均可用，组件完全透传。

## 注意事项

- 完全透传 antd `Progress` 组件的所有 props
- `ref` 类型为 `HTMLDivElement`

## 依赖

- antd Progress
