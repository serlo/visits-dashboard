const fs = require('fs')

const uuidIndex = require('../uuid_index.json')

const uuids = require('../intermediate/uuids.json')

console.log(
  'uuids',
  uuids.length,
  'already there',
  Object.keys(uuidIndex).length
)

run()

async function run() {
  let counter = 0
  for (const uuid of uuids) {
    if (uuidIndex[uuid]) continue
    try {
      const type = await getType(uuid)
      uuidIndex[uuid] = type
      counter++
      console.log(uuid, type)
      if (counter % 10 === 0) {
        save()
      }
    } catch (e) {
      console.log('Error file fetching', uuid)
      uuidIndex[uuid] = 'unknown'
    }
  }
  save()
}

function save() {
  console.log('saving')
  fs.writeFileSync('./uuid_index.json', JSON.stringify(uuidIndex))
}

async function getType(id) {
  const graphqlQuery = `
    {
      uuid(id: ${id}) {
        __typename
        ... on TaxonomyTerm {
          type
        }
      }
    }
  `

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: graphqlQuery,
    }),
  }

  const res = await fetch('https://api.serlo.org/graphql', requestOptions)
  const json = await res.json()

  const typename = json.data.uuid.__typename
  const type = json.data.uuid.type

  if (typename == 'TaxonomyTerm') {
    if (type == 'exerciseFolder') {
      return 'ExerciseFolder'
    }
  }

  return typename
}
