# TableError 组件约定

## 简介

表格专用错误状态组件，包含错误插图、标题、描述和重试按钮，用于数据加载失败时展示。

## 使用场景

- 表格数据加载失败时的错误提示
- 网络异常或服务器错误时的状态展示
- 需要提供"重新加载"操作的场景

## 代码示例

```tsx
import { TableError } from '@/components';

// 基础用法
<TableError />

// 自定义文本
<TableError
  title="加载失败"
  description="网络异常或服务器错误，请稍后重试"
  onRetry={handleRetry}
/>

// 在 CustomProTable 中使用
<CustomProTable
  rowKey="id"
  request={fetchList}
  columns={columns}
  // 错误状态通常由 ProTable 自动处理
/>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | `"加载失败"` | 错误状态标题 |
| `description` | `string` | `"网络异常或服务器错误，请稍后重试"` | 错误状态描述 |
| `onRetry` | `() => void` | `undefined` | 点击"重新加载"按钮的回调函数 |

## 依赖

- antd Empty
- antd Button
- @ant-design/icons CloseCircleOutlined
