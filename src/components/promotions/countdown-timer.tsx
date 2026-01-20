'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface CountdownTimerProps {
  expiresAt: Date | string;
  onExpired?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'large';
  showLabels?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({
  expiresAt,
  onExpired,
  className,
  variant = 'default',
  showLabels = true,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft | null => {
      const targetDate = new Date(expiresAt);
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    const updateTimer = () => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (!remaining && !isExpired) {
        setIsExpired(true);
        onExpired?.();
      }
    };

    // Initial calculation
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, isExpired, onExpired]);

  if (isExpired || !timeLeft) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-red-700',
          className
        )}
      >
        <ClockIcon className="h-4 w-4" />
        <span className="font-medium">Offer Expired</span>
      </div>
    );
  }

  const isUrgent =
    timeLeft.days === 0 && timeLeft.hours < 24;

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
          isUrgent
            ? 'bg-orange-100 text-orange-700'
            : 'bg-primary/10 text-primary',
          className
        )}
      >
        <ClockIcon className="h-3.5 w-3.5" />
        {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
        <span>
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }

  if (variant === 'large') {
    return (
      <div className={cn('text-center', className)}>
        <p className="mb-3 text-sm font-medium text-muted-foreground">
          Offer expires in
        </p>
        <div className="flex items-center justify-center gap-3">
          <TimeBlock value={timeLeft.days} label="Days" isUrgent={isUrgent} />
          <span className="text-2xl font-bold text-muted-foreground">:</span>
          <TimeBlock value={timeLeft.hours} label="Hours" isUrgent={isUrgent} />
          <span className="text-2xl font-bold text-muted-foreground">:</span>
          <TimeBlock value={timeLeft.minutes} label="Mins" isUrgent={isUrgent} />
          <span className="text-2xl font-bold text-muted-foreground">:</span>
          <TimeBlock value={timeLeft.seconds} label="Secs" isUrgent={isUrgent} />
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3',
        isUrgent
          ? 'border-orange-200 bg-orange-50'
          : 'border-primary/20 bg-primary/5',
        className
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full',
          isUrgent ? 'bg-orange-100' : 'bg-primary/10'
        )}
      >
        <ClockIcon
          className={cn(
            'h-5 w-5',
            isUrgent ? 'text-orange-600' : 'text-primary'
          )}
        />
      </div>

      <div className="flex-1">
        <p
          className={cn(
            'text-sm font-medium',
            isUrgent ? 'text-orange-700' : 'text-foreground'
          )}
        >
          {isUrgent ? 'Hurry! Offer expires soon' : 'Time remaining'}
        </p>
        <div className="mt-1 flex items-center gap-2 font-mono text-lg font-bold">
          {timeLeft.days > 0 && (
            <>
              <span className={isUrgent ? 'text-orange-700' : 'text-primary'}>
                {timeLeft.days}
              </span>
              {showLabels && (
                <span className="text-xs font-normal text-muted-foreground">
                  day{timeLeft.days !== 1 ? 's' : ''}
                </span>
              )}
            </>
          )}
          <span className={isUrgent ? 'text-orange-700' : 'text-primary'}>
            {String(timeLeft.hours).padStart(2, '0')}:
            {String(timeLeft.minutes).padStart(2, '0')}:
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
}

interface TimeBlockProps {
  value: number;
  label: string;
  isUrgent: boolean;
}

function TimeBlock({ value, label, isUrgent }: TimeBlockProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'flex h-16 w-16 items-center justify-center rounded-lg text-2xl font-bold',
          isUrgent
            ? 'bg-orange-100 text-orange-700'
            : 'bg-primary/10 text-primary'
        )}
      >
        {String(value).padStart(2, '0')}
      </div>
      <span className="mt-1 text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        d="M12 6v6l4 2M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
