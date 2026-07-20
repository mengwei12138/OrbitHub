import styles from '../../style.module.css';

type ValueItem = {
  title: string;
  description: string;
};

const VALUE_ITEMS: ValueItem[] = [
  {
    title: '提升效率',
    description: '减少账号切换、流程断点与内容重复劳动，让团队把时间集中在策略和增长上。',
  },
  {
    title: '强化协同',
    description: '让账号管理、内容生产、发布执行和运营复盘共享同一套上下文与状态。',
  },
  {
    title: '驱动增长',
    description: '用可追踪的数据结果反哺选题、发布与互动，形成稳定的运营优化闭环。',
  },
];

const ValueSection = () => {
  return (
    <section id="value" className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionEyebrow}>业务价值</span>
        <h2 className={styles.sectionTitle}>让矩阵运营从分散执行转向系统化增长</h2>
      </div>

      <div className={styles.valueGrid}>
        {VALUE_ITEMS.map((item) => (
          <article key={item.title} className={styles.valueItem}>
            <h3 className={styles.valueTitle}>{item.title}</h3>
            <p className={styles.valueDescription}>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ValueSection;
