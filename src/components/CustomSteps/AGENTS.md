# CustomSteps 组件约定

## 简介

自定义步骤条组件，通过 CSS 变量实现设计规范定义的外观。使用圆形步骤点 + 连接线布局。

## 使用场景

- 分步表单的步骤指示
- 流程审批状态展示
- 引导用户完成多步骤操作

## 代码示例

```tsx
import { CustomSteps } from '@/components';

const steps = [
  { title: '填写信息' },
  { title: '确认信息' },
  { title: '完成' },
];

// 步骤 1 进行中
<CustomSteps current={0} items={steps} />

// 步骤 2 进行中
<CustomSteps current={1} items={steps} />

// 步骤 3 完成
<CustomSteps current={2} items={steps} />
```

## Props

| 属性        | 类型         | 默认值      | 说明                          |
| ----------- | ------------ | ----------- | ----------------------------- |
| `current`   | `number`     | `0`         | 当前步骤索引（从 0 开始计数） |
| `items`     | `StepItem[]` | `[]`        | 步骤列表                      |
| `className` | `string`     | `undefined` | 自定义 CSS 类名               |

### StepItem 类型

| 属性    | 类型     | 说明     |
| ------- | -------- | -------- |
| `title` | `string` | 步骤标题 |

## CSS 变量

| 变量                                       | 说明             | 默认值  |
| ------------------------------------------ | ---------------- | ------- |
| `--figma-component-steps-width`            | 容器宽度         | `500px` |
| `--figma-component-steps-height`           | 容器高度         | `32px`  |
| `--figma-component-steps-gap`              | 圆形与标签间距   | `8px`   |
| `--figma-component-steps-circle-size`      | 圆形直径         | `32px`  |
| `--figma-component-steps-font-size`        | 字体大小         | `14px`  |
| `--figma-component-steps-font-weight`      | 圆形内数字字重   | `500`   |
| `--figma-component-steps-connector-margin` | 连接线水平外边距 | `8px`   |

## 注意事项

- `current` 从 `0` 开始计数
- 状态自动计算：`index < current` 为 `finish`，`index === current` 为 `active`，其余为 `pending`
- 每个步骤宽度固定 `140px`

## 依赖

- antd Steps
