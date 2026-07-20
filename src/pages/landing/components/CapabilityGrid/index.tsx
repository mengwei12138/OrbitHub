import ContentGenerationIcon from '@/images/menu-icons/icon-content-generation.svg';
import ContentIcon from '@/images/menu-icons/icon-content.svg';
import DataCenterIcon from '@/images/menu-icons/icon-datacenter.svg';
import AccountIcon from '@/images/menu-icons/icon-account.svg';
import styles from '../../style.module.css';

type Capability = {
  title: string;
  description: string;
  icon: string;
};

const CAPABILITIES: Capability[] = [
  {
    title: '账号矩阵管理',
    description: '统一纳管多平台账号、成员归属、账号状态与运营分工，让矩阵协同清晰可控。',
    icon: AccountIcon,
  },
  {
    title: '内容生成',
    description: '支持图文与视频生成、AI 优化与素材沉淀，加速内容策划到成稿的生产效率。',
    icon: ContentGenerationIcon,
  },
  {
    title: '内容发布',
    description: '覆盖多账号发布、记录追踪、重发布与执行回看，稳定承接日常分发流程。',
    icon: ContentIcon,
  },
  {
    title: '数据分析',
    description: '围绕账号趋势、内容表现、预警信号与复盘结果，持续驱动运营策略优化。',
    icon: DataCenterIcon,
  },
];

const CapabilityGrid = () => {
  return (
    <section id="capabilities" className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionEyebrow}>产品能力</span>
        <h2 className={styles.sectionTitle}>围绕矩阵运营搭建完整的业务能力底座</h2>
        <p className={styles.sectionDescription}>
          从账号接入到内容增长，每一个关键环节都在同一工作台中连续衔接。
        </p>
      </div>

      <div className={styles.capabilityGrid}>
        {CAPABILITIES.map((item) => (
          <article key={item.title} className={styles.capabilityItem}>
            <div className={styles.capabilityIconWrap}>
              <img src={item.icon} alt="" className={styles.capabilityIcon} />
            </div>
            <h3 className={styles.capabilityTitle}>{item.title}</h3>
            <p className={styles.capabilityDescription}>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CapabilityGrid;
