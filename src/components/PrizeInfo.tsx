
import React from 'react';

export function PrizeInfo() {
  return (
    <div>
      <div className="text-blue-400 text-lg font-semibold mb-4">Prizes</div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>1st</span>
          <span className="font-bold">$90.00</span>
        </div>
        <div className="flex justify-between">
          <span>2nd</span>
          <span className="font-bold">$60.00</span>
        </div>
        <div className="flex justify-between">
          <span>3rd</span>
          <span className="font-bold">$45.00</span>
        </div>
        <div className="flex justify-between">
          <span>4th</span>
          <span className="font-bold">$36.00</span>
        </div>
        <div className="flex justify-between">
          <span>5th</span>
          <span className="font-bold">$30.00</span>
        </div>
      </div>
    </div>
  );
}
