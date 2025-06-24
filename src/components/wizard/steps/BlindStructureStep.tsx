
import React from 'react';
import { EnhancedLevelEditor } from '@/components/level-editor/EnhancedLevelEditor';

interface BlindStructureStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function BlindStructureStep({ data, onUpdate }: BlindStructureStepProps) {
  const handleLevelsChange = (levels: any[]) => {
    onUpdate({ levels });
  };

  return (
    <div className="space-y-6">
      <EnhancedLevelEditor 
        levels={data.levels || []} 
        onLevelsChange={handleLevelsChange}
      />
    </div>
  );
}
