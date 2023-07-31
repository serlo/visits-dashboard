const fs = require('fs')

const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24)
const oldestDate = new Date(
  yesterday.getTime() - 1000 * 60 * 60 * 24 * (365 * 2 + 88)
)

const dates = generateDateList(
  dateToLocaleDate(oldestDate),
  dateToLocaleDate(yesterday)
).reverse()

console.log(dates[0], dates[dates.length - 1])

console.log(dates)

const dailyVisits = {}

dates.forEach((date) => {
  try {
    const data = JSON.parse(
      fs.readFileSync(`./raw/deserloorg_${date}_${date}.json`, 'utf-8')
    )
    dailyVisits[date] = data.meta.amount
  } catch (e) {}
})

const output = []

for (let i = 0; i + 89 + 365 < dates.length; i++) {
  let sumThisYear = 0
  let sumLastYear = 0

  for (let j = 0; j < 90; j++) {
    sumThisYear += dailyVisits[dates[i + j]] || 0
    sumLastYear += dailyVisits[dates[i + j + 365]] || 0
  }

  output.push({
    date: dates[i],
    sumThisYear,
    sumLastYear,
  })
}

fs.writeFileSync(
  './intermediate/90_days_sliding.json',
  JSON.stringify(output, null, 2)
)

// ----- functions

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
