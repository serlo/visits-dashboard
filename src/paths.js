const fs = require('fs')
const utils = require('./utils')

const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24)
const oldestDate = new Date(
  yesterday.getTime() - 1000 * 60 * 60 * 24 * (365 * 2 + 88)
)

const dates = utils
  .generateDateList(
    utils.dateToLocaleDate(oldestDate),
    utils.dateToLocaleDate(yesterday)
  )
  .reverse()

console.log(dates[0], dates[dates.length - 1])

const paths = new Set()

for (const date of dates) {
  const data = JSON.parse(
    fs.readFileSync(`./raw/deserloorg_${date}_${date}.json`, 'utf-8')
  )
  console.log(date)
  data.datapoints.forEach((dp) => {
    paths.add(dp.path)
  })
}

console.log(paths.size)

fs.writeFileSync('./intermediate/paths.json', JSON.stringify(Array.from(paths)))
