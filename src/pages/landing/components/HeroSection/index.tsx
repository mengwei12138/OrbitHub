import { Button } from 'antd';
import styles from '../../style.module.css';

type HeroSectionProps = {
  onLogin: () => void;
  onEnterWorkspace: () => void;
};

const METRICS = [
  { value: '多平台', label: '账号矩阵统一纳管' },
  { value: 'AI', label: '内容生产提效' },
  { value: 'Data', label: '运营结果持续复盘' },
];

const HeroSection = ({
  onLogin,
  onEnterWorkspace,
}: HeroSectionProps) => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroCopy}>
        <span className={styles.sectionEyebrow}>账号矩阵增长引擎</span>
        <h1 className={styles.heroTitle}>让账号矩阵、内容生产与数据增长在同一平台协同运行</h1>
        <p className={styles.heroDescription}>
          面向矩阵化运营团队，统一承接账号管理、内容生成、发布分发、互动运营与数据分析，形成从生产到复盘的全链路工作流。
        </p>
        <div className={styles.heroActions}>
          <Button type="primary" size="large" onClick={onLogin}>
            立即登录
          </Button>
          <Button size="large" onClick={onEnterWorkspace}>
            进入工作台
          </Button>
        </div>
        <div className={styles.heroMetrics}>
          {METRICS.map((item) => (
            <div key={item.label} className={styles.metricItem}>
              <strong className={styles.metricValue}>{item.value}</strong>
              <span className={styles.metricLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.heroVisual} aria-hidden="true">
        <div className={styles.visualGlow} />
        <div className={styles.visualOrbit}>
          <div className={styles.visualNodePrimary}>账号矩阵</div>
          <div className={styles.visualNode}>内容生成</div>
          <div className={styles.visualNode}>发布分发</div>
          <div className={styles.visualNode}>数据复盘</div>
        </div>
        <div className={styles.visualPanels}>
          <div className={styles.visualPanel}>
            <span className={styles.visualPanelLabel}>账号分层</span>
            <div className={styles.visualBars}>
              <span className={styles.barStrong} />
              <span className={styles.barMedium} />
              <span className={styles.barWeak} />
            </div>
          </div>
          <div className={styles.visualPanel}>
            <span className={styles.visualPanelLabel}>内容流转</span>
            <div className={styles.visualFlowLine}>
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className={styles.visualPanel}>
            <span className={styles.visualPanelLabel}>增长信号</span>
            <div className={styles.visualTrend}>
              <span />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
