import React, { useMemo } from 'react';

interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
  bgColor?: string;
  fgColor?: string;
}

export const QrCode: React.FC<QrCodeProps> = ({
  value,
  size = 180,
  className = '',
  bgColor = '#ffffff',
  fgColor = '#0f172a',
}) => {
  // Generate a deterministic 21x21 QR-like matrix grid with authentic finder patterns
  const matrix = useMemo(() => {
    const dimension = 21;
    const grid: boolean[][] = Array.from({ length: dimension }, () =>
      Array(dimension).fill(false)
    );

    // Helper: mark standard 7x7 corner finder patterns
    const setFinder = (top: number, left: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            grid[top + r][left + c] = true;
          } else {
            grid[top + r][left + c] = false;
          }
        }
      }
    };

    setFinder(0, 0); // Top-left
    setFinder(0, dimension - 7); // Top-right
    setFinder(dimension - 7, 0); // Bottom-left

    // Timing patterns
    for (let i = 8; i < dimension - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // Hash the input string to generate pseudorandom data cells in remaining areas
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }

    let seed = Math.abs(hash) || 42;
    const nextRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let r = 0; r < dimension; r++) {
      for (let c = 0; c < dimension; c++) {
        // Skip finder zones
        const inTopLeft = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= dimension - 8;
        const inBottomLeft = r >= dimension - 8 && c < 8;
        const inTiming = (r === 6 && c >= 8 && c < dimension - 8) || (c === 6 && r >= 8 && r < dimension - 8);

        if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming) {
          grid[r][c] = nextRandom() > 0.48;
        }
      }
    }

    return grid;
  }, [value]);

  const dimension = 21;
  const cellSize = size / dimension;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`rounded-lg p-2 ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {matrix.map((row, r) =>
        row.map((filled, c) => {
          if (!filled) return null;
          return (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.2}
              height={cellSize + 0.2}
              fill={fgColor}
              rx={cellSize * 0.15}
            />
          );
        })
      )}
    </svg>
  );
};
