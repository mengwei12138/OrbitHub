import { useNavigate } from 'react-router-dom';
import logoIcon from '@/images/logo-icon.svg';

import styles from './style.module.css';

interface LayoutLogoProps {
  collapsed?: boolean;
}

export default function LayoutLogo({ collapsed }: LayoutLogoProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className={styles.wrapper} onClick={handleClick}>
      <div className={styles.iconBg}>
        <img src={logoIcon} alt="logo" width={18} height={18} />
      </div>
      {!collapsed && <span className={styles.text}>矩阵管理</span>}
    </div>
  );
}
