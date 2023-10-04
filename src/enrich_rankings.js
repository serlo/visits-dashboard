const fs = require('fs')
const rankings = require('../intermediate/rankings.json')

let cache = {}

if (fs.existsSync('./alias_cache.json')) {
  cache = JSON.parse(fs.readFileSync('./alias_cache.json', 'utf-8'))
}

run()

async function run() {
  for (const entry of rankings.topWinners.concat(rankings.topLosers)) {
    if (cache[entry.id]) {
      entry.alias = cache[entry.id]
    } else {
      const res = await fetch('https://de.serlo.org/' + entry.id)
      const url = res.url.replace('https://de.serlo.org', '')
      entry.alias = url
      console.log('fetching', entry.id, entry.alias)
      cache[entry.id] = url
    }
  }
  fs.writeFileSync(
    './intermediate/rankings.json',
    JSON.stringify(rankings, null, 2)
  )
  fs.writeFileSync(
    './intermediate/alias_cache.json',
    JSON.stringify(cache, null, 2)
  )
  process.exit()
}
