const fs = require('fs')

const RM_ids = require('../realschule_mittelschule_aufgabenordner.json')

const index = {}

run()

async function run() {
  for (const id of RM_ids) {
    const res = await fetch('https://de.serlo.org/' + id)
    const url = res.url.replace('https://de.serlo.org', '')
    index[id] = url
    console.log(id, url)
  }
  fs.writeFileSync('./rm_url_index.json', JSON.stringify(index, null, 2))
  process.exit()
}
