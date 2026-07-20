/**
 * 套餐（package）相关类型定义。对应后端 admin-api.yaml 1.4.0。
 *
 * PRD §1.3 套餐固定为 3 档：标准版(id=1)/专业版(id=2)/企业版(id=3)，由后端 V6003 种子写死。
 */

export type PackageResponse = {
  /** 大整数字符串 */
  id: string;
  name: string;
  /** V2.0 评审原型展示套餐管理员席位；正式契约以后端为准。 */
  normalAdminLimit?: number;
  socialAccountLimit: number;
  points: number;
  enabled?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PagePackageResponseData = {
  list: PackageResponse[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};
