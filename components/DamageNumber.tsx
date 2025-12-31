import React, { useEffect, useState } from 'react';

interface DamageNumberProps {
  value: number;
  x: number;
  y: number;
  type: 'damage' | 'heal' | 'block' | 'poison' | 'bleed';
  onComplete?: () => void;
}

const TYPE_COLORS = {
  damage: 'text-red-400',
  heal: 'text-green-400',
  block: 'text-blue-400',
  poison: 'text-emerald-400',
  bleed: 'text-red-300',
};

export const DamageNumber: React.FC<DamageNumberProps> = ({
  value,
  x,
  y,
  type,
  onComplete,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  const prefix = type === 'heal' ? '+' : type === 'block' ? '' : '-';
  const colorClass = TYPE_COLORS[type];

  return (
    <div
      className={`
        absolute pointer-events-none z-50
        animate-damage-pop
        font-pixel text-lg md:text-xl
        ${colorClass}
      `}
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {prefix}{Math.abs(value)}
    </div>
  );
};

// Hook to manage damage numbers
interface DamageNumberData {
  id: number;
  value: number;
  x: number;
  y: number;
  type: 'damage' | 'heal' | 'block' | 'poison' | 'bleed';
}

export const useDamageNumbers = () => {
  const [numbers, setNumbers] = useState<DamageNumberData[]>([]);
  let idCounter = 0;

  const showDamage = (
    value: number,
    x: number,
    y: number,
    type: 'damage' | 'heal' | 'block' | 'poison' | 'bleed' = 'damage'
  ) => {
    const id = Date.now() + idCounter++;
    // Add some randomness to position to avoid stacking
    const offsetX = (Math.random() - 0.5) * 30;
    const offsetY = (Math.random() - 0.5) * 20;
    setNumbers((prev) => [...prev, { id, value, x: x + offsetX, y: y + offsetY, type }]);
  };

  const removeDamageNumber = (id: number) => {
    setNumbers((prev) => prev.filter((n) => n.id !== id));
  };

  const DamageNumberContainer: React.FC = () => (
    <>
      {numbers.map((num) => (
        <DamageNumber
          key={num.id}
          value={num.value}
          x={num.x}
          y={num.y}
          type={num.type}
          onComplete={() => removeDamageNumber(num.id)}
        />
      ))}
    </>
  );

  return { showDamage, DamageNumberContainer };
};

export default DamageNumber;
