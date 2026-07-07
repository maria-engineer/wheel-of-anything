import * as React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface RadarSeries {
  key: string;
  name: string;
  color: string;
  values: number[]; // one rating per slice, aligned with sliceNames
}

interface WheelRadarChartProps {
  sliceNames: string[];
  series: RadarSeries[];
  height?: number;
}

export const WheelRadarChart: React.FC<WheelRadarChartProps> = ({ sliceNames, series, height = 320 }) => {
  const data = sliceNames.map((name, i) => {
    const row: Record<string, string | number> = { subject: name };
    series.forEach((s) => {
      row[s.key] = s.values[i] ?? 0;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis angle={90} domain={[0, 10]} tickCount={6} />
        {series.map((s) => (
          <Radar key={s.key} name={s.name} dataKey={s.key} stroke={s.color} fill={s.color} fillOpacity={0.25} />
        ))}
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
};
