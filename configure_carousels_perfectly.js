const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('index.html', 'utf8');
const $ = cheerio.load(html, { decodeEntities: false });

// 1. Remove previous custom styles and scripts
$('#custom-treadmill-styles').remove();
$('#custom-carousel-script').remove();
$('style').each((i, el) => {
  const text = $(el).text();
  if (text.includes('transição do carrossel para ser linear') || text.includes('transição linear contínua')) {
    $(el).remove();
  }
});

// 2. Inject the custom CSS style in <head> for ALL image-based carousels (both standard and nested)
const customCSS = `
<style id="custom-treadmill-styles">
/* Força a transição linear contínua nos carrosséis de imagem (efeito esteira) */
.elementor-widget-image-carousel .swiper-wrapper,
.e-n-carousel .swiper-wrapper {
    -webkit-transition-timing-function: linear !important;
    transition-timing-function: linear !important;
}
</style>
`;
$('head').append(customCSS);

// 3. Update static HTML data-settings for image carousels
$('.elementor-widget-image-carousel').each((i, el) => {
  const settingsAttr = $(el).attr('data-settings');
  if (settingsAttr) {
    try {
      const settings = JSON.parse(settingsAttr);
      settings.autoplay = "yes";
      settings.autoplay_speed = 0; // 0 delay for marquee
      settings.speed = 6000; // 6 seconds smooth scroll
      settings.pause_on_hover = "no"; 
      settings.pause_on_interaction = "no";
      settings.infinite = "yes";
      $(el).attr('data-settings', JSON.stringify(settings));
    } catch (e) {
      console.error("Error parsing settings for image carousel", i);
    }
  }
});

// 4. Update static HTML data-settings for nested carousels (Cursos Livres / e-n-carousel)
$('.elementor-widget-n-carousel').each((i, el) => {
  const settingsAttr = $(el).attr('data-settings');
  if (settingsAttr) {
    try {
      const settings = JSON.parse(settingsAttr);
      settings.autoplay = "yes";
      settings.autoplay_speed = 0; // 0 delay for marquee
      settings.speed = 6000; // 6 seconds smooth scroll
      settings.pause_on_hover = "no"; 
      settings.pause_on_interaction = "no";
      settings.infinite = "yes";
      $(el).attr('data-settings', JSON.stringify(settings));
    } catch (e) {
      console.error("Error parsing settings for nested carousel", i);
    }
  }
});

// 5. Inject the robust native runtime manager script with jQuery polling at the end of <body>
const customJS = `
<script id="custom-carousel-script">
(function() {
    function startAndConfigureSwipers() {
        jQuery('.swiper-container, .swiper').each(function() {
            var $swiperEl = jQuery(this);
            var swiperInstance = $swiperEl.data('swiper') || this.swiper;
            
            if (swiperInstance && swiperInstance.autoplay) {
                // Configure Swiper native params for all carousels to achieve smooth marquee (esteira)
                swiperInstance.params.autoplay.delay = 0;
                swiperInstance.params.autoplay.disableOnInteraction = false;
                swiperInstance.params.autoplay.pauseOnMouseEnter = false; // Disabled to prevent desktop freezes
                
                // Continuous glide speed
                swiperInstance.params.speed = 6000;
                
                // Force Swiper parameters update
                swiperInstance.update();
                
                // Wake up autoplay if not running
                if (!swiperInstance.autoplay.running) {
                    swiperInstance.autoplay.run();
                    swiperInstance.autoplay.start();
                }
                
                // Remove all manual hover event listeners
                $swiperEl.off('mouseenter mouseleave');
            }
        });
    }

    // Poll for jQuery to be loaded to completely avoid any script loading race conditions
    var checkCount = 0;
    var jQueryPoll = setInterval(function() {
        checkCount++;
        if (typeof jQuery !== 'undefined') {
            clearInterval(jQueryPoll);
            
            // Execute configuration immediately and then schedule followups to handle Elementor delayed init
            startAndConfigureSwipers();
            
            setTimeout(startAndConfigureSwipers, 500);
            setTimeout(startAndConfigureSwipers, 1500);
            setTimeout(startAndConfigureSwipers, 3000);
            
            window.addEventListener('load', startAndConfigureSwipers);
            window.addEventListener('scroll', startAndConfigureSwipers);
            
            // Listen to Elementor init
            jQuery(window).on('elementor/frontend/init', function() {
                setTimeout(startAndConfigureSwipers, 500);
            });
        } else if (checkCount > 100) { // Stop polling after 5 seconds to save resources if jQuery fails
            clearInterval(jQueryPoll);
            console.warn('jQuery not found. Carousel config skipped.');
        }
    }, 50);
})();
</script>
`;
$('body').append(customJS);

fs.writeFileSync('index.html', $.html());
console.log('Successfully configured all carousels natively with robust jQuery polling!');
