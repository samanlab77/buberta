"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { rupiahRingkas } from "@/lib/utils";

interface RevenueChartProps {
  data: Array<{ label: string; target: number; reals: number }>;
}

// Warna brand dari logo B3
const BIRU = "#16789E";
const KUNING = "#F8CA08";

export default function RevenueChart({ data }: RevenueChartProps) {
  const adaTarget = data.some((d) => d.target > 0);
  const chartData = data.map((d) => ({
    bulan: d.label,
    Target: d.target,
    Realisasi: d.reals,
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#BFC8CE" />
        <XAxis dataKey="bulan" stroke="#3F484D" fontSize={14} />
        <YAxis
          stroke="#3F484D"
          fontSize={12}
          tickFormatter={(v: number) => rupiahRingkas(v)}
          width={70}
        />
        <Tooltip
          formatter={(v: number) => rupiahRingkas(v)}
          contentStyle={{
            background: "#FFFFFF",
            border: "1px solid #6F797F",
            borderRadius: "12px",
          }}
        />
        <Legend />
        {adaTarget && (
          <Bar dataKey="Target" fill={KUNING} radius={[4, 4, 0, 0]} />
        )}
        <Bar dataKey="Realisasi" fill={BIRU} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
