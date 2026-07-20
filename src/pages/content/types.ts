/**
 * 内容生成 → 内容发布跳转 location.state 契约。
 *
 * <p>由 OpenSpec change `content-generation-publish-bridge` 改造：</p>
 *
 * <ul>
 *   <li>「内容发布」模块**不再接收外部 24h 直链**。所有入口（生成成功路径 / 我的作品 / 作品详情）
 *       都必须先经后端 ingest 把产物落到本地 `MediaAsset`，再把 `mediaAssetId` 透过 route state
 *       传给发布页。发布页拿 id 直接渲染预览，零外部访问。</li>
 *   <li>缺失 `videoMediaAssetId` / `imageMediaAssetIds` 时，入口侧负责屏蔽「去发布」按钮 + 提示
 *       「素材尚未就绪」，发布页本身不再做 url-proxy 回退。</li>
 * </ul>
 *
 * <p>历史字段 `videoUrl` / `imageUrls` 已删除（uploadFromUrl 路径同步移除）。</p>
 */
export type PublishPrefillState = {
  contentMode: 'VIDEO' | 'IMAGE';
  title?: string;
  content?: string;
  tags?: string[];
  /**
   * 已 ingest 的本地 mediaAssetId（视频通常只有 1 个）。
   * 类型为 string：后端 Jackson 把 Long 序列化成字符串（防 JS Number 失精度），
   * 全链路统一按 string 流转，避免在「我的作品 / 状态接口 / 发布页」之间反复转型。
   */
  videoMediaAssetId?: string;
  /** 已 ingest 的本地 mediaAssetId 列表（图文可能多张）。 */
  imageMediaAssetIds?: string[];
};
