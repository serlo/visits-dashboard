const fs = require('fs')

const formattedDate = dateToLocaleDate(
  new Date(Date.now() - 1000 * 60 * 60 * 24)
)
console.log('cutoff (yesterday)', formattedDate)

const dates2022 = generateDateList('2023-07-20', formattedDate).reverse()

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

  console.log(json.ok)

  if (json.ok) {
    fs.writeFileSync(
      `./raw/deserloorg_${start}_${end}.json`,
      JSON.stringify(json)
    )
  }
}

//fetchStats('2022-01-01', '2022-01-01')

function generateDateList(startDate, endDate) {
  const dateList = []
  const currentDate = new Date(startDate)

  while (!dateList.includes(endDate)) {
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const day = String(currentDate.getDate()).padStart(2, '0')

    dateList.push(`${year}-${month}-${day}`)

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dateList
}

function dateToLocaleDate(date) {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/Berlin',
  }
  const formattedDate = date
    .toLocaleDateString('de-DE', options)
    .split('.')
    .reverse()
    .join('-')

  return formattedDate
}
