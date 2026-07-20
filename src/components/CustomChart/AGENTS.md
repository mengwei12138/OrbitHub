# CustomChart 组件约定

## 简介

基于 @ant-design/charts 封装的图表组件，提供 Line、Bar、Pie 三种常用图表。

## 组件列表

| 组件         | 用途   | 导出名称 | 基础用法         |
| ------------ | ------ | -------- | ---------------- |
| `CustomLine` | 折线图 | `Line`   | 展示数据趋势     |
| `CustomBar`  | 柱状图 | `Bar`    | 展示分类数据对比 |
| `CustomPie`  | 饼图   | `Pie`    | 展示占比数据     |

## 使用场景

### 折线图

```tsx
import { Line } from '@/components';
import type { LineProps } from '@/components';

<Line data={[{ time: '1月', value: 100 }]} xField="time" yField="value" />;
```

### 柱状图

```tsx
import { Bar } from '@/components';
import type { BarProps } from '@/components';

<Bar data={[{ category: 'A', value: 100 }]} xField="category" yField="value" />;
```

### 饼图

```tsx
import { Pie } from '@/components';
import type { PieProps } from '@/components';

<Pie
  data={[
    { type: 'A', value: 40 },
    { type: 'B', value: 60 },
  ]}
  angleField="value"
  colorField="type"
/>;
```

## Props

| 组件   | Props 类型                      | 来源                            |
| ------ | ------------------------------- | ------------------------------- |
| `Line` | `LineProps` (`CustomLineProps`) | `@ant-design/charts LineConfig` |
| `Bar`  | `BarProps` (`CustomBarProps`)   | `@ant-design/charts BarConfig`  |
| `Pie`  | `PieProps` (`CustomPieProps`)   | `@ant-design/charts PieConfig`  |

> 所有 `@ant-design/charts` 的 `LineConfig`、`BarConfig`、`PieConfig` 属性均可使用。

## 注意事项

1. **透传属性**：所有 @ant-design/charts 的配置属性均可使用
2. **xField/yField**：大多数图表需要指定数据字段
3. **按需引入**：图表组件单独导出，按需引入

## 类型导出

```tsx
import type { LineProps, BarProps, PieProps } from '@/components';
```
