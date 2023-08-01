const fs = require('fs')
const utils = require('./utils')

const formattedDate = utils.dateToLocaleDate(
  new Date(Date.now() - 1000 * 60 * 60 * 24)
)
console.log('cutoff (yesterday)', formattedDate)

const dates2022 = utils.generateDateList('2023-07-20', formattedDate).reverse()

run()

async function run() {
  for (const date of dates2022) {
    if (fs.existsSync(`./raw/deserloorg_${date}_${date}.json`)) {
      console.log('skip', date)
      continue
    }
    console.log(date)
    await fetchStats(date, date)
  }
}

async function fetchStats(start, end) {
  const res = await fetch(
    `https://simpleanalytics.com/api/export/datapoints?version=5&format=json&hostname=de.serlo.org&start=${start}&end=${end}&robots=false&timezone=Europe%2FBerlin&fields=added_unix%2Cdevice_type%2Cdocument_referrer%2Cpath%2Cquery&type=pageviews`,
    {
      headers: {
        'Api-Key': process.env.SA_KEY,
      },
    }
  )
  const json = await res.json()

  if (json.ok || json.meta) {
    fs.writeFileSync(
      `./raw/deserloorg_${start}_${end}.json`,
      JSON.stringify(json)
    )
  }
}
