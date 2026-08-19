"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { angka } from "@/lib/utils";

interface KolektibilitasChartProps {
  data: Array<{ label: string; val: number; color: string }>;
}

export default function KolektibilitasChart({
  data,
}: KolektibilitasChartProps) {
  const chartData = data
    .filter((d) => d.val > 0)
    .map((d) => ({ name: d.label, value: d.val, color: d.color }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number) => angka(v)}
          contentStyle={{
            background: "#FFFFFF",
            border: "1px solid #6F797F",
            borderRadius: "12px",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
