import styles from '../../style.module.css';

type WorkflowStep = {
  title: string;
  description: string;
};

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    title: '账号接入',
    description: '统一管理账号归属、状态、成员协同与矩阵结构。',
  },
  {
    title: '内容生产',
    description: '结合 AI 与素材库加快选题、图文和视频的内容生成。',
  },
  {
    title: '发布分发',
    description: '按账号计划稳定执行发布任务并追踪流转状态。',
  },
  {
    title: '数据复盘',
    description: '汇总内容表现、账号趋势与异常预警，形成复盘依据。',
  },
  {
    title: '策略优化',
    description: '把分析结果回流到后续选题、发布节奏和互动策略。',
  },
];

const WorkflowSection = () => {
  return (
    <section id="solutions" className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionEyebrow}>全链路流程</span>
        <h2 className={styles.sectionTitle}>把内容运营拆成可协同、可追踪、可复盘的连续流程</h2>
      </div>

      <div className={styles.workflowRail}>
        {WORKFLOW_STEPS.map((item, index) => (
          <article key={item.title} className={styles.workflowStep}>
            <span className={styles.workflowIndex}>{`0${index + 1}`}</span>
            <h3 className={styles.workflowTitle}>{item.title}</h3>
            <p className={styles.workflowDescription}>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default WorkflowSection;
