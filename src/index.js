const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const tress = require('tress');

let results = [];

const q = tress(({ page, text }, done) => {
  axios.get(getUrl({ text, page }))
    .then(res => {
      const parsedData = getData(res.data);
      results = [
        ...results,
        ...parsedData
      ]
      done(null);
    })
})

q.drain = function(){
  console.log('Finished', results);
  fs.writeFileSync('./result.json', JSON.stringify(results, null, 3));
};

q.success = function(data) {
  console.log('Success');
  console.log(results)
}


for(let i = 0; i < 100; i++) {
  q.push({ text: 'Frontend', page: i })
}



function getUrl({ text, page }) { 
  return `https://ekaterinburg.hh.ru/search/vacancy?only_with_salary=false&clusters=true&area=3&enable_snippets=true&salary=&st=searchVacancy&text=${text}&from=suggest_post&page=${page}`; 
}

function getData(html) {
  const data = [];
  const $ = cheerio.load(html);
  $('.vacancy-serp-item').each((i, elem) => {
    data.push({
      title: $(elem).find('.resume-search-item__name').text(),
      link: $(elem).find('.resume-search-item__name a').attr('href')
    })
  })

  return data;
}