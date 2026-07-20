import { Button } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { CountdownButtonProps } from './types';

const DEFAULT_TEXT = '获取验证码';
const DEFAULT_DURATION = 60;

const CountdownButton = (props: CountdownButtonProps) => {
  const {
    buttonText = DEFAULT_TEXT,
    duration = DEFAULT_DURATION,
    onClick,
    disabled = false,
    variant,
    className,
    style,
    ...rest
  } = props;

  const buttonVariant: 'default' | 'primary' = (variant ?? 'default') as
    | 'default'
    | 'primary';
  const [countdown, setCountdown] = useState<number>(0);
  const [internalLoading, setInternalLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isCounting = countdown > 0;

  const startCountdown = useCallback((seconds: number) => {
    setCountdown(seconds);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return clearTimer;
  }, [countdown, clearTimer]);

  const handleClick = useCallback(async () => {
    if (isCounting || disabled || internalLoading) {
      return;
    }

    setInternalLoading(true);
    try {
      let countdownSeconds: number | null = null;
      if (onClick) {
        const result = await onClick();
        if (typeof result === 'number' && result > 0) {
          countdownSeconds = result;
        } else if (result === true) {
          countdownSeconds = duration;
        }
      } else {
        countdownSeconds = duration;
      }

      if (countdownSeconds != null) {
        startCountdown(countdownSeconds);
      }
    } finally {
      setInternalLoading(false);
    }
  }, [
    isCounting,
    disabled,
    internalLoading,
    onClick,
    startCountdown,
    duration,
  ]);

  const displayText = isCounting ? `${countdown}s` : buttonText;
  const isDisabled = isCounting || disabled;
  const loading = internalLoading && !isCounting;

  return (
    <Button
      type={buttonVariant === 'primary' ? 'primary' : 'default'}
      disabled={isDisabled}
      loading={loading}
      onClick={handleClick}
      className={className}
      style={style}
      {...rest}
    >
      {displayText}
    </Button>
  );
};

export default CountdownButton;

export type { CountdownButtonProps };
export { DEFAULT_DURATION, DEFAULT_TEXT };
