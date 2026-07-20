import type React from 'react';
import { CustomTable } from '@/components';

import styles from './style.module.css';

const VIDEO_RATE_COLUMNS = [
  { duration: '5 秒', standard: 125, premium: 150, virtualHuman: '+100' },
  { duration: '8 秒', standard: 200, premium: 240, virtualHuman: '+100' },
  { duration: '10 秒', standard: 250, premium: 300, virtualHuman: '+100' },
  { duration: '15 秒', standard: 375, premium: 450, virtualHuman: '+100' },
];

const PointsRulesSection: React.FC = () => {
  const columns = [
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 140,
    },
    {
      title: '标准质量',
      dataIndex: 'standard',
      key: 'standard',
      width: 140,
    },
    {
      title: '高级质量',
      dataIndex: 'premium',
      key: 'premium',
      width: 140,
    },
    {
      title: '虚拟人物附加',
      dataIndex: 'virtualHuman',
      key: 'virtualHuman',
      width: 140,
    },
  ];

  return (
    <section className={styles.rulesSection}>
      <h3 className={styles.sectionTitle}>积分消耗规则速查</h3>
      <div className={styles.rulesCard}>
        <div className={styles.ruleCategory}>
          <span className={styles.ruleTag}>视频生成</span>
          <div className={styles.tableWrapper}>
            <CustomTable
              rowKey="duration"
              dataSource={VIDEO_RATE_COLUMNS}
              columns={columns}
              pagination={false}
            />
          </div>
        </div>

        <div className={styles.ruleCategoryInline}>
          <span className={styles.ruleTag}>图文生成</span>
          <span className={styles.fixedRule}>固定 50 积分 / 次</span>
        </div>
      </div>
    </section>
  );
};

export default PointsRulesSection;
