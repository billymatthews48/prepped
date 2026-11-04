"use client";

import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DayTotal } from "@/lib/stats";

const ACCENT = "#16a34a";
const WARN = "#d97706";
const MUTED = "#64748b";

function shortDay(day: string) {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", { month: "numeric", day: "numeric", timeZone: "UTC" });
}

export function CalorieChart({ days, goal }: { days: DayTotal[]; goal: number }) {
  return (
    <div className="h-64 w-full" role="img" aria-label={`Bar chart of calories per day for the last ${days.length} days, goal ${goal}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={days} margin={{ top: 16, right: 8, bottom: 0, left: -8 }}>
          <XAxis
            dataKey="day"
            tickFormatter={shortDay}
            tick={{ fontSize: 11, fill: MUTED }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 11, fill: MUTED }} tickLine={false} axisLine={false} width={44} />
          <Tooltip
            cursor={{ fill: "rgba(100,116,139,0.08)" }}
            formatter={(value) => [`${Number(value).toLocaleString()} cal`, "Calories"]}
            labelFormatter={(label) =>
              new Date(`${label}T12:00:00Z`).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              })
            }
          />
          {/* extendDomain stretches the axis to include the goal, so the line
              still shows when the goal is above every bar (or nothing is logged). */}
          <ReferenceLine
            y={goal}
            ifOverflow="extendDomain"
            stroke={MUTED}
            strokeDasharray="4 4"
            label={{ value: `Goal ${goal.toLocaleString()}`, position: "insideTopRight", fontSize: 11, fill: MUTED }}
          />
          <Bar dataKey="calories" radius={[6, 6, 0, 0]} maxBarSize={28} animationDuration={500}>
            {days.map((d) => (
              <Cell key={d.day} fill={d.calories > goal ? WARN : ACCENT} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
