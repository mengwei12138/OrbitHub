# API 基础设施

## 导入

```tsx
import { request, queryClient } from '@/api';
import type { Result, PaginationParams, PaginationResponse } from '@/api';
```

## request

axios 实例，无超时限制，统一响应格式，自动处理 401。

## queryClient

TanStack Query 客户端。

## types

- `Result<T>` - 统一响应格式
- `PaginationParams` - 分页参数
- `PaginationResponse<T>` - 分页响应
