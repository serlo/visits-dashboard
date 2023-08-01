const fs = require('fs')
const utils = require('./utils')

const paths = require('./intermediate/paths.json')

const uuids = new Set()

paths.forEach((path) => {
  const id = utils.pathToId(path)
  if (id > 0) {
    uuids.add(id)
  }
})

fs.writeFileSync('./intermediate/uuids.json', JSON.stringify(Array.from(uuids)))
