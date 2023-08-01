const fs = require('fs')
const rankings = require('./intermediate/rankings.json')

run()

async function run() {
  for (const entry of rankings.topWinners.concat(rankings.topLosers)) {
    const res = await fetch('https://de.serlo.org/' + entry.id)
    const url = res.url.replace('https://de.serlo.org', '')
    entry.alias = url
    console.log(entry.id, entry.alias)
  }
  fs.writeFileSync(
    './intermediate/rankings.json',
    JSON.stringify(rankings, null, 2)
  )
  process.exit()
}
