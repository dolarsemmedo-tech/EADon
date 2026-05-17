const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('index.html', 'utf8');
const $ = cheerio.load(html, { decodeEntities: false });

// 1. Remove previous treadmill style if it exists
$('#custom-treadmill-styles').remove();
$('style').each((i, el) => {
    const text = $(el).text();
    if (text.includes('transição do carrossel para ser linear')) {
        $(el).remove();
    }
});

// 2. Inject the CSS style to force linear transitions (essential for treadmill effect, otherwise Swiper freezes with autoplay_speed=0)
const treadmillCSS = `
<style id="custom-treadmill-styles">
/* Força a transição do carrossel para ser linear (efeito esteira) */
.elementor-widget-image-carousel .swiper-wrapper,
.elementor-widget-n-carousel .swiper-wrapper,
.e-n-carousel .swiper-wrapper {
    -webkit-transition-timing-function: linear !important;
    transition-timing-function: linear !important;
}
</style>
`;
$('head').append(treadmillCSS);

// 3. Configure settings for all carousels
let updated = 0;
function updateSettings(selector) {
    $(selector).each((i, el) => {
        const settingsAttr = $(el).attr('data-settings');
        if (settingsAttr) {
            try {
                const settings = JSON.parse(settingsAttr);
                settings.autoplay = "yes";
                settings.autoplay_speed = 0; // 0 delay = continuous scroll
                settings.speed = 4000; // 4 seconds transition for ultra-smoothness
                settings.pause_on_hover = "yes"; // pause when user hovers
                settings.pause_on_interaction = "no"; // resume scrolling after user interacts/swipes
                settings.infinite = "yes";
                $(el).attr('data-settings', JSON.stringify(settings));
                updated++;
            } catch (e) {
                console.error("Error parsing settings for element", i);
            }
        }
    });
}

updateSettings('.elementor-widget-image-carousel');
updateSettings('.e-n-carousel');
updateSettings('.elementor-widget-n-carousel');

fs.writeFileSync('index.html', $.html());
console.log(`Re-applied continuous treadmill settings and linear CSS transitions for ${updated} carousels.`);
