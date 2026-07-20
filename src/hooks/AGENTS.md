# Hooks 索引

## 导入

```tsx
import {
  useAccess,
  useBreadcrumb,
  useBreadcrumbItems,
  useMenus,
} from '@/hooks';
```

## Hooks

| Hook | 返回值 | 说明 |
| --- | --- | --- |
| `useAccess(path)` | `boolean` | 权限检查 |
| `useBreadcrumb()` | `{ setBreadcrumb, clearBreadcrumb }` | 操作面包屑 |
| `useBreadcrumbItems()` | `BreadcrumbItem[]` | 获取面包屑数据 |
| `useMenus()` | `MenuDataItem[]` | 获取菜单数据 |
