/**
 * Figma Design System Variables - 数据中心模块
 * 从 Figma 设计稿自动生成
 *
 * Figma 链接: https://www.figma.com/design/h0gT5MlFnxNOmOIQVd1thT/
 * Node ID: 1236-1144 (数据中心-UI设计稿)
 */

import {
  FIGMA_COLOR_ERROR,
  FIGMA_COLOR_SUCCESS,
  FIGMA_COLOR_WARNING,
  FIGMA_RADIUS_LG,
  FIGMA_RADIUS_MD,
  FIGMA_RADIUS_SM,
  FIGMA_SHADOW_CARD,
} from '@/styles/common/vars';

/* ===== 预警等级颜色 ===== */
/* 复用 common/vars.ts */
export const FIGMA_DATACENTER_COLOR_ALERT_RED = FIGMA_COLOR_ERROR;
export const FIGMA_DATACENTER_COLOR_ALERT_ORANGE = FIGMA_COLOR_WARNING;
export const FIGMA_DATACENTER_COLOR_ALERT_GREEN = FIGMA_COLOR_SUCCESS;

/* ===== 预警等级映射 ===== */
/* API WarningLevel (HIGH/MEDIUM/NORMAL) -> UI WarningLevel (red/orange/green/gray)
 * HIGH=高风险🔴（账号无法正常使用）-> red
 * MEDIUM=中风险🟠（数据异常）-> orange
 * NORMAL=正常🟢 -> green
 */
export const WARNING_LEVEL_MAP: Record<string, string> = {
  HIGH: 'red',
  MEDIUM: 'orange',
  NORMAL: 'green',
  red: 'red',
  orange: 'orange',
  green: 'green',
  UNKNOWN: 'gray',
} as const;

/* ===== KPI 指标卡图标背景 ===== */
/* 自定义颜色，直接定义值 */
export const FIGMA_DATACENTER_COLOR_KPI_PLAY_BG = '#E6F7FF';
export const FIGMA_DATACENTER_COLOR_KPI_LIKE_BG = '#FFF1F0';
export const FIGMA_DATACENTER_COLOR_KPI_COMMENT_BG = '#FFF7E6';
export const FIGMA_DATACENTER_COLOR_KPI_SHARE_BG = '#F4FFB8';
export const FIGMA_DATACENTER_COLOR_KPI_FOLLOWER_BG = '#F9F0FF';
export const FIGMA_DATACENTER_COLOR_KPI_DM_BG = '#E6FFF9';

/* ===== 增长率颜色 ===== */
export const FIGMA_DATACENTER_COLOR_GROWTH_UP = FIGMA_COLOR_SUCCESS;
export const FIGMA_DATACENTER_COLOR_GROWTH_DOWN = FIGMA_COLOR_ERROR;

/* ===== 平台标签 ===== */
export const FIGMA_DATACENTER_COLOR_PLATFORM_DOUYIN_BG = '#EFFCFF';
export const FIGMA_DATACENTER_COLOR_PLATFORM_DOUYIN_TEXT = '#00D1FF';
export const FIGMA_DATACENTER_COLOR_PLATFORM_XIAOHONGSHU_BG = '#FFF2F0';
export const FIGMA_DATACENTER_COLOR_PLATFORM_XIAOHONGSHU_TEXT = '#FF7A45';

/* ===== 阴影 ===== */
export const FIGMA_DATACENTER_SHADOW_CARD = FIGMA_SHADOW_CARD;

/* ===== 圆角 ===== */
export const FIGMA_DATACENTER_BORDER_RADIUS_SM = FIGMA_RADIUS_SM;
export const FIGMA_DATACENTER_BORDER_RADIUS_MD = FIGMA_RADIUS_MD;
export const FIGMA_DATACENTER_BORDER_RADIUS_LG = FIGMA_RADIUS_LG;
