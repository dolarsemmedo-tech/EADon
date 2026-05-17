const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('index.html', 'utf8');
const $ = cheerio.load(html);

console.log('Children of elementor-element-7ef56d00:');
$('.elementor-element-7ef56d00').find('*').each((i, el) => {
    console.log(`Tag: ${$(el).prop('tagName')}, Classes: ${$(el).attr('class') || 'none'}`);
});
