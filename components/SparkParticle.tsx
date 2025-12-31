import React, { useEffect, useState } from 'react';

interface Spark {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface SparkParticleProps {
  x: number;
  y: number;
  onComplete?: () => void;
}

const SPARK_DIRECTIONS = [
  { x: -25, y: -25 },  // top-left
  { x: 0, y: -30 },    // top
  { x: 25, y: -25 },   // top-right
  { x: 30, y: 0 },     // right
  { x: 25, y: 25 },    // bottom-right
  { x: 0, y: 30 },     // bottom
  { x: -25, y: 25 },   // bottom-left
  { x: -30, y: 0 },    // left
];

const SPARK_COLORS = [
  '#ffcc00', // gold
  '#ff9900', // orange
  '#ff6600', // deep orange
  '#ffdd44', // light gold
];

export const SparkParticle: React.FC<SparkParticleProps> = ({ x, y, onComplete }) => {
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    // Create sparks
    const newSparks = SPARK_DIRECTIONS.map((dir, i) => ({
      id: i,
      x: dir.x + (Math.random() - 0.5) * 10,
      y: dir.y + (Math.random() - 0.5) * 10,
      color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
    }));
    setSparks(newSparks);

    // Clean up after animation
    const timer = setTimeout(() => {
      setSparks([]);
      onComplete?.();
    }, 400);

    return () => clearTimeout(timer);
  }, [x, y, onComplete]);

  if (sparks.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
      }}
    >
      {sparks.map((spark) => (
        <div
          key={spark.id}
          className="spark-particle"
          style={{
            '--spark-x': `${spark.x}px`,
            '--spark-y': `${spark.y}px`,
            background: spark.color,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

// Hook to manage spark effects
export const useSparkEffect = () => {
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>([]);
  let sparkIdCounter = 0;

  const triggerSpark = (x: number, y: number) => {
    const id = Date.now() + sparkIdCounter++;
    setSparks((prev) => [...prev, { id, x, y }]);
  };

  const removeSpark = (id: number) => {
    setSparks((prev) => prev.filter((s) => s.id !== id));
  };

  const SparkContainer: React.FC = () => (
    <>
      {sparks.map((spark) => (
        <SparkParticle
          key={spark.id}
          x={spark.x}
          y={spark.y}
          onComplete={() => removeSpark(spark.id)}
        />
      ))}
    </>
  );

  return { triggerSpark, SparkContainer };
};

export default SparkParticle;
