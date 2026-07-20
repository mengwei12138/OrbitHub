# TableEmpty 组件约定

## 简介

表格专用空状态组件，包含插图、标题、描述和重置按钮，用于筛选条件无匹配数据时展示。

## 使用场景

- 表格筛选后无匹配数据的空状态
- 搜索无结果时的空状态提示
- 需要提供"重置筛选"操作的场景

## 代码示例

```tsx
import { TableEmpty } from '@/components';

// 基础用法
<TableEmpty />

// 自定义文本
<TableEmpty
  title="没有找到匹配的账号"
  description="请调整筛选条件后重试"
  onReset={handleReset}
/>

// 在 CustomProTable 中使用
<CustomProTable
  rowKey="id"
  request={fetchList}
  columns={columns}
  locale={{
    emptyText: <TableEmpty onReset={() => tableRef.current?.reset()} />,
  }}
/>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | `"没有找到匹配的账号"` | 空状态标题 |
| `description` | `string` | `"请调整筛选条件后重试"` | 空状态描述 |
| `onReset` | `() => void` | `undefined` | 点击"重置筛选"按钮的回调函数 |

## 依赖

- antd Empty
- antd Button
- @ant-design/icons SearchOutlined
