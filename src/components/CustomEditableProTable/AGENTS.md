# CustomEditableProTable 组件约定

## 简介

基于 `@ant-design/pro-components` 的 `EditableProTable` 封装，用于实现行编辑、单元格编辑功能的业务表格组件。

## 使用场景

- 需要在表格内直接编辑数据的场景
- 批量编辑列表数据的场景
- 与 `CustomProTable` 的区别：支持编辑功能但不使用 ProTable 的搜索/工具栏功能

## 代码示例

```tsx
import { CustomEditableProTable } from '@/components';
import type { CustomEditableProTableProps } from '@/components';

const [editableData, setEditableData] = useState<DataType[]>([]);

<CustomEditableProTable
  value={editableData}
  onChange={setEditableData}
  rowKey="id"
  columns={[
    { title: '名称', dataIndex: 'name', editable: true },
    { title: '状态', dataIndex: 'status', valueType: 'select', editable: true },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <EditableProTable.RecordEditor record={record} key="editor" />,
      ],
    },
  ]}
/>;
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `T[]` | - | 表格数据（受控模式） |
| `onChange` | `(value: T[]) => void` | - | 数据变更回调 |
| `rowKey` | `string` | `'id'` | 行唯一标识字段 |
| `columns` | `ProColumns[]` | - | 列配置，需设置 `editable: true` 开启编辑 |
| `ref` | `CustomEditableProTableRef` | - | 表格引用（当前版本不暴露方法） |

## 注意事项

- `rowKey` 默认为 `'id'`
- 使用 `CustomEmpty` 作为空状态组件
- `ref` 接口存在但当前版本不暴露任何方法
- 编辑模式通过 `value` + `onChange` 受控模式使用
- `columns` 中设置 `editable: true` 开启单元格编辑

## 依赖

- @ant-design/pro-components EditableProTable
- CustomEmpty
