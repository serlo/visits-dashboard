const fs = require('fs')

const data = require('./intermediate/90_days_sliding.json')

const rankings = require('./intermediate/rankings.json')

data.sort((a, b) => a.date.localeCompare(b.date))

const lastYear = data[data.length - 1].sumLastYear
const thisYear = data[data.length - 1].sumThisYear

const diff = thisYear - lastYear
const percent = (thisYear / lastYear - 1) * 100

const output = `
  <!doctype html>
  <html lang="de">
    <head>
    <meta charset=utf-8>
    <title>Reichweite und Entwicklung von Serlo</title>
    </head>
    <body style="margin-left:24px;maring-right:24px;">
      <h1>Reichweite und Entwicklung von Serlo</h1>

      <p>Stand: ${data[data.length - 1].date}</p>

      <p style="font-size:24px;">Daten beziehen sich nur auf <strong>de.serlo.org</strong>. Es wird immer die Summe der Seitenaufrufe der letzten 90 Tage betrachtet. Der Vergleich findet mit dem Vorjahr statt.
      </p>

      <h2>Übersicht</h2>

      <p>Aufrufe aktuell: ${thisYear}
      </p>
      
      <p>Aufrufe Vorjahr: ${lastYear}
      </p>

      <p>Entwicklung: <span style="color:${percent > 0 ? 'green' : 'red'}">${
  percent > 0 ? '+' : ''
}<strong>${percent.toFixed(2)}%, ${diff}</strong></span>
      </p>
      
      <h2>Anzahl Aufrufe</h2>
      
      <div style="width:100%;height:600px;position: relative;">
        <canvas id="chart1"></canvas>
      </div>
      
      <h2>Veränderung zum Vorjahr in Prozent</h2>
      
      <div style="width:100%;height:600px;position: relative;">
        <canvas id="chart2"></canvas>
      </div>

      <h2>Aufrufe: Anteil pro Inhaltstyp</h2>
      
      <div style="width:100%;height:600px;position: relative;">
        <canvas id="chart5"></canvas>
      </div>
      
      <h2>Artikel: Anzahl Aufrufe</h2>

      <div style="width:100%;height:600px;position: relative;">
        <canvas id="chart3"></canvas>
      </div>
      
      <h2>Artikel: Veränderung zum Vorjahr in Prozent</h2>
      
      <div style="width:100%;height:600px;position: relative;">
        <canvas id="chart3_rel"></canvas>
      </div>

      
      <h2>Aufgabenordner: Anzahl Aufrufe</h2>

      <div style="width:100%;height:600px;position: relative;">
        <canvas id="chart4"></canvas>
      </div>
      
      <h2>Aufgabenordner: Veränderung zum Vorjahr in Prozent</h2>
      
      <div style="width:100%;height:600px;position: relative;">
        <canvas id="chart4_rel"></canvas>
      </div>

      <h2>Inhalte mit größtem Wachstum</h2>

      <table>
        <thead>
          <tr>
            <th>Platz</th>
            <th>Inhalt</th>
            <th>Typ</th>
            <th>Aufrufe Vorjahr</th>
            <th>Aufrufe dieses Jahr</th>
            <th>Veränderung (relativ)</th>
            <th>Veränderung (absolut)</th>
          </tr>
        </thead>
        <tbody>
          ${rankings.topWinners
            .map((entry, i) => {
              return `
              <tr>
                <td>${i + 1}</td>
                <td>${decodeURIComponent(entry.alias)}</td>
                <td>${entry.type}</td>
                <td>${entry.visitsLastYear}</td>
                <td>${entry.visitsThisYear}</td>
                <td style="color: green">+ ${(
                  (entry.visitsThisYear / entry.visitsLastYear - 1) *
                  100
                ).toFixed(2)}%</td>
                <td style="color: green">+ ${
                  entry.visitsThisYear - entry.visitsLastYear
                }</td>
              </tr>
            `
            })
            .join('')}
        </tbody>
      </table>

      <h2>Inhalte mit größtem Verlust</h2>

      <table>
        <thead>
          <tr>
            <th>Platz</th>
            <th>Inhalt</th>
            <th>Typ</th>
            <th>Aufrufe Vorjahr</th>
            <th>Aufrufe dieses Jahr</th>
            <th>Veränderung (relativ)</th>
            <th>Veränderung (absolut)</th>
          </tr>
        </thead>
        <tbody>
          ${rankings.topLosers
            .map((entry, i) => {
              return `
              <tr>
                <td>${i + 1}</td>
                <td>${decodeURIComponent(entry.alias)}</td>
                <td>${entry.type}</td>
                <td>${entry.visitsLastYear}</td>
                <td>${entry.visitsThisYear}</td>
                <td style="color: red">${(
                  (entry.visitsThisYear / entry.visitsLastYear - 1) *
                  100
                ).toFixed(2)}%</td>
                <td style="color: red">${
                  entry.visitsThisYear - entry.visitsLastYear
                }</td>
              </tr>
            `
            })
            .join('')}
        </tbody>
      </table>

      <div style="height:200px;"/>

      <style>
        table, th, td {
          border: 1px solid black;
          border-collapse: collapse;
        }
        td, th {
          padding: 4px;
          padding-left: 12px;
          padding-right: 12px;
        }
      </style>
      
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
            },
            maintainAspectRatio: false,
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
                return value < 0 ? 'red' : 'green'
              }
            }]
          },
          options: {
            maintainAspectRatio: false,
          }
        });

        const ctx3 = document.getElementById('chart3');

        new Chart(ctx3, {
          type: 'line',
          data: {
            labels: ${JSON.stringify(data.map((entry) => entry.date))},
            datasets: [{
              label: 'dieses Jahr',
              data: ${JSON.stringify(
                data.map((entry) => entry.sumThisYearByTag['Article'])
              )},
            },
            {
              label: 'letztes Jahr',
              data: ${JSON.stringify(
                data.map((entry) => entry.sumLastYearByTag['Article'])
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

        const ctx3_rel = document.getElementById('chart3_rel');

        new Chart(ctx3_rel, {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(data.map((entry) => entry.date))},
            datasets: [{
              label: 'prozentuale Veränderung',
              data: ${JSON.stringify(
                data.map(
                  (entry) =>
                    (entry.sumThisYearByTag['Article'] /
                      entry.sumLastYearByTag['Article'] -
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

        const ctx4 = document.getElementById('chart4');

        new Chart(ctx4, {
          type: 'line',
          data: {
            labels: ${JSON.stringify(data.map((entry) => entry.date))},
            datasets: [{
              label: 'dieses Jahr',
              data: ${JSON.stringify(
                data.map((entry) => entry.sumThisYearByTag['ExerciseFolder'])
              )},
            },
            {
              label: 'letztes Jahr',
              data: ${JSON.stringify(
                data.map((entry) => entry.sumLastYearByTag['ExerciseFolder'])
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

        const ctx4_rel = document.getElementById('chart4_rel');

        new Chart(ctx4_rel, {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(data.map((entry) => entry.date))},
            datasets: [{
              label: 'prozentuale Veränderung',
              data: ${JSON.stringify(
                data.map(
                  (entry) =>
                    (entry.sumThisYearByTag['ExerciseFolder'] /
                      entry.sumLastYearByTag['ExerciseFolder'] -
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

        const ctx5 = document.getElementById('chart5');

        new Chart(ctx5, {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(data.map((entry) => entry.date))},
            datasets: [{
              label: 'Artikel',
              data: ${JSON.stringify(
                data.map(
                  (entry) =>
                    (entry.sumThisYearByTag['Article'] / entry.sumThisYear) *
                    100
                )
              )},
            },
            {
              label: 'Aufgabenordner',
              data: ${JSON.stringify(
                data.map(
                  (entry) =>
                    (entry.sumThisYearByTag['ExerciseFolder'] /
                      entry.sumThisYear) *
                    100
                )
              )},
            },{
              label: 'Taxonomie',
              data: ${JSON.stringify(
                data.map(
                  (entry) =>
                    (entry.sumThisYearByTag['TaxonomyTerm'] /
                      entry.sumThisYear) *
                    100
                )
              )},
            },{
              label: 'Kurse',
              data: ${JSON.stringify(
                data.map(
                  (entry) =>
                    (entry.sumThisYearByTag['CoursePage'] / entry.sumThisYear) *
                    100
                )
              )},
            },{
              label: 'Sonstiges',
              data: ${JSON.stringify(
                data.map(
                  (entry) =>
                    ((entry.sumThisYear -
                      entry.sumThisYearByTag['Article'] -
                      entry.sumThisYearByTag['ExerciseFolder'] -
                      entry.sumThisYearByTag['TaxonomyTerm'] -
                      entry.sumThisYearByTag['CoursePage']) /
                      entry.sumThisYear) *
                    100
                )
              )},
            },]
          },
          options: {
            responsive: true,
            scales: {
              x: {
                stacked: true,
              },
              y: {
                stacked: true,
                min: 0,
                max: 100,
              }
            },
            maintainAspectRatio: false,
          }
        });

      </script>
      
    </body>
  </html>
`

fs.writeFileSync('./_output/index.html', output)

// ---- functions ------
