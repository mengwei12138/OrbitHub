import type {
  PublishExtensionCandidate,
  PublishExtensionType,
} from './types';

export const EXTENSION_TYPE_LABEL: Record<PublishExtensionType, string> = {
  location: '位置',
  deal: '团购',
};

const locationCandidates: PublishExtensionCandidate[] = [
  {
    id: 'poi-cd-001',
    type: 'location',
    name: '成都矩阵酒店·春熙路店',
    description: '成都市锦江区春熙路 88 号',
    sourceLabel: '抖音 POI',
    meta: '距离门店 0.3km｜可挂载',
  },
  {
    id: 'poi-cd-002',
    type: 'location',
    name: '成都矩阵酒店·环球中心店',
    description: '成都市高新区天府大道北段 1700 号',
    sourceLabel: '抖音 POI',
    meta: '企业认领门店｜可挂载',
  },
  {
    id: 'poi-cq-001',
    type: 'location',
    name: '重庆解放碑矩阵酒店',
    description: '重庆市渝中区民族路 101 号',
    sourceLabel: '抖音 POI',
    meta: '跨城门店｜可挂载',
  },
  {
    id: 'poi-cd-003',
    type: 'location',
    name: '成都矩阵会客厅',
    description: '成都市武侯区人民南路四段 9 号',
    sourceLabel: '抖音 POI',
    meta: '商务场景｜可挂载',
  },
  {
    id: 'poi-cd-004',
    type: 'location',
    name: '矩阵生活集合店',
    description: '成都市成华区建设路 55 号',
    sourceLabel: '抖音 POI',
    meta: '生活方式门店｜可挂载',
  },
  {
    id: 'poi-fail-001',
    type: 'location',
    name: '成都矩阵酒店·待认领门店',
    description: '成都市青羊区蜀都大道 18 号',
    sourceLabel: '抖音 POI',
    meta: '未完成企业认领｜预挂载会失败',
    shouldFail: true,
  },
];

const dealCandidates: PublishExtensionCandidate[] = [
  {
    id: 'deal-001',
    type: 'deal',
    name: '双人早餐券',
    description: '门店价 68 元｜有效期 30 天',
    sourceLabel: '抖音团购',
    meta: '库存充足｜可挂载',
  },
  {
    id: 'deal-002',
    type: 'deal',
    name: '周末房型套餐',
    description: '399 元起｜含双早与延迟退房',
    sourceLabel: '抖音团购',
    meta: '适合视频推广｜可挂载',
  },
  {
    id: 'deal-003',
    type: 'deal',
    name: '下午茶双人券',
    description: '98 元｜工作日通用',
    sourceLabel: '抖音团购',
    meta: '新品活动｜可挂载',
  },
  {
    id: 'deal-004',
    type: 'deal',
    name: '探店达人专享券',
    description: '满 200 减 40｜达人视频专用',
    sourceLabel: '抖音团购',
    meta: '达人内容可用｜可挂载',
  },
  {
    id: 'deal-005',
    type: 'deal',
    name: '亲子房限时套餐',
    description: '599 元｜含儿童早餐',
    sourceLabel: '抖音团购',
    meta: '暑期活动｜可挂载',
  },
];

export const getCrawledExtensionTags = (): PublishExtensionType[] => {
  const tags: PublishExtensionType[] = [];
  if (locationCandidates.length > 0) tags.push('location');
  if (dealCandidates.length > 0) tags.push('deal');
  return tags;
};

export const getExtensionCandidates = (
  type: PublishExtensionType,
  keyword: string,
) => {
  const source = type === 'location' ? locationCandidates : dealCandidates;
  const trimmed = keyword.trim().toLowerCase();
  if (!trimmed) return source;
  return source.filter((item) => {
    return [item.name, item.description, item.meta]
      .join(' ')
      .toLowerCase()
      .includes(trimmed);
  });
};
