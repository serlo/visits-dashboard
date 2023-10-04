const fs = require('fs')

const data = require('../intermediate/90_days_sliding.json')
const RM_ids = require('../realschule_mittelschule_aufgabenordner.json')
const index = require('../rm_url_index.json')

data.sort((a, b) => a.date.localeCompare(b.date))

RM_ids.sort(
  (a, b) =>
    data[data.length - 1].sumThisYearByUuid[b] -
    data[data.length - 1].sumThisYearByUuid[a]
)

const alreadyRendered = new Set()

const output = `
  <!doctype html>
  <html lang="de">
    <head>
    <meta charset=utf-8>
    <title>Detailsauswertung Entwicklung Aufgabenordner Realschule/Mittelschule</title>
    </head>
    <body style="margin-left:24px;margin-right:24px;">
      <h1>Detailsauswertung Entwicklung Aufgabenordner Realschule/Mittelschule</h1>

      <p>Stand: ${data[data.length - 1].date}</p>

      <p style="font-size:24px;">Daten beziehen sich nur auf <strong>de.serlo.org</strong>. Es wird immer die Summe der Seitenaufrufe der letzten 90 Tage betrachtet. Der Vergleich findet mit dem Vorjahr statt.
      </p>

      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

      ${RM_ids.slice(0, 100)
        .map((id) => generateCharts(id))
        .join('')}
      
    </body>
  </html>
`

function generateCharts(id) {
  if (alreadyRendered.has(id)) return ''
  alreadyRendered.add(id)
  return `
    <h2>${decodeURIComponent(index[id])}: Anzahl Aufrufe</h2>

    <div style="width:100%;height:600px;position: relative;">
      <canvas id="chart${id}"></canvas>
    </div>
    
    <h2>${decodeURIComponent(
      index[id]
    )}: Veränderung zum Vorjahr in Prozent</h2>
    
    <div style="width:100%;height:600px;position: relative;">
      <canvas id="chart${id}_rel"></canvas>
    </div>

    <script>
      const ctx${id} = document.getElementById('chart${id}');

      new Chart(ctx${id}, {
        type: 'line',
        data: {
          labels: ${JSON.stringify(data.map((entry) => entry.date))},
          datasets: [{
            label: 'dieses Jahr',
            data: ${JSON.stringify(
              data.map((entry) => entry.sumThisYearByUuid[id])
            )},
          },
          {
            label: 'letztes Jahr',
            data: ${JSON.stringify(
              data.map((entry) => entry.sumLastYearByUuid[id])
            )},
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          },
          maintainAspectRatio: false,
        }
      });

      const ctx${id}_rel = document.getElementById('chart${id}_rel');

      new Chart(ctx${id}_rel, {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(data.map((entry) => entry.date))},
          datasets: [{
            label: 'prozentuale Veränderung',
            data: ${JSON.stringify(
              data.map(
                (entry) =>
                  (entry.sumThisYearByUuid[id] / entry.sumLastYearByUuid[id] -
                    1) *
                  100
              )
            )},
            backgroundColor(context) {
              const index = context.dataIndex
              const value = context.dataset.data[index]
              return value < 0 ? 'red' : 'green'
            }
          }]
        },
        options: {
          maintainAspectRatio: false,
        }
      });
    </script>
  
  `
}

fs.writeFileSync('./_output/details.html', output)

// ---- functions ------
