# account/components 组件约定

## 组件索引

| 组件                  | 说明                             |
| --------------------- | -------------------------------- |
| `PlatformIcon`        | 平台图标组件（抖音/小红书）      |
| `AccountStatusBadge`  | 账号状态徽章（在线/已停止/失效） |
| `AccountTableToolbar` | 账号表格工具栏（批量操作/刷新）  |

## 组件关系图

```
account/index
├── PageHeader (来自 @/components/PageHeader)  # 页面头部
│   ├── 标题：账号管理
│   └── Button：添加账号
└── AccountTable                 # 账号表格
    └── AccountTableToolbar      # 工具栏
        ├── 已选 {count} 个
        ├── Button：批量停止
        ├── Button：批量启动
        ├── Button：批量删除
        └── Button：刷新
```

## PlatformIcon 组件说明

### 平台配置

| 平台          | 图标       | 标签   |
| ------------- | ---------- | ------ |
| `douyin`      | 抖音图标   | 抖音   |
| `xiaohongshu` | 小红书图标 | 小红书 |

### Props

```tsx
interface PlatformIconProps {
  platform: 'douyin' | 'xiaohongshu' | string;
  size?: number; // 图标尺寸，默认 24
}
```

### 使用示例

```tsx
<PlatformIcon platform="douyin" size={24} />
<PlatformIcon platform="xiaohongshu" />
```

### 依赖资源

| 资源       | 路径                                 |
| ---------- | ------------------------------------ |
| 抖音图标   | `@/images/platforms/douyin.png`      |
| 小红书图标 | `@/images/platforms/xiaohongshu.png` |

## AccountStatusBadge 组件说明

### 状态配置

| 状态      | 标签   | 背景色    | 文字色    |
| --------- | ------ | --------- | --------- |
| `online`  | 在线   | `#F6FFED` | `#52C41A` |
| `stopped` | 已停止 | `#F5F5F5` | `#8C8C8C` |
| `invalid` | 失效   | `#FFF2F0` | `#FF4D4F` |

### Props

```tsx
interface AccountStatusBadgeProps {
  status: 'online' | 'stopped' | 'invalid';
}
```

### 使用示例

```tsx
<AccountStatusBadge status="online" />
<AccountStatusBadge status="stopped" />
<AccountStatusBadge status="invalid" />
```

### 依赖类型

```tsx
import { ACCOUNT_RUN_STATUS } from '@/services/account/types';
```

## AccountTableToolbar 组件说明

### 功能说明

- 显示已选账号数量
- 批量停止账号
- 批量启动账号
- 批量删除账号
- 刷新列表

### Props

```tsx
interface AccountTableToolbarProps {
  selectedRowKeys: string[]; // 已选择的账号 ID 列表
  onBatchStop: () => void; // 批量停止回调
  onBatchStart: () => void; // 批量启动回调
  onBatchDelete: () => void; // 批量删除回调
  onRefresh: () => void; // 刷新回调
}
```

### 使用示例

```tsx
<AccountTableToolbar
  selectedRowKeys={selectedIds}
  onBatchStop={handleBatchStop}
  onBatchStart={handleBatchStart}
  onBatchDelete={handleBatchDelete}
  onRefresh={handleRefresh}
/>
```

### 按钮状态

| 条件                           | 按钮状态 |
| ------------------------------ | -------- |
| `selectedRowKeys.length === 0` | 全部禁用 |
| `selectedRowKeys.length > 0`   | 全部启用 |
