import * as React from "react";
import { useRef } from "react";
import styled from "styled-components";
import { MAX_RATING, pointToSliceAndRating, ratingToRadius, sliceAngles, wedgePath, polarPoint } from "./geometry";

export interface WheelSliceDatum {
  name: string;
  rating: number;
  baseline?: number;
  reasoning?: string;
}

export type WheelMode = "name" | "rate" | "select" | "view";

interface WheelDialProps {
  slices: WheelSliceDatum[];
  mode: WheelMode;
  activeIndex?: number | null;
  selected?: number[];
  size?: number;
  colorForIndex?: (index: number, slice: WheelSliceDatum) => string;
  interactiveIndices?: number[];
  onActivate?: (index: number) => void;
  onRate?: (index: number, value: number) => void;
  onHover?: (index: number | null) => void;
}

const Wrapper = styled.div<{ size: number }>`
  position: relative;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  margin: 0 auto;
`;

const LabelLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

const Label = styled.div<{ $x: number; $y: number; $emphasized: boolean }>`
  position: absolute;
  left: ${({ $x }) => $x}px;
  top: ${({ $y }) => $y}px;
  transform: translate(-50%, -50%);
  max-width: 88px;
  text-align: center;
  font-size: ${({ $emphasized }) => ($emphasized ? "0.85rem" : "0.72rem")};
  font-weight: ${({ $emphasized }) => ($emphasized ? 700 : 500)};
  color: ${({ theme, $emphasized }) => ($emphasized ? theme.colors.text : theme.colors.muted)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: auto;
`;

const N_BANDS = MAX_RATING;

export const WheelDial: React.FC<WheelDialProps> = ({
  slices,
  mode,
  activeIndex = null,
  selected = [],
  size = 320,
  colorForIndex,
  interactiveIndices,
  onActivate,
  onRate,
  onHover,
}) => {
  const isInteractive = (index: number) => mode !== "view" && (!interactiveIndices || interactiveIndices.includes(index));
  const count = slices.length;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - 34;
  const hubRadius = 14;
  const dragIndexRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const svgPoint = (clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handlePointerDown = (index: number) => (event: React.PointerEvent<SVGPathElement>) => {
    if (!isInteractive(index) || mode !== "rate") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragIndexRef.current = index;
    onActivate?.(index);
    const { x, y } = svgPoint(event.clientX, event.clientY);
    const { rating } = pointToSliceAndRating(x, y, cx, cy, count, hubRadius, outerRadius);
    onRate?.(index, rating);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGPathElement>) => {
    if (mode !== "rate" || dragIndexRef.current === null) return;
    const { x, y } = svgPoint(event.clientX, event.clientY);
    const { rating } = pointToSliceAndRating(x, y, cx, cy, count, hubRadius, outerRadius);
    onRate?.(dragIndexRef.current, rating);
  };

  const handlePointerUp = () => {
    dragIndexRef.current = null;
  };

  const defaultColor = "#4B4ADE";

  return (
    <Wrapper size={size}>
      <svg ref={svgRef} width={size} height={size} role="group" aria-label="Wheel">
        {Array.from({ length: N_BANDS }, (_, band) => (
          <circle
            key={band}
            cx={cx}
            cy={cy}
            r={ratingToRadius(band + 1, hubRadius, outerRadius)}
            fill="none"
            stroke="#E4E4EE"
            strokeWidth={1}
          />
        ))}

        {slices.map((slice, i) => {
          const { start, end } = sliceAngles(i, count);
          const color = colorForIndex ? colorForIndex(i, slice) : defaultColor;
          const fillRadius = ratingToRadius(slice.rating, hubRadius, outerRadius);
          const isActive = activeIndex === i;
          const isSelected = selected.includes(i);
          const interactive = isInteractive(i);

          return (
            <g
              key={i}
              tabIndex={interactive ? 0 : undefined}
              role={mode === "select" ? "checkbox" : "slider"}
              aria-checked={mode === "select" ? isSelected : undefined}
              aria-valuenow={mode === "rate" ? slice.rating : undefined}
              aria-valuemin={mode === "rate" ? 0 : undefined}
              aria-valuemax={mode === "rate" ? MAX_RATING : undefined}
              aria-label={slice.name || `Area ${i + 1}`}
              opacity={interactive ? 1 : 0.4}
              onFocus={() => interactive && mode === "rate" && onActivate?.(i)}
              onMouseEnter={() => onHover?.(i)}
              onMouseLeave={() => onHover?.(null)}
              onKeyDown={(event) => {
                if (!interactive) return;
                if (mode === "rate") {
                  if (event.key === "ArrowUp" || event.key === "ArrowRight") {
                    event.preventDefault();
                    onRate?.(i, Math.min(MAX_RATING, slice.rating + 1));
                  } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
                    event.preventDefault();
                    onRate?.(i, Math.max(0, slice.rating - 1));
                  }
                } else if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onActivate?.(i);
                }
              }}
            >
              <path
                d={wedgePath(cx, cy, hubRadius, outerRadius, start, end)}
                fill={isSelected ? "rgba(75, 74, 222, 0.06)" : "transparent"}
                stroke={isActive ? "#191A23" : "#E4E4EE"}
                strokeWidth={isActive ? 2 : 1}
              />
              {slice.rating > 0 && (
                <path
                  d={wedgePath(cx, cy, hubRadius, fillRadius, start, end)}
                  fill={color}
                  fillOpacity={isActive ? 0.9 : 0.65}
                  style={{ pointerEvents: "none" }}
                />
              )}
              {slice.baseline !== undefined && (
                <path
                  d={wedgePath(
                    cx,
                    cy,
                    ratingToRadius(slice.baseline, hubRadius, outerRadius) - 1,
                    ratingToRadius(slice.baseline, hubRadius, outerRadius) + 1,
                    start,
                    end
                  )}
                  fill="#191A23"
                  fillOpacity={0.6}
                  style={{ pointerEvents: "none" }}
                />
              )}
              <path
                d={wedgePath(cx, cy, hubRadius, outerRadius, start, end)}
                fill="transparent"
                onPointerDown={handlePointerDown(i)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onClick={() => interactive && (mode === "name" || mode === "select") && onActivate?.(i)}
                style={{ cursor: interactive ? "pointer" : "default" }}
              />
            </g>
          );
        })}
      </svg>
      <LabelLayer>
        {slices.map((slice, i) => {
          const { start, end } = sliceAngles(i, count);
          const mid = (start + end) / 2;
          const point = polarPoint(cx, cy, outerRadius + 20, mid);
          return (
            <Label key={i} $x={point.x} $y={point.y} $emphasized={activeIndex === i} title={slice.reasoning || undefined}>
              {slice.name || `Area ${i + 1}`}
            </Label>
          );
        })}
      </LabelLayer>
    </Wrapper>
  );
};
