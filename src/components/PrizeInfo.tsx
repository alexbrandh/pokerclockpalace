
import React from 'react';

export function PrizeInfo() {
  return (
    <div>
      <div className="text-yellow-400 text-lg font-semibold mb-4">Prizes</div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>1st</span>
          <span className="font-bold text-yellow-300">$90.00</span>
        </div>
        <div className="flex justify-between">
          <span>2nd</span>
          <span className="font-bold text-yellow-300">$60.00</span>
        </div>
        <div className="flex justify-between">
          <span>3rd</span>
          <span className="font-bold text-yellow-300">$45.00</span>
        </div>
        <div className="flex justify-between">
          <span>4th</span>
          <span className="font-bold text-yellow-300">$36.00</span>
        </div>
        <div className="flex justify-between">
          <span>5th</span>
          <span className="font-bold text-yellow-300">$30.00</span>
        </div>
      </div>
    </div>
  );
}
