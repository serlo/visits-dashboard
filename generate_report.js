const fs = require('fs')

const data = require('./intermediate/90_days_sliding.json')

data.sort((a, b) => a.date.localeCompare(b.date))

const output = `
  <!doctype html>
  <html lang="de">
    <head>
    <meta charset=utf-8>
    <title>Aufrufzahlen der letzten 2 Jahre in 90-Tage-Zeiträume</title>
    </head>
    <body>
      <h1>Aufrufzahlen der letzten 2 Jahre in 90-Tage-Zeiträume</h1>
      
      <h2>Absolute Anzahl Aufrufe (90-Tage-Zeiträume bis zum Datum)</h2>
      
      <div style="width:100%;max-height:600px;position: relative;">
        <canvas id="chart1"></canvas>
      </div>
      
      <h2>Relative Veränderung zum Vorjahr in Prozent</h2>
      
      <div style="width:100%;max-height:600px;position: relative;">
        <canvas id="chart2"></canvas>
      </div>
      
      
      
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      
      <script>
        const ctx = document.getElementById('chart1');

        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ${JSON.stringify(data.map((entry) => entry.date))},
            datasets: [{
              label: 'dieses Jahr',
              data: ${JSON.stringify(data.map((entry) => entry.sumThisYear))},
            },
            {
              label: 'letztes Jahr',
              data: ${JSON.stringify(data.map((entry) => entry.sumLastYear))},
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
        
        const ctx2 = document.getElementById('chart2');

        new Chart(ctx2, {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(data.map((entry) => entry.date))},
            datasets: [{
              label: 'prozentuale Veränderung',
              data: ${JSON.stringify(
                data.map(
                  (entry) => (entry.sumThisYear / entry.sumLastYear - 1) * 100
                )
              )},
              backgroundColor(context) {
                const index = context.dataIndex
                const value = context.dataset.data[index]
                return value < 0 ? 'red' : 'blue'
              }
            }]
          },
          options: {
            
          }
        });
      </script>
      
    </body>
  </html>
`

fs.writeFileSync('./_output/index.html', output)

// ---- functions ------
