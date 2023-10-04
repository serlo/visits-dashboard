const fs = require('fs')
const utils = require('./utils')

const uuidIndex = require('../uuid_index.json')

const RM_ids = require('../realschule_mittelschule_aufgabenordner.json')

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

const rankingDatesThisYear = dates.slice(0, 90)

const rankingDatesLastYear = dates.slice(365, 365 + 90)

const dailyVisits = {}

const visitsByUuidThisYear = {}

const visitsByUuidLastYear = {}

const tags = new Set()

dates.forEach((date) => {
  try {
    const data = JSON.parse(
      fs.readFileSync(`./raw/deserloorg_${date}_${date}.json`, 'utf-8')
    )
    console.log(date)
    const byTag = {}

    const byId = {}

    const byReferrer = {}

    const needA = rankingDatesThisYear.includes(date)
    const needB = rankingDatesLastYear.includes(date)
    let realschule_mittelschule = 0
    data.datapoints.forEach((dp) => {
      const referrer = utils.tagReferrer(dp.document_referrer)
      if (!byReferrer[referrer]) byReferrer[referrer] = 0
      byReferrer[referrer]++

      const id = utils.pathToId(dp.path)
      if (id > 0) {
        if (RM_ids.includes(id)) {
          realschule_mittelschule++
          if (!byId[id]) byId[id] = 0
          byId[id]++
        }

        const type = uuidIndex[id]
        if (
          type &&
          (type == 'Article' ||
            type == 'ExerciseFolder' ||
            type == 'TaxonomyTerm' ||
            type == 'CoursePage' ||
            type == 'Course')
        ) {
          const t = type == 'Course' ? 'CoursePage' : type
          if (!byTag[t]) {
            byTag[t] = 0
            tags.add(t)
          }
          byTag[t]++
        }

        if (needA) {
          if (!visitsByUuidThisYear[id]) visitsByUuidThisYear[id] = 0
          visitsByUuidThisYear[id]++
        }

        if (needB) {
          if (!visitsByUuidLastYear[id]) visitsByUuidLastYear[id] = 0
          visitsByUuidLastYear[id]++
        }
      }
    })

    dailyVisits[date] = {
      sum: data.meta.amount,
      byTag,
      realschule_mittelschule,
      byId,
      byReferrer,
    }
  } catch (e) {
    console.log(e)
  }
})

const output = []

for (let i = 0; i + 89 + 365 < dates.length; i++) {
  let sumThisYear = 0
  let sumLastYear = 0

  let sumThisYearRM = 0
  let sumLastYearRM = 0

  let sumThisYearByTag = {}
  let sumLastYearByTag = {}

  let sumThisYearByUuid = {}
  let sumLastYearByUuid = {}

  let sumThisYearByReferrer = {}

  const referrer = [
    'no referrer',
    'search',
    'internal',
    'lms & co.',
    'sonstige',
  ]

  for (const r of referrer) {
    sumThisYearByReferrer[r] = 0
  }

  for (const tag of tags) {
    sumThisYearByTag[tag] = 0
    sumLastYearByTag[tag] = 0
  }

  for (const id of RM_ids) {
    sumThisYearByUuid[id] = 0
    sumLastYearByUuid[id] = 0
  }

  for (let j = 0; j < 90; j++) {
    sumThisYear += dailyVisits[dates[i + j]].sum || 0
    sumLastYear += dailyVisits[dates[i + j + 365]].sum || 0

    sumThisYearRM += dailyVisits[dates[i + j]].realschule_mittelschule || 0
    sumLastYearRM +=
      dailyVisits[dates[i + j + 365]].realschule_mittelschule || 0

    for (const tag of tags) {
      sumThisYearByTag[tag] += dailyVisits[dates[i + j]].byTag[tag] || 0
      sumLastYearByTag[tag] += dailyVisits[dates[i + j + 365]].byTag[tag] || 0
    }

    for (const id of RM_ids) {
      sumThisYearByUuid[id] += dailyVisits[dates[i + j]].byId[id] || 0
      sumLastYearByUuid[id] += dailyVisits[dates[i + j + 365]].byId[id] || 0
    }

    for (const r of referrer) {
      sumThisYearByReferrer[r] += dailyVisits[dates[i + j]].byReferrer[r] || 0
    }
  }

  output.push({
    date: dates[i],
    sumThisYear,
    sumLastYear,
    sumLastYearRM,
    sumThisYearRM,
    sumThisYearByTag,
    sumLastYearByTag,
    sumThisYearByUuid,
    sumLastYearByUuid,
    sumThisYearByReferrer,
  })
}

fs.writeFileSync(
  './intermediate/90_days_sliding.json',
  JSON.stringify(output, null, 2)
)

// generate ranking
const rankings = []

for (const id in uuidIndex) {
  if (visitsByUuidThisYear[id] || visitsByUuidLastYear[id]) {
    rankings.push({
      id,
      type: uuidIndex[id],
      visitsLastYear: visitsByUuidLastYear[id] || 0,
      visitsThisYear: visitsByUuidThisYear[id] || 0,
    })
  }
}

rankings.sort(
  (a, b) =>
    b.visitsThisYear - b.visitsLastYear - (a.visitsThisYear - a.visitsLastYear)
)

const topWinners = rankings.slice(0, 30)

const reversed = rankings.reverse()

const topLosers = reversed.slice(0, 30)

//console.log(topWinners, topLosers)

fs.writeFileSync(
  './intermediate/rankings.json',
  JSON.stringify({ topWinners, topLosers }, null, 2)
)
