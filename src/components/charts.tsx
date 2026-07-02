"use client";

import type { KpiMeasurement } from "@/lib/types";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function KpiTrend({
  measurements,
  target,
}: {
  measurements: KpiMeasurement[];
  target: number;
}) {
  const data = measurements.map((item) => ({
    date: item.date.slice(5),
    value: item.value,
    target,
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ left: -20, right: 8, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Area type="monotone" dataKey="target" stroke="#f4c430" fill="#f4c43022" />
          <Area type="monotone" dataKey="value" stroke="#223148" fill="#22314822" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
