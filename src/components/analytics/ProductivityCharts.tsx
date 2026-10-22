"use client";

import { useMemo } from "react";
import type { FocusSession } from "@/types";

type ProductivityChartsProps = {
  sessions: FocusSession[];
};

type ChartPoint = {
  label: string;
  minutes: number;
  dateKey: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function startOfWeek(date: Date): Date {
  const result = startOfDay(date);
  const daysSinceMonday = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - daysSinceMonday);
  return result;
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isValidSession(session: FocusSession): boolean {
  return (
    session.mode === "focus" &&
    Number.isFinite(session.durationMinutes) &&
    session.durationMinutes > 0 &&
    Boolean(session.completedAt) &&
    !Number.isNaN(new Date(session.completedAt).getTime())
  );
}

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;

  return `${hours}h ${remainingMinutes}m`;
}

function sumMinutes(sessions: FocusSession[]): number {
  return sessions.reduce(
    (total, session) => total + session.durationMinutes,
    0
  );
}

function buildDailyData(sessions: FocusSession[]): ChartPoint[] {
  const today = startOfDay(new Date());

  // Oldest to newest: 6 days ago through today.
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - index));

    const key = dateKey(day);
    const daySessions = sessions.filter(
      (session) => dateKey(new Date(session.completedAt)) === key
    );

    return {
      label: day.toLocaleDateString(undefined, { weekday: "short" }),
      dateKey: key,
      minutes: sumMinutes(daySessions),
    };
  });
}

function buildWeeklyData(sessions: FocusSession[]): ChartPoint[] {
  const currentWeek = startOfWeek(new Date());

  // Current week plus the previous 7 weeks.
  return Array.from({ length: 8 }, (_, index) => {
    const weekStart = new Date(currentWeek);
    weekStart.setDate(currentWeek.getDate() - (7 * (7 - index)));

    const nextWeek = new Date(weekStart);
    nextWeek.setDate(weekStart.getDate() + 7);

    const key = dateKey(weekStart);

    const weekSessions = sessions.filter((session) => {
      const completed = new Date(session.completedAt);
      return completed >= weekStart && completed < nextWeek;
    });

    return {
      label: weekStart.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      dateKey: key,
      minutes: sumMinutes(weekSessions),
    };
  });
}

function BarChart({
  data,
  period,
}: {
  data: ChartPoint[];
  period: "day" | "week";
}) {
  const width = 700;
  const height = 250;
  const paddingLeft = 48;
  const paddingRight = 14;
  const paddingTop = 20;
  const paddingBottom = 38;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxMinutes = Math.max(60, ...data.map((item) => item.minutes));
  const step = Math.ceil(maxMinutes / 4 / 15) * 15 || 15;
  const maxScale = step * 4;
  const slotWidth = chartWidth / data.length;
  const barWidth = Math.min(period === "day" ? 46 : 48, slotWidth * 0.58);

  return (
    <div className="w-full overflow-x-auto mt-6">
      <svg
        className="min-w-[600px] w-full h-[250px] text-[#b6c2d4]"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={
          period === "day"
            ? "Focus minutes for each of the last seven days"
            : "Focus minutes for each of the last eight weeks"
        }
      >
        {[0, 1, 2, 3, 4].map((tick) => {
          const value = maxScale * (tick / 4);
          const y = paddingTop + chartHeight - (tick / 4) * chartHeight;

          return (
            <g key={tick}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="currentColor"
                opacity="0.12"
                strokeDasharray={tick === 0 ? "0" : "4 5"}
              />
              <text
                x={paddingLeft - 10}
                y={y + 4}
                fill="currentColor"
                opacity="0.65"
                fontSize="11"
                textAnchor="end"
              >
                {value >= 60
                  ? `${Number((value / 60).toFixed(1))}h`
                  : `${value}m`}
              </text>
            </g>
          );
        })}

        {data.map((item, index) => {
          const barHeight = (item.minutes / maxScale) * chartHeight;
          const x =
            paddingLeft + index * slotWidth + (slotWidth - barWidth) / 2;
          const y = paddingTop + chartHeight - barHeight;

          return (
            <g key={item.dateKey}>
              <title>
                {item.label}: {formatMinutes(item.minutes)} of focus time
              </title>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(item.minutes > 0 ? 3 : 0, barHeight)}
                rx="6"
                fill="#818cf8"
                opacity={item.minutes > 0 ? "0.9" : "0.15"}
              />
              <text
                x={x + barWidth / 2}
                y={height - 12}
                fill="currentColor"
                opacity="0.72"
                fontSize={period === "week" ? "10" : "12"}
                textAnchor="middle"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function ProductivityCharts({
  sessions,
}: ProductivityChartsProps) {
  const focusSessions = useMemo(
    () => sessions.filter(isValidSession),
    [sessions]
  );

  const dailyData = useMemo(
    () => buildDailyData(focusSessions),
    [focusSessions]
  );

  const weeklyData = useMemo(
    () => buildWeeklyData(focusSessions),
    [focusSessions]
  );

  const todayKey = dateKey(new Date());
  const todayMinutes =
    dailyData.find((item) => item.dateKey === todayKey)?.minutes ?? 0;

  const thisWeekKey = dateKey(startOfWeek(new Date()));
  const thisWeekMinutes =
    weeklyData.find((item) => item.dateKey === thisWeekKey)?.minutes ?? 0;

  const dailyTotal = dailyData.reduce(
    (total, item) => total + item.minutes,
    0
  );

  return (
    <section className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="ff-panel !p-5 flex flex-col gap-1.5">
          <span className="text-[#8b9ab1] text-xs font-semibold">Today</span>
          <strong className="text-3xl font-bold text-[#f8fafc]">
            {formatMinutes(todayMinutes)}
          </strong>
          <small className="text-[#78869a] text-xs">Completed focus time</small>
        </article>

        <article className="ff-panel !p-5 flex flex-col gap-1.5">
          <span className="text-[#8b9ab1] text-xs font-semibold">This week</span>
          <strong className="text-3xl font-bold text-[#f8fafc]">
            {formatMinutes(thisWeekMinutes)}
          </strong>
          <small className="text-[#78869a] text-xs">Monday to Sunday</small>
        </article>

        <article className="ff-panel !p-5 flex flex-col gap-1.5">
          <span className="text-[#8b9ab1] text-xs font-semibold">Last 7 days</span>
          <strong className="text-3xl font-bold text-[#f8fafc]">
            {formatMinutes(dailyTotal)}
          </strong>
          <small className="text-[#78869a] text-xs">Daily chart total</small>
        </article>
      </div>

      <div className="flex flex-col gap-6">
        <article className="ff-panel !p-7">
          <div className="ff-section-heading !mb-2">
            <div>
              <h3 className="!text-lg">Daily productivity</h3>
              <p>Focus minutes per day</p>
            </div>
            <span className="ff-badge">7 days</span>
          </div>

          <BarChart data={dailyData} period="day" />
        </article>

        <article className="ff-panel !p-7">
          <div className="ff-section-heading !mb-2">
            <div>
              <h3 className="!text-lg">Weekly productivity</h3>
              <p>Focus minutes per week</p>
            </div>
            <span className="ff-badge">8 weeks</span>
          </div>

          <BarChart data={weeklyData} period="week" />
        </article>
      </div>

      {focusSessions.length === 0 && (
        <div className="ff-empty-state !mt-4">
          <p className="max-w-md">
            No completed focus sessions yet. Finish a focus session to see your
            productivity charts update.
          </p>
        </div>
      )}
    </section>
  );
}