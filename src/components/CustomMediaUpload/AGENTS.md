# CustomMediaUpload 组件约定

## 简介

通用分片上传组件，完全继承 antd Upload/Upload.Dragger 行为，通过 `uploadController` prop 解耦具体 API 实现。

## 与后端协议对应

遵循 `contract/openapi/media-upload/media-upload-api.yaml` 定义的分片上传协议：

```
1. createSession    → POST /api/v1/media/upload-sessions
2. uploadPart       → PUT /api/v1/media/upload-sessions/{id}/parts/{partNumber}
3. getSessionStatus → GET /api/v1/media/upload-sessions/{id}
4. completeSession  → POST /api/v1/media/upload-sessions/{id}/complete
5. cancelSession    → DELETE /api/v1/media/upload-sessions/{id}
```

## UploadController 接口

组件通过 `uploadController` prop 接收上传逻辑实现：

```typescript
type UploadController = {
  createSession: (file: File) => Promise<UploadSessionCreatedData>;
  uploadPart: (
    uploadSessionId: string,
    partNumber: number,
    blob: Blob,
    sha256?: string,
  ) => Promise<UploadPartAckData>;
  getSessionStatus: (
    uploadSessionId: string,
  ) => Promise<UploadSessionStatusData>;
  cancelSession: (uploadSessionId: string) => Promise<void>;
  completeSession: (
    uploadSessionId: string,
    parts: CompleteUploadPartRef[],
  ) => Promise<UploadCompleteData>;
};
```

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `uploadController` | `UploadController` | **是** | 上传逻辑实现 |
| `chunk` | `{ maxRetries?: number }` | 否 | 分片配置，默认 maxRetries=3 |
| `resume` | `{ enabled?: boolean; storage?: 'indexedDB' }` | 否 | 断点续传配置，默认 enabled=true |
| `dragger` | `boolean` | 否 | 是否使用 Upload.Dragger，默认 false |
| `onProgress` | `(progress: UploadProgress) => void` | 否 | 进度回调 |
| `onChunkSuccess` | `(partNumber: number, result: UploadPartAckData) => void` | 否 | 分片成功回调 |
| `onComplete` | `(result: UploadCompleteData) => void` | 否 | 上传完成回调 |
| `onError` | `(error: UploadError) => void` | 否 | 错误回调 |
| `onCancel` | `(info: CancelInfo) => void` | 否 | 取消回调 |

## 上传流程

```
createSession → uploadPart (并发) → completeSession
                    ↑
                    └── 断点续传: getSessionStatus → 续传缺失分片
```

## 注意事项

1. `uploadController` 必填，由使用方通过 services 层注入
2. 分片序号从 1 开始，与后端接口对齐
3. `serverPartEtag` 需要在 completeSession 时回传
4. 断点续传仅支持 IndexedDB 存储
