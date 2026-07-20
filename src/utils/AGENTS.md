# Utils 索引

## 导入

```tsx
import { add, sub, mul, div } from '@/utils'; // math
import { formatDate, formatDateTime } from '@/utils'; // date
import { formatThousands } from '@/utils'; // money
import { toFixed, formatDuration } from '@/utils'; // number
import { validatePhone, validateIdCard } from '@/utils'; // validate
```

## Utils

| 函数                                 | 说明                           |
| ------------------------------------ | ------------------------------ |
| `add(...values)`                     | 精确加法                       |
| `sub(...values)`                     | 精确减法                       |
| `mul(...values)`                     | 精确乘法                       |
| `div(...values)`                     | 精确除法                       |
| `formatDate(date?)`                  | 格式化为 `YYYY-MM-DD`          |
| `formatDateTime(date?)`              | 格式化为 `YYYY-MM-DD HH:mm:ss` |
| `formatDateStart(date?)`             | 格式化当天开始 `00:00:00`      |
| `formatDateEnd(date?)`               | 格式化当天结束 `23:59:59`      |
| `formatThousands(value, decimals?)`  | 千分位格式化                   |
| `toFixed(value, decimals, options?)` | 精度转化                       |
| `formatDuration(seconds)`            | 时长格式化为 `MM:SS`           |
| `validatePhone(value)`               | 校验手机号                     |
| `validateIdCard(value)`              | 校验身份证号                   |
| `copyToClipboard(text)`              | 复制文本（HTTP 环境自动降级）  |
