
import React from 'react';

export function MobilePrizeInfo() {
  return (
    <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-4">
      <div className="text-yellow-400 text-sm font-semibold mb-3 text-center">
        Distribución de Premios
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-300">1er Lugar</span>
          <span className="font-bold text-yellow-300">$90.00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">2do Lugar</span>
          <span className="font-bold text-yellow-300">$60.00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">3er Lugar</span>
          <span className="font-bold text-yellow-300">$45.00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">4to Lugar</span>
          <span className="font-bold text-yellow-300">$36.00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">5to Lugar</span>
          <span className="font-bold text-yellow-300">$30.00</span>
        </div>
      </div>
    </div>
  );
}
