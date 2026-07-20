import { RightOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import type { CSSProperties, FC, KeyboardEvent, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './style.module.css';

type FeatureCardProps = {
  title: string;
  description: string;
  icon: ReactElement;
  badge: string;
  path: string;
  color: string;
  gradient: string;
  shadow: string;
  badgeBg: string;
  disabled?: boolean;
  badgeCount?: number;
  badgeCountLabel?: string;
  bgImageUrl?: string;
};

const formatBadgeCount = (value: number): string => {
  if (value > 99) return '99+';
  return String(value);
};

const FeatureCard: FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  badge,
  path,
  color,
  gradient,
  shadow,
  badgeBg,
  disabled = false,
  badgeCount,
  badgeCountLabel,
  bgImageUrl,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (disabled) return;
    navigate(path);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigate(path);
    }
  };

  const iconStyle: CSSProperties = {
    background: `${color}14`,
    boxShadow: shadow,
  };

  const badgeStyle: CSSProperties = {
    background: badgeBg,
    color: color,
  };

  const cardStyle: CSSProperties = {
    background: bgImageUrl
      ? `url(${bgImageUrl}) right / cover no-repeat, ${gradient}`
      : gradient,
  };

  const showCountBadge = typeof badgeCount === 'number' && badgeCount > 0;
  const linkText = disabled ? '即将开放' : '进入功能';

  return (
    <div
      className={classNames(styles.card, { [styles.disabled]: disabled })}
      style={cardStyle}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={title}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {!bgImageUrl && (
        <>
          <div className={styles.dotPattern} />
          <div className={styles.curveDecor} />
        </>
      )}

      {showCountBadge && (
        <span
          className={styles.countBadge}
          style={{ background: color }}
          aria-label={badgeCountLabel ?? `${badgeCount}`}
        >
          {formatBadgeCount(badgeCount as number)}
        </span>
      )}

      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.iconBox} style={iconStyle}>
            {icon}
          </div>
          <div className={styles.titleBlock}>
            <h3 className={styles.title}>{title}</h3>
            <span className={styles.badge} style={badgeStyle}>
              {badge}
            </span>
          </div>
        </div>

        <p className={styles.description}>{description}</p>

        <div className={styles.spacer} />

        <div className={styles.action}>
          <span
            className={styles.link}
            style={{ color: disabled ? undefined : color }}
          >
            {linkText}
            <RightOutlined />
          </span>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
export type { FeatureCardProps };
