# 组件库索引

## 组件概览

| 组件 | 说明 | 封装来源 |
| --- | --- | --- |
| `CustomTable` | 通用业务表格（简单列表） | antd Table |
| `CustomProTable` | 功能完整表格（搜索/分页/工具栏） | ProTable |
| `CustomEditableProTable` | 可编辑表格（行编辑） | EditableProTable |
| `CustomDragSortTable` | 拖拽排序表格 | DragSortTable |
| `CustomModal` | 通用模态框表单 | ModalForm |
| `CustomDrawer` | 通用抽屉表单 | DrawerForm |
| `CustomResult` | 结果展示组件 | antd Result |
| `CustomChart` | 通用图表（折线/柱状/饼图） | @ant-design/charts |
| `CustomEmpty` | 通用空状态 | antd Empty |
| `CustomProgress` | 进度条组件 | antd Progress |
| `CustomSteps` | 步骤条组件 | 自定义 |
| `CustomBreadcrumb` | 面包屑导航 | 自定义 |
| `CustomUpload` | 通用上传组件 | 自定义 |
| `Access` | 权限控制组件 | 自定义 |
| `MenuAccess` | 菜单权限控制 | Access |
| `CountdownButton` | 倒计时按钮 | 自定义 |
| `TableEmpty` | 表格空状态 | 自定义 |
| `TableError` | 表格错误状态 | 自定义 |
| `PageHeader` | 页面头部（三区域布局） | 自定义 |
| `TabBar` | 标签页切换组件 | 自定义 |

## PageHeader 组件说明

### 功能说明

页面头部通用组件，采用三区域布局：左侧标题、中间内容区、右侧工具栏。

### 布局结构

```
+--------------------------------------------------------+
|  [title]      [    children (flex:1)    ]   [toolbar] |
|  宽度自适应    自适应填满剩余空间             宽度自适应  |
+--------------------------------------------------------+
```

### Flex 分配

| 区域                | flex 值          | 宽度行为           |
| ------------------- | ---------------- | ------------------ |
| `title`             | `flex: 0 0 auto` | 根据内容撑开       |
| `center` (children) | `flex: 1`        | 自适应填满剩余空间 |
| `toolbar`           | `flex: 0 0 auto` | 根据内容撑开       |

### Props

| 属性       | 类型        | 必填 | 说明                          |
| ---------- | ----------- | ---- | ----------------------------- |
| `title`    | `ReactNode` | 是   | 左侧标题区域                  |
| `toolbar`  | `ReactNode` | 否   | 右侧工具栏区域                |
| `children` | `ReactNode` | 否   | 中间内容区域（flex:1 自适应） |

### 使用示例

```tsx
// 基础用法
<PageHeader title="账号管理" />

// 带工具栏
<PageHeader
  title="账号管理"
  toolbar={<Button type="primary">+ 添加账号</Button>}
/>

// 带中间搜索区
<PageHeader
  title="内容管理"
  toolbar={<Button>导出</Button>}
>
  <Input placeholder="搜索内容..." style={{ width: 300 }} />
</PageHeader>
```

### 依赖样式变量

| 变量                | 默认值 | 说明             |
| ------------------- | ------ | ---------------- |
| `--page-header-gap` | `16px` | 三区域之间的间距 |

## TabBar 组件说明

### 功能说明

下划线指示器 TabBar 组件，用于 Tab 页签切换。点击 Tab 项触发 `onChange` 回调，传入对应 `key` 值与外部交互。

### 布局结构

```
+------------------------------------------------+
|  [视频发布]    [图文发布]                       |
|  ────────                                    |
|  (选中项下方蓝色下划线)                        |
+------------------------------------------------+
```

### Props

| 属性        | 类型                              | 必填 | 说明         |
| ----------- | --------------------------------- | ---- | ------------ |
| `tabs`      | `{ key: string; name: string }[]` | 是   | Tab 项列表   |
| `activeTab` | `string`                          | 是   | 当前选中 key |
| `onChange`  | `(key: string) => void`           | 是   | 切换回调     |

### 使用示例

```tsx
import { TabBar } from '@/components';

// 基础用法
<TabBar
  tabs={[
    { key: 'video', name: '视频发布' },
    { key: 'image', name: '图文发布' },
  ]}
  activeTab="image"
  onChange={(key) => console.log('切换到:', key)}
/>;
```

### 依赖样式变量

| 变量                         | 默认值             | 说明       |
| ---------------------------- | ------------------ | ---------- |
| `--color-bg-container`       | `#fff`             | 背景色     |
| `--color-border-secondary`   | `#f0f0f0`          | 底部边框色 |
| `--color-primary`            | `#1677ff`          | 选中态颜色 |
| `--color-text`               | `rgba(0,0,0,0.88)` | 文字主色   |
| `--color-text-secondary`     | `rgba(0,0,0,0.65)` | 文字次色   |
| `--spacing-lg`               | `16px`             | 水平内边距 |
| `--transition-duration-base` | `0.2s`             | 过渡时间   |
| `--border-radius-sm`         | `4px`              | 下划线圆角 |
