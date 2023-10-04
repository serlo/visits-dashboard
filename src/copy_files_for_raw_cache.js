const fs = require('fs')
const utils = require('./utils')

const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24)
const oldestDate = new Date(
  yesterday.getTime() - 1000 * 60 * 60 * 24 * (365 * 2 + 88)
)

const dates = utils.generateDateList(
  utils.dateToLocaleDate(oldestDate),
  utils.dateToLocaleDate(yesterday)
)

fs.mkdirSync('./raw_cache')
for (const date of dates) {
  try {
    fs.copyFileSync(
      `./raw/deserloorg_${date}_${date}.json`,
      `./raw_cache/deserloorg_${date}_${date}.json`
    )
  } catch (e) {
    console.log(e)
  }
}
