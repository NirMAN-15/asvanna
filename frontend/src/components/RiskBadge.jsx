import React from 'react';

export default function RiskBadge({ level }) {
  if (level === 'OVER_PLANTED') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
        🔴 Over-Planted
      </span>
    );
  }
  if (level === 'WARNING') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
        🟡 At Risk
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
      🟢 Safe
    </span>
  );
}
