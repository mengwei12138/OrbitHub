import { useQuery } from '@tanstack/react-query';
import { Button, Modal } from 'antd';
import type React from 'react';
import { balanceQueryOptions } from '@/services/admin-proxy';

import styles from './style.module.css';

/**
 * PRD §4.2 顶部"积分池余额"卡片：本公司视角，无需 tenantId（TENANT_ADMIN 后端自动收敛）。
 *
 * - 总剩余 = balance.totalPoints
 * - 套餐积分 = balance.packagePoints（后端从 tenant→package 取的固定值；
 *   不再用 totalPoints+totalConsume−totalRecharge 反推——上游退款只回填 totalPoints/totalRefund，
 *   反推会把退款误算进套餐积分）
 * - 充值积分 = totalRecharge（上游已为真实充值净值，无需再减退款）
 * - 免费次数：freeVideoUsed / freeVideoRemaining
 */
const PointsBalanceSection: React.FC = () => {
  const { data: balance, isLoading } = useQuery(balanceQueryOptions(undefined));

  const totalRemaining = balance?.totalPoints ?? 0;
  const packageCredits = balance?.packagePoints ?? 0;
  const rechargeCredits = balance?.totalRecharge ?? 0;
  const freeUsed = balance?.freeVideoUsed ?? 0;
  const freeRemaining = balance?.freeVideoRemaining ?? 0;
  const freeTotal = freeUsed + freeRemaining;
  return (
    <section className={styles.balanceSection}>
      <h3 className={styles.sectionTitle}>积分池余额</h3>
      <div className={styles.balanceCards}>
        <div className={styles.balanceCard}>
          <div className={styles.cardIcon}>
            <svg
              fill="none"
              height="120"
              viewBox="0 0 120 120"
              width="120"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
            >
              <circle cx="60" cy="60" fill="#E8F2FF" r="60"></circle>
              <circle
                cx="60"
                cy="60"
                fill="#1677FF"
                opacity="0.1"
                r="40"
              ></circle>
            </svg>
          </div>
          <div className={styles.cardLabel}>总剩余积分</div>
          <div className={styles.cardValue}>
            <span className={styles.bigNumber}>
              {isLoading ? '加载中…' : totalRemaining.toLocaleString()}
            </span>
            <span className={styles.unit}>积分</span>
          </div>
          <div className={styles.cardDivider}></div>
          <div className={styles.breakdown}>
            <span className={styles.breakdownLabel}>套餐积分</span>
            <span className={styles.breakdownValue}>
              {packageCredits.toLocaleString()}
            </span>
            <span className={styles.breakdownDivider}></span>
            <span className={styles.breakdownLabel}>充值积分</span>
            <span className={styles.breakdownValue}>
              {rechargeCredits.toLocaleString()}
            </span>
            <span className={styles.tip}>
              <svg
                fill="none"
                height="14"
                viewBox="0 0 14 14"
                width="14"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
              >
                <path
                  d="M7 0C3.134 0 0 3.134 0 7s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 12.5c-3.032 0-5.5-2.468-5.5-5.5S3.968 1.5 7 1.5s5.5 2.468 5.5 5.5-2.468 5.5-5.5 5.5z"
                  fill="#8C8C8C"
                ></path>
                <path
                  d="M7 3.25C6.586 3.25 6.25 3.586 6.25 4v.5c0 .414.336.75.75.75s.75-.336.75-.75v-.5c0-.414-.336-.75-.75-.75z"
                  fill="#8C8C8C"
                ></path>
                <path
                  d="M7 6.25c-.414 0-.75.336-.75.75v2.5c0 .414.336.75.75.75s.75-.336.75-.75V7c0-.414-.336-.75-.75-.75z"
                  fill="#8C8C8C"
                ></path>
              </svg>
              <span>如需充值，请联系销售或超级管理员</span>
            </span>
          </div>
        </div>

        <div className={styles.freeCard}>
          <svg
            className={styles.freeCardBg}
            fill="none"
            viewBox="0 0 360 210"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <path
              d="M360 0C360 70.1054 303.825 147.105 230.105 160.105C156.385 173.105 70 140 0 105V210H360V0Z"
              fill="url(#paint0_linear)"
              opacity="0.3"
            />
            <defs>
              <linearGradient
                gradientUnits="userSpaceOnUse"
                id="paint0_linear"
                x1="0"
                x2="360"
                y1="0"
                y2="210"
              >
                <stop stopColor="#FFA900" />
                <stop offset="1" stopColor="#FFD780" />
              </linearGradient>
            </defs>
          </svg>
          <div className={styles.cardLabel}>剩余免费次数</div>
          <div className={styles.freeTimesValue}>
            <span className={styles.bigNumber}>{freeRemaining}</span>
            <span className={styles.freeTimesTotal}>/ {freeTotal}</span>
          </div>
          <div className={styles.freeTimesTip}>全公司共享</div>
          <div style={{ marginTop: 10, color: '#8c8c8c', fontSize: 13 }}>
            当前套餐：专业版
          </div>
          <Button
            size="small"
            style={{ marginTop: 8 }}
            onClick={() => {
              Modal.info({
                title: '联系平台',
                content:
                  '套餐升级、降级或额度调整请联系平台超级管理员。本原型不提供租户侧套餐变更申请和审批流。',
              });
            }}
          >
            联系平台
          </Button>
          <div className={styles.dotsIcon}>
            <svg
              fill="none"
              height="16"
              viewBox="0 0 16 16"
              width="16"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
            >
              <circle cx="4" cy="4" fill="#FAAD14" r="2"></circle>
              <circle cx="8" cy="4" fill="#FAAD14" r="2"></circle>
              <circle cx="12" cy="4" fill="#FAAD14" r="2"></circle>
              <circle cx="4" cy="8" fill="#FAAD14" r="2"></circle>
              <circle cx="8" cy="8" fill="#FAAD14" r="2"></circle>
              <circle cx="12" cy="8" fill="#FAAD14" r="2"></circle>
              <circle cx="4" cy="12" fill="#FAAD14" r="2"></circle>
              <circle cx="8" cy="12" fill="#FAAD14" r="2"></circle>
              <circle cx="12" cy="12" fill="#FAAD14" r="2"></circle>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PointsBalanceSection;
