# CustomProTable 组件约定

## 简介

基于 @ant-design/pro-components ProTable 封装的功能完整的业务表格组件，适用于大多数列表页场景。

## 使用场景

- 需要搜索 + 分页 + 工具栏的功能完整列表
- 复杂的数据筛选和展示
- 与 TanStack Query 配合使用

## 代码示例

```tsx
import { CustomProTable } from '@/components';
import type { CustomProTableProps, CustomProTableRef } from '@/components';

// 数组形式
<CustomProTable dataSource={[{ id: '1', name: 'test' }]} />

// Promise 形式
<CustomProTable dataSource={Promise.resolve([{ id: '1', name: 'test' }])} />

// 函数形式（带分页）
<CustomProTable
  dataSource={(params) => fetchList(params)}
  columns={[{ title: '姓名', dataIndex: 'name' }]}
/>

// 错误状态
<CustomProTable
  dataSource={error}
  errorContent={<TableError onRetry={refetch} />}
/>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `dataSource` | `T[] \| Promise<T[]> \| (params) => Promise<{ data: T[]; success: boolean }>` | - | 支持数组、Promise、函数三种形式 |
| `rowKey` | `string` | `'id'` | 行唯一标识字段 |
| `columns` | `ProColumns[]` | - | 列配置 |
| `errorContent` | `ReactNode` | - | 错误状态展示内容 |

## ref 方法

```tsx
const tableRef = useRef<CustomProTableRef>();

tableRef.current?.reload(); // 刷新
tableRef.current?.reset(); // 重置搜索条件
tableRef.current?.getSelectedRows(); // 获取选中的行
```

## 注意事项

1. **dataSource 灵活性**：支持多种数据源形式，适应不同场景
2. **自动分页处理**：空数据自动回退到前一页
3. **queryOptions**：可配合 TanStack Query 使用

## 依赖

- @ant-design/pro-components ProTable
- TableEmpty
- TableError
