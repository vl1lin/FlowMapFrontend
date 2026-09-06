// grid.vsg идёт по возрастанию, но code_matrix[0] соответствует vsg = max —
// поэтому для оси y передаём реверсированную копию grid.vsg, чтобы подписи
// осей совпадали со значениями в матрице.
function renderHeatmap(grid, codeMatrix) {
  const data = [{
    x: grid.vsl,
    y: [...grid.vsg].reverse(),
    z: codeMatrix,
    type: "heatmap",
    colorscale: "Portland",
    hovertemplate: "Vl: %{x}<br>Vg: %{y}<br>Код: %{z}<extra></extra>",
  }];

  const layout = {
    xaxis: { title: "Скорость жидкости, м/с", type: grid.log_scale ? "log" : "linear" },
    yaxis: { title: "Скорость газа, м/с", type: grid.log_scale ? "log" : "linear" },
    margin: { t: 30 },
  };

  Plotly.newPlot("chart", data, layout, { responsive: true });
}

function renderLegend(patternLegend) {
  const legendEl = document.getElementById("legend");
  legendEl.innerHTML = "";
  const ul = document.createElement("ul");
  for (const [code, name] of Object.entries(patternLegend)) {
    const li = document.createElement("li");
    li.textContent = `${code} — ${name}`;
    ul.appendChild(li);
  }
  legendEl.appendChild(ul);
}
