import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'emerald' }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    red: 'bg-rose-50 text-rose-600 border-rose-200',
    blue: 'bg-sky-50 text-sky-600 border-sky-200'
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3.5 rounded-xl border ${colorMap[color] || colorMap.emerald}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
