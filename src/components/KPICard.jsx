import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

function KPICard({ title, value, currency, unit, icon: IconComponent, trend, trendLabel, color = 'green' }) {
  const [displayValue, setDisplayValue] = useState(typeof value === 'string' ? value : 0);

  // animate number on value change (simple ease)
  useEffect(() => {
    // If value is a string (formatted), don't animate
    if (typeof value === 'string') {
      setDisplayValue(value);
      return;
    }
    
    let raf;
    const duration = 600;
    const start = performance.now();
    const from = Number(displayValue) || 0;
    const to = Number(value) || 0;

    function step(ts) {
      const t = Math.min(1, (ts - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(from + (to - from) * eased);
      setDisplayValue(current);
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const formatValue = (val) => {
    // If already formatted string, return as is
    if (typeof val === 'string') return val;
    
    if (currency) {
      return currency === 'PKR'
        ? `PKR ${(val / 1000000).toFixed(2)}M`
        : `$${(val / 1000).toFixed(2)}K`;
    }
    if (unit) {
      return `${(val / 1000).toFixed(1)}K ${unit}`;
    }
    return Number(val).toLocaleString();
  };

  const colorClasses = {
    green: 'bg-gradient-to-br from-green-50 to-green-100 text-green-700',
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700',
    red: 'bg-gradient-to-br from-red-50 to-red-100 text-red-700',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700',
  };

  return (
    <div className="card hover:shadow-xl transition-shadow transform hover:-translate-y-1 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-600">{title}</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-2 tracking-tight break-words">{formatValue(displayValue)}</p>
          {trend !== undefined && (
            <div className="flex items-center mt-2 flex-wrap">
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1 flex-shrink-0" />
              )}
              <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend)}%
              </span>
              <span className="text-sm text-gray-500 ml-2">{trendLabel}</span>
            </div>
          )}
        </div>
        <div className={clsx('p-3 rounded-2xl shadow-inner flex items-center justify-center flex-shrink-0', colorClasses[color])} style={{ minWidth: 56, minHeight: 56 }}>
          <div className="transform transition-transform duration-500 hover:rotate-6">
            {IconComponent && <IconComponent className="w-6 h-6" />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default KPICard;