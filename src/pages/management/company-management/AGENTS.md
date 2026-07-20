# 页面约定

## Figma 链接

- [主页面](https://www.figma.com/design/h0gT5MlFnxNOmOIQVd1thT/%E5%A4%9A%E8%B4%A5%E7%9F%A9%E9%98%B5%E5%BC%8F%E7%AE%A1%E7%90%86%E7%B3%BB%E7%BB%9F-Web%E7%AB%AF?node-id=3597-1723)
- [新增公司弹窗](https://www.figma.com/design/h0gT5MlFnxNOmOIQVd1thT/%E5%A4%9A%E8%B4%A5%E7%9F%A9%E9%98%B5%E5%BC%8F%E7%AE%A1%E7%90%86%E7%B3%BB%E7%BB%9F-Web%E7%AB%AF?node-id=3606-2185)
- [创建成功弹窗](https://www.figma.com/design/h0gT5MlFnxNOmOIQVd1thT/%E5%A4%9A%E8%B4%A5%E7%9F%A9%E9%98%B5%E5%BC%8F%E7%AE%A1%E7%90%86%E7%B3%BB%E7%BB%9F-Web%E7%AB%AF?node-id=3606-2225)
- [编辑公司弹窗](https://www.figma.com/design/h0gT5MlFnxNOmOIQVd1thT/%E5%A4%9A%E8%B4%A5%E7%9F%A9%E9%98%B5%E5%BC%8F%E7%AE%A1%E7%90%86%E7%B3%BB%E7%BB%9F-Web%E7%AB%AF?node-id=3606-2247)
- [手动充值弹窗](https://www.figma.com/design/h0gT5MlFnxNOmOIQVd1thT/%E5%A4%9A%E8%B4%A5%E7%9F%A9%E9%98%B5%E5%BC%8F%E7%AE%A1%E7%90%86%E7%B3%BB%E7%BB%9F-Web%E7%AB%AF?node-id=3607-2190)
- [禁用确认弹窗](https://www.figma.com/design/h0gT5MlFnxNOmOIQVd1thT/%E5%A4%9A%E8%B4%A5%E7%9F%A9%E9%98%B5%E5%BC%8F%E7%AE%A1%E7%90%86%E7%B3%BB%E7%BB%9F-Web%E7%AB%AF?node-id=3607-2224)
- [启用确认弹窗](https://www.figma.com/design/h0gT5MlFnxNOmOIQVd1thT/%E5%A4%9A%E8%B4%A5%E7%9F%A9%E9%98%B5%E5%BC%8F%E7%AE%A1%E7%90%86%E7%B3%BB%E7%BB%9F-Web%E7%AB%AF?node-id=3607-2251)

## 需求文件

- [需求文件](暂无)

## 验收文件

- [需求验收文件](暂无)
- [测试用例验收文件](暂无)

## 测试用例文件

- [测试用例文件](暂无)

## OpenAPI 文件

- [OpenAPI 文件](暂无)

## CSS变量和样式常量文件

- [vars.css](暂无) - CSS变量定义
- [vars.ts](暂无) - TypeScript常量定义

## 组件清单

### 主页面组件
| 组件名 | 目录路径 | Figma 锚点 | 职责 |
|--------|----------|------------|------|
| PageHeader | 内联 | node-id=3597:1724 | 页面标题 + 新增公司按钮 |
| CustomProTable | @/components/CustomProTable | - | 表格：筛选/列表/分页 |

### Modal组件
| 组件名 | 目录路径 | Figma 锚点 | 职责 |
|--------|----------|------------|------|
| CompanyFormModal | components/ | node-id=3606:2185 | 新增公司表单 |
| CreateSuccessModal | components/ | node-id=3606:2225 | 创建成功：账号密码展示 |
| EditCompanyModal | components/ | node-id=3606:2247 | 编辑公司表单 |
| RechargeModal | components/ | node-id=3607:2190 | 手动充值积分 |
| DisableConfirmModal | components/ | node-id=3607:2224 | 禁用确认 |
| EnableConfirmModal | components/ | node-id=3607:2251 | 启用确认 |

## 交互逻辑

### AI阅读

[交互逻辑](./swimlane.yaml)

> 同步生成 [交互泳道图](./swimlane.svg)

<!-- AI_SKIP_START -->

### 人类阅读

<details>
<summary>点击查看交互泳道图</summary>

![交互泳道图](./swimlane.svg)

</details>

<!-- AI_SKIP_END -->
