const fs = require('fs')

const dates = generateDateList('2021-05-03', '2023-07-31').reverse()

const dailyVisits = {}

dates.forEach(date => {
  try {
    const data = JSON.parse(fs.readFileSync(`./raw/deserloorg_${date}_${date}.json`, 'utf-8'))
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
    sumThisYear, sumLastYear
  })
}

fs.writeFileSync('./intermediate/90_days_sliding.json', JSON.stringify(output, null, 2))

// ----- functions

function generateDateList(startDate, endDate) {
  const dateList = [];
  const currentDate = new Date(startDate);
  const targetDate = new Date(endDate);

  while (currentDate <= targetDate) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    dateList.push(`${year}-${month}-${day}`);

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateList;
}