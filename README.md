# MatrixHub UI Review Prototype

这是从仓库正式前端 `web/` 复制出来的需求评审原型副本。

## 定位

- 只用于 PRD 评审、页面对齐和验收讨论。
- 不属于正式前端实现，不替代仓库根目录 `web/`。
- 默认不请求真实后端，不依赖 `matrixhub.test.k8s`。
- 原型内置本地 mock API 和角色切换工具，支持 `PLATFORM_ADMIN`、`TENANT_ADMIN`、`NORMAL_ADMIN`。

## 启动

```bash
cd requirements/prototypes/matrixhub-ui-review
npm install --package-lock=false --legacy-peer-deps --registry=https://registry.npmjs.org
npm run dev
```

默认访问：

```text
http://127.0.0.1:8010/
```

## 提交边界

需求评审提交时只提交：

- `requirements/prd`
- `requirements/prototypes`

不要提交根目录 `web/` 的临时评审改动。
