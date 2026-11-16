import React from 'react';
import { MembershipStatus } from '../types';
import { ShieldCheck, Clock, XCircle, AlertTriangle, Award } from 'lucide-react';

interface MembershipStatusBadgeProps {
  status: MembershipStatus;
  size?: 'sm' | 'md';
}

export const MembershipStatusBadge: React.FC<MembershipStatusBadgeProps> = ({
  status,
  size = 'sm',
}) => {
  const config: Record<
    MembershipStatus,
    { label: string; icon: React.ReactNode; classes: string }
  > = {
    active: {
      label: 'Active',
      icon: <ShieldCheck className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
      classes: 'text-emerald-400 border-emerald-500/35 bg-emerald-950/40',
    },
    pending: {
      label: 'Pending',
      icon: <Clock className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
      classes: 'text-amber-300 border-amber-500/35 bg-amber-950/40',
    },
    rejected: {
      label: 'Rejected',
      icon: <XCircle className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
      classes: 'text-rose-400 border-rose-500/35 bg-rose-950/40',
    },
    suspended: {
      label: 'Suspended',
      icon: <AlertTriangle className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
      classes: 'text-orange-400 border-orange-500/35 bg-orange-950/40',
    },
    alumni: {
      label: 'Alumni',
      icon: <Award className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />,
      classes: 'text-sky-400 border-sky-500/35 bg-sky-950/40',
    },
  };

  const current = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border font-semibold whitespace-nowrap ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      } ${current.classes}`}
    >
      {current.icon}
      <span>{current.label}</span>
    </span>
  );
};
