import { PageHeader } from '@/components';
import ConsumptionDetailSection from './components/ConsumptionDetailSection';
import PointsBalanceSection from './components/PointsBalanceSection';
import PointsRulesSection from './components/PointsRulesSection';

import styles from './style.module.css';

const PointsConsumption: React.FC = () => {
  return (
    <div className={styles.container}>
      <PageHeader title="积分与消耗" />
      <PointsBalanceSection />
      <PointsRulesSection />
      <ConsumptionDetailSection />
    </div>
  );
};

export default PointsConsumption;
