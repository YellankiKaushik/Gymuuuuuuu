import { useId } from "react";
import type { WeightSummary } from "./domain";

/** Scatter plot deliberately never connects or fills missing dates. */
export function WeightChart({ rows }: { rows: readonly WeightSummary[] }) {
  const id = useId();
  if (!rows.length)
    return (
      <p>
        No recorded weight points yet. A chart appears when you save a
        measurement.
      </p>
    );
  const first = rows[0]!,
    last = rows[rows.length - 1]!;
  const start = Date.parse(first.localDate),
    end = Date.parse(last.localDate);
  const values = rows.map((row) => row.medianKg),
    min = Math.min(...values),
    max = Math.max(...values);
  const x = (date: string) =>
    start === end
      ? 330
      : 70 + ((Date.parse(date) - start) / (end - start)) * 510;
  const y = (value: number) =>
    min === max ? 115 : 180 - ((value - min) / (max - min)) * 130;
  return (
    <figure className="information-path">
      <figcaption>
        <strong>Recorded daily weight medians</strong>
        <span>
          {rows.length} measured {rows.length === 1 ? "day" : "days"},{" "}
          {first.localDate} to {last.localDate}. Dots show recorded medians in
          kg; gaps stay empty. No prediction or interpolation.
        </span>
      </figcaption>
      <div
        className="weight-plot-frame"
        role="region"
        tabIndex={0}
        aria-label="Weight chart; scroll horizontally on narrow screens, or use the table below"
      >
        <svg
          className="weight-plot"
          viewBox="0 0 640 245"
          role="img"
          aria-labelledby={`${id}-title ${id}-desc`}
        >
          <title id={`${id}-title`}>
            Weight by recorded local date, in kilograms
          </title>
          <desc id={`${id}-desc`}>
            Minimum {min} kg; maximum {max} kg. An equivalent table follows.
            Horizontal position is calendar date; vertical position is weight.
          </desc>
          <path className="plot-guide" d="M65 35V190H585" fill="none" />
          <text x="8" y="24">
            kg
          </text>
          <text x="8" y={min === max ? 119 : 54}>
            {max.toFixed(1)}
          </text>
          {min !== max && (
            <text x="8" y="184">
              {min.toFixed(1)}
            </text>
          )}
          {rows.map((row) => (
            <circle
              key={row.localDate}
              cx={x(row.localDate)}
              cy={y(row.medianKg)}
              r="5"
            >
              <title>
                {row.localDate}: {row.medianKg} kg ({row.recordCount} records)
              </title>
            </circle>
          ))}
          <text x="65" y="215">
            {first.localDate}
          </text>
          {start !== end && (
            <text x="585" y="215" textAnchor="end">
              {last.localDate}
            </text>
          )}
          <text x="330" y="240" textAnchor="middle">
            Recorded local date
          </text>
        </svg>
      </div>
      <details>
        <summary>Read the chart as a table</summary>
        <table>
          <caption>Recorded daily medians; missing dates omitted</caption>
          <thead>
            <tr>
              <th scope="col">Local date</th>
              <th scope="col">Median (kg)</th>
              <th scope="col">Records</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.localDate}>
                <td>{row.localDate}</td>
                <td>{row.medianKg}</td>
                <td>{row.recordCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
