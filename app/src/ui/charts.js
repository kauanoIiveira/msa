let charts = [];
export function clearCharts() {
  for (const chart of charts) chart.destroy();
  charts = [];
}
export function drawChart(id, { labels, datasets, horizontal = false }) {
  const canvas = document.getElementById(id);
  if (!canvas || !globalThis.Chart) return;
  const style = getComputedStyle(document.documentElement),
    color = (name) => style.getPropertyValue(name).trim();
  charts.push(
    new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: datasets.map((set, i) => ({
          backgroundColor: color(i ? "--chart-alt" : "--chart"),
          borderColor: color("--chart"),
          borderWidth: set.type === "line" ? 2 : 0,
          borderRadius: 3,
          pointRadius: 3,
          ...set,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        indexAxis: horizontal ? "y" : "x",
        plugins: {
          legend: {
            display: datasets.length > 1,
            position: "bottom",
            labels: {
              color: color("--muted"),
              boxWidth: 10,
              font: { size: 10, family: "Manrope" },
            },
          },
        },
        scales: {
          x: {
            grid: { display: horizontal, color: color("--line") },
            ticks: { color: color("--muted"), font: { size: 10 } },
          },
          y: {
            beginAtZero: datasets.every((s) => s.type !== "line"),
            grid: { display: !horizontal, color: color("--line") },
            ticks: { color: color("--muted"), font: { size: 10 } },
          },
        },
      },
    }),
  );
}
