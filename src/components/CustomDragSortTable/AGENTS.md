# CustomDragSortTable 组件约定

## 简介

基于 `@ant-design/pro-components` 的 `DragSortTable` 封装，用于实现拖拽排序功能的业务表格组件。

## 使用场景

- 需要拖拽排序功能的列表页
- 数据行需要手动调整顺序的场景
- 与 `CustomProTable` 的区别：支持拖拽排序但不使用 ProTable 的搜索/工具栏功能

## 代码示例

```tsx
import { CustomDragSortTable } from '@/components';
import type { CustomDragSortTableProps } from '@/components';

// 拖拽排序处理
const handleSort = async (
  dragRow: Record<string, unknown>,
  targetRow: Record<string, unknown>,
) => {
  const sortValue = targetRow.sort as number;
  await updateSort({ id: dragRow.id, sort: sortValue });
};

<CustomDragSortTable
  request={async (params) => {
    const { data } = await fetchList(params);
    return { data, success: true };
  }}
  rowKey="id"
  dragSortKey="sort"
  onDragSortEnd={handleSort}
  columns={[
    { title: '名称', dataIndex: 'name' },
    { title: '排序', dataIndex: 'sort', editable: true },
  ]}
/>;
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `rowKey` | `string` | `'id'` | 行唯一标识字段 |
| `dragSortKey` | `string` | - | 排序列的字段名 |
| `onDragSortEnd` | `(dragRow: Record<string, unknown>, targetRow: Record<string, unknown>) => Promise<void>` | - | 拖拽结束回调 |
| `request` | `(params: T) => Promise<{ data: T[]; success: boolean }>` | - | 数据请求函数 |

> 其他 `@ant-design/pro-components` `DragSortTable` 支持的 props 均可用。

## 注意事项

- `rowKey` 默认为 `'id'`
- 使用 `CustomEmpty` 作为空状态组件
- `ref` 接口存在但当前版本不暴露任何方法
- 拖拽排序依赖 `dragSortKey` 参数指定排序列

## 依赖

- @ant-design/pro-components DragSortTable
- CustomEmpty
