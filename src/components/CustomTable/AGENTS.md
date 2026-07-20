# CustomTable 组件约定

## 简介

基于 antd Table 封装的轻量级业务表格组件，适用于简单的列表展示场景。

## 使用场景

- 简单列表展示（无搜索/分页工具栏）
- 不需要复杂筛选的列表页
- 轻量级数据展示

## 代码示例

```tsx
import { CustomTable } from '@/components';
import type { CustomTableProps } from '@/components';

<CustomTable
  dataSource={[{ id: '1', name: 'test' }]}
  columns={[{ title: '姓名', dataIndex: 'name' }]}
/>;
```

## Props

| 属性         | 类型              | 默认值 | 说明           |
| ------------ | ----------------- | ------ | -------------- |
| `rowKey`     | `string`          | `'id'` | 行唯一标识字段 |
| `dataSource` | `T[]`             | -      | 数据源         |
| `columns`    | `ColumnType<T>[]` | -      | 列配置         |

> 所有 antd `Table` 支持的 props 均可用。

## 注意事项

1. **继承 antd Table**：所有 antd Table 属性均可使用
2. **虚拟化**：默认启用虚拟滚动，大数据量时性能更好
3. **空状态**：使用 CustomEmpty 组件显示空状态

## 依赖

- antd Table
- CustomEmpty
