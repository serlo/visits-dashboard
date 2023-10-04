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

function pathToId(path) {
  const regex = /^\/[^/]+\/(\d+)\/[^/]+$/
  const match = path.match(regex)

  const regex2 = /^\/(\d+)$/
  const match2 = path.match(regex2)

  let id = -1

  if (match) {
    id = parseInt(match[1])
  }
  if (match2) {
    id = parseInt(match2[1])
  }
  return id
}

const searchEngines = [
  'http://bing.com/',
  'http://ecosia.org/',
  'http://duckduckgo.com/',
  'http://startpage.com/',
  'http://search.brave.com/',
  'http://de.search.yahoo.com/',
  'http://suche.t-online.de/',
  'http://at.search.yahoo.com/',
  'http://qwant.com/',
  'http://ch.search.yahoo.com/',
  'http://search.yahoo.com/',
  'http://r.search.yahoo.com/',
  'http://fragfinn.de/',
  'http://android-app//com.google.android.googlequicksearchbox/',
  'http://bing.com/search',
]

const lms = [
  'http://lernwelt.biz/',
  'http://lernplattform.mebis.bayern.de/',
  'http://resource.itslearning.com/',
  'http://bildungsserver.de/',
  'http://applications.itslearning.com/',
  'http://classroom.google.com/',
  'http://bildungsserver.hamburg.de/',
  'http://taskcards.de/',
  'http://assignments.onenote.com/',
  'http://start.schulportal.hessen.de/',
  'http://oembeditslearning.com/',
  'http://lernwelt.biz/schulnetz/ERSMerzig/default.aspx',
  'http://lms.bildung-rp.de/',
  'http://lms.lernen.hamburg/',
  'http://eduvidual.at/',
  'http://page.itslearning.com/',
  'http://learningview.org/',
  'http://hb.itslearning.com/',
  'http://jsg-karlstadt.de/',
  'http://mint-erleben.lu.ch/',
  'http://moodle.bildung-lsa.de/',
  'http://statics.teams.cdn.office.net/',
  'http://login.schulmanager-online.de/',
  'http://lernraum-berlin.de/',
  'http://moodle.fhnw.ch/',
  'http://elearning-mcg.de/',
  'http://teams.microsoft.com/',
  'http://lms2.schulcampus-rlp.de/',
  'http://moodle.hs-anhalt.de/',
  'http://redirect.homeworker.li/',
  'http://assignment.itslearning.com/',
]

function tagReferrer(r) {
  if (!r) return 'no referrer'

  if (r.startsWith('http://de.serlo.org')) {
    return 'internal'
  }

  if (r.startsWith('http://google') || searchEngines.includes(r)) {
    return 'search'
  }

  if (lms.includes(r)) {
    return 'lms & co.'
  }

  return 'sonstige'
}

module.exports = {
  generateDateList,
  dateToLocaleDate,
  pathToId,
  tagReferrer,
}
