import React from 'react';
import * as ReactWindow from 'react-window';

function formatCurrency(value, currency) {
  if (value === undefined || value === null) return '-';
  if (currency === 'PKR') return value.toLocaleString();
  // assume USD fields are already separate in the data; caller should supply correct field
  return value.toLocaleString();
}

export default function VirtualizedCommodityTable({ data = [], currency = 'PKR', totalVolume = 0 }) {
  const Row = ({ index, style }) => {
    const item = data[index];
    return (
      <div
        style={style}
        className={`flex items-center px-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b`}
      >
        <div className="w-2/5 font-medium text-sm truncate">{item.commodity}</div>
        <div className="w-1/5 text-sm text-green-700">{formatCurrency(item.ExportsPKR, currency)}</div>
        <div className="w-1/5 text-sm text-blue-700">{formatCurrency(item.ImportsPKR, currency)}</div>
        <div className="w-1/6 text-sm">{(item.Volume || 0).toLocaleString()}</div>
        <div className="w-1/6 text-sm text-gray-600">{totalVolume ? ((item.Volume / totalVolume) * 100).toFixed(1) : '0.0'}%</div>
      </div>
    );
  };

  const height = Math.min(360, data.length * 48 + 48);

  return (
    <div className="rounded-lg border shadow bg-white">
      <div className="flex items-center px-4 py-3 bg-gray-50 border-b font-medium text-gray-700">
        <div className="w-2/5">Commodity</div>
        <div className="w-1/5">Exports</div>
        <div className="w-1/5">Imports</div>
        <div className="w-1/6">Volume</div>
        <div className="w-1/6">Share</div>
      </div>
      <div className="overflow-hidden">
        <ReactWindow.FixedSizeList
          height={height}
          width="100%"
          itemCount={data.length}
          itemSize={48}
        >
          {Row}
        </ReactWindow.FixedSizeList>
      </div>
    </div>
  );
}
