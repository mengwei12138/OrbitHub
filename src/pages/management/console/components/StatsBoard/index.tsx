import styles from './style.module.css';

export interface StatItem {
  value: number | string;
  label: string;
  delta?: string;
}

export interface StatsBoardProps {
  stats: StatItem[];
}

const StatCard: React.FC<StatItem> = ({ value, label, delta }) => (
  <div className={styles.statCard}>
    <div className={styles.statLeft}>
      <div className={styles.statIcon}>
        <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M11 2L13.39 8.26L20 9.27L15 14.14L16.18 21.02L11 17.77L5.82 21.02L7 14.14L2 9.27L8.61 8.26L11 2Z"
            fill="white"
          />
        </svg>
      </div>
      <div className={styles.statInfo}>
        <span className={styles.statLabel}>{label}</span>
        {delta && <span className={styles.statDelta}>{delta}</span>}
      </div>
    </div>
    <div className={styles.statValue}>{value}</div>
  </div>
);

const StatsBoard: React.FC<StatsBoardProps> = ({ stats }) => (
  <div className={styles.statsRow}>
    {stats.map((stat) => (
      <StatCard key={stat.label} {...stat} />
    ))}
  </div>
);

export default StatsBoard;
