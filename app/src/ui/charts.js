import {escapeHtml as e, number as n} from './format.js';
let charts = [];
export function clearCharts() {
  for (const chart of charts) chart.destroy();
  charts = [];
}
export function drawChart(id, { labels, fullLabels = labels, datasets, horizontal = false, unit = '' }) {
  const canvas = document.getElementById(id);
  if (!canvas || !globalThis.Chart) return;
  const style = getComputedStyle(document.documentElement),
    color = (name) => style.getPropertyValue(name).trim();
  const numeric = value => Number.isFinite(value) ? `${n(value)}${unit ? ' '+unit : ''}` : 'Sem leitura';
  const isLine = datasets.some(set=>set.type==='line');
  const chart = new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: datasets.map((set, i) => ({
          backgroundColor: color(i ? "--chart-alt" : "--chart"),
          borderColor: color(i ? "--chart-alt" : "--chart"),
          borderWidth: set.type === "line" ? 2.5 : 0,
          borderRadius: 4,
          maxBarThickness: horizontal ? 34 : 32,
          pointRadius: 3.5,
          pointHoverRadius: 6,
          pointBackgroundColor: color('--surface'),
          pointBorderWidth: 2,
          spanGaps: false,
          tension: 0,
          ...set,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        indexAxis: horizontal ? "y" : "x",
        interaction: {mode:'index',intersect:false},
        elements: {line:{tension:0}},
        layout: {padding:{top:8,right:8}},
        plugins: {
          legend: {display:false},
          tooltip: {
            backgroundColor:color('--tooltip-bg'),
            titleColor:color('--tooltip-ink'),
            bodyColor:color('--tooltip-ink'),
            padding:14,cornerRadius:8,boxPadding:5,
            titleFont:{size:13,family:'Manrope',weight:'700'},
            bodyFont:{size:13,family:'Manrope'},
            callbacks:{
              title:items=>fullLabels[items[0]?.dataIndex]??'',
              label:item=>`${item.dataset.label}: ${numeric(item.raw)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: horizontal, color: color("--line") },
            border:{display:false},
            beginAtZero:horizontal && !isLine,
            title:{display:horizontal,text:unit,color:color('--muted'),font:{size:12,family:'Manrope'}},
            ticks: { color: color("--muted"), font: { size: 12, family:'Manrope' },maxRotation:0,autoSkip:true,autoSkipPadding:14,callback:horizontal?value=>n(value):function(value){return this.getLabelForValue(value);} },
          },
          y: {
            beginAtZero: !horizontal && !isLine,
            grid: { display: !horizontal, color: color("--line") },
            border:{display:false},
            title:{display:!horizontal,text:unit,color:color('--muted'),font:{size:12,family:'Manrope'}},
            ticks: { color: color("--muted"), font: { size: 12, family:'Manrope' },padding:8,maxTicksLimit:6,callback:horizontal?function(value){const label=this.getLabelForValue(value);return label.length>26?label.slice(0,25)+'…':label;}:value=>n(value) },
          },
        },
      },
    });
  charts.push(chart);
  const container = document.createElement('div');
  container.className = 'chart-consultation';
  container.innerHTML = `${datasets.length>1?`<div class="chart-legend" aria-label="Séries do gráfico">${datasets.map((set,i)=>`<button type="button" data-series="${i}" aria-pressed="true"><span class="series-swatch" style="background:${e(set.borderColor ?? color(i?'--chart-alt':'--chart'))}"></span>${e(set.label)}</button>`).join('')}</div>`:''}<p id="${e(id)}-readout" class="chart-readout" aria-live="polite">${labels.length?'Use as setas no gráfico para consultar os valores.':'Sem amostras nesta versão.'}</p><details class="chart-data" id="${e(id)}-data"><summary>Consultar dados <span>${labels.length} ${isLine?'amostras':'registros'}</span></summary><div class="table-wrap" tabindex="0" role="region" aria-label="Valores do gráfico"><table class="data-table"><caption>${e(canvas.getAttribute('aria-label'))}${unit?' · '+e(unit):''}</caption><thead><tr><th scope="col">${horizontal?'Motivo':isLine?'Data e hora':'Data'}</th>${datasets.map(set=>`<th scope="col">${e(set.label)}${unit?' ('+e(unit)+')':''}</th>`).join('')}</tr></thead><tbody>${fullLabels.map((label,index)=>`<tr><th scope="row">${e(label)}</th>${datasets.map(set=>`<td class="numeric">${e(numeric(set.data[index]))}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${datasets.length+1}">Sem amostras nesta versão.</td></tr>`}</tbody></table></div></details>`;
  canvas.closest('.chart-frame').after(container);
  container.querySelectorAll('[data-series]').forEach(button=>button.addEventListener('click',()=>{
    const index=Number(button.dataset.series),visible=!chart.isDatasetVisible(index);
    chart.setDatasetVisibility(index,visible);chart.update('none');
    button.setAttribute('aria-pressed',String(visible));
    container.querySelector('.chart-readout').textContent=`${datasets[index].label}: série ${visible?'visível':'oculta'}. A tabela mantém todos os valores.`;
  }));
  canvas.tabIndex=0;
  canvas.setAttribute('aria-describedby',`${id}-readout`);
  let selected=-1;
  const consult = () => {
    if(!labels.length)return;
    const active=datasets.flatMap((set,datasetIndex)=>chart.isDatasetVisible(datasetIndex)&&Number.isFinite(set.data[selected])?[{datasetIndex,index:selected}]:[]);
    chart.setActiveElements(active);
    const position=active.length?chart.getDatasetMeta(active[0].datasetIndex).data[selected].getCenterPoint():{x:0,y:0};
    chart.tooltip.setActiveElements(active,position);
    chart.update('none');
    container.querySelector('.chart-readout').textContent=`${fullLabels[selected]} · ${datasets.filter((set,i)=>chart.isDatasetVisible(i)).map(set=>`${set.label}: ${numeric(set.data[selected])}`).join(' · ')||'Séries ocultas. Consulte a tabela de dados.'}`;
  };
  canvas.addEventListener('focus',()=>{selected=Math.max(selected,0);consult();});
  canvas.addEventListener('keydown',event=>{
    if(!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Home','End'].includes(event.key)||!labels.length)return;
    event.preventDefault();
    selected=event.key==='Home'?0:event.key==='End'?labels.length-1:Math.max(0,Math.min(labels.length-1,selected+(['ArrowLeft','ArrowUp'].includes(event.key)?-1:1)));
    consult();
  });
  canvas.addEventListener('blur',()=>{chart.setActiveElements([]);chart.tooltip.setActiveElements([],{x:0,y:0});chart.update('none');});
  return chart;
}
