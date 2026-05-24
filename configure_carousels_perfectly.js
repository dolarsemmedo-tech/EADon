const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('index.html', 'utf8');
const $ = cheerio.load(html, { decodeEntities: false });

// 1. Remove previous custom styles, scripts, and specifically the old style block hiding arrows/applying masks
$('#custom-carousel-premium-styles').remove();
$('#custom-carousel-script').remove();
$('style').each((i, el) => {
  const text = $(el).text();
  if (
    text.includes('transição do carrossel para ser linear') || 
    text.includes('transição linear contínua') || 
    text.includes('efeito esteira') || 
    text.includes('Ocultar as setas já que agora o carrossel roda sozinho') || 
    text.includes('Efeito de fade (dissolver) nas bordas') || 
    text.includes('elementor-swiper-button') && text.includes('display: none !important')
  ) {
    $(el).remove();
  }
});

// 2. Inject CSS to force navigation arrows to be positioned inside and beautifully styled
const customCSS = `
<style id="custom-carousel-premium-styles">
/* Garante que o container pai tenha posicionamento relativo para conter as setas absolutas */
.elementor-image-carousel-wrapper,
.e-n-carousel,
.swiper {
    position: relative !important;
    mask-image: none !important;
    -webkit-mask-image: none !important;
}

/* Garante que as setas de navegação do Swiper fiquem visíveis, com bom contraste e cursor de clique */
.swiper-button-next,
.swiper-button-prev,
.elementor-swiper-button-next,
.elementor-swiper-button-prev {
    display: flex !important;
    align-items: center;
    justify-content: center;
    color: #1b855a !important; /* Verde principal do site */
    background: rgba(255, 255, 255, 0.95) !important;
    width: 44px !important;
    height: 44px !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
    transition: all 0.3s ease !important;
    cursor: pointer !important;
    z-index: 100 !important;
    opacity: 1 !important;
    visibility: visible !important;
    border: none !important;
}

/* Posiciona a seta esquerda dentro do carrossel */
.swiper-button-prev,
.elementor-swiper-button-prev {
    left: 15px !important;
    right: auto !important;
    position: absolute !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
}

/* Posiciona a seta direita dentro do carrossel */
.swiper-button-next,
.elementor-swiper-button-next {
    right: 15px !important;
    left: auto !important;
    position: absolute !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
}

/* Efeito Hover nas setas */
.swiper-button-next:hover,
.swiper-button-prev:hover,
.elementor-swiper-button-next:hover,
.elementor-swiper-button-prev:hover {
    transform: translateY(-50%) scale(1.1) !important;
    background: #1b855a !important;
    color: #ffffff !important;
}

/* Garante tamanho e cor corretos para os ícones das setas */
.swiper-button-next svg,
.swiper-button-prev svg,
.elementor-swiper-button-next svg,
.elementor-swiper-button-prev svg {
    width: 18px !important;
    height: 18px !important;
    fill: currentColor !important;
    display: block !important;
}

/* Otimização dos bullets de paginação inferior */
.swiper-pagination-bullet {
    background: #cccccc !important;
    opacity: 0.6 !important;
    width: 10px !important;
    height: 10px !important;
    transition: all 0.3s ease !important;
    cursor: pointer !important;
}

.swiper-pagination-bullet-active {
    background: #1b855a !important;
    opacity: 1 !important;
    width: 24px !important; /* Bullet ativo esticado moderno */
    border-radius: 5px !important;
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
      settings.autoplay_speed = 4000; 
      settings.speed = 800; 
      settings.pause_on_hover = "yes"; 
      settings.pause_on_interaction = "no"; 
      settings.infinite = "yes";
      settings.arrows = "yes"; // Enable arrows
      settings.pagination = "bullets"; 
      $(el).attr('data-settings', JSON.stringify(settings));
    } catch (e) {
      console.error("Error parsing settings for image carousel", i);
    }
  }
});

// 4. Update static HTML data-settings for nested carousels (Cursos Livres)
$('.elementor-widget-n-carousel').each((i, el) => {
  const settingsAttr = $(el).attr('data-settings');
  if (settingsAttr) {
    try {
      const settings = JSON.parse(settingsAttr);
      settings.autoplay = "yes";
      settings.autoplay_speed = 4000; 
      settings.speed = 800; 
      settings.pause_on_hover = "yes"; 
      settings.pause_on_interaction = "no"; 
      settings.infinite = "yes";
      settings.arrows = "yes"; // Enable arrows
      settings.pagination = "bullets"; 
      $(el).attr('data-settings', JSON.stringify(settings));
    } catch (e) {
      console.error("Error parsing settings for nested carousel", i);
    }
  }
});

// 5. Inject the robust active Swiper polling manager script at the end of <body>
const customJS = `
<script id="custom-carousel-script">
(function() {
    var configuredCount = 0;
    var totalSwipers = 2; // Cursos Reconhecidos, Cursos Livres
    var swiperPollInterval = null;
    
    function startAndConfigureSwipers() {
        if (typeof jQuery === 'undefined') return;
        
        jQuery('.swiper-container, .swiper').each(function() {
            var $swiperEl = jQuery(this);
            
            // Skip if already configured
            if ($swiperEl.attr('data-configured') === 'true') return;
            
            var swiperInstance = $swiperEl.data('swiper') || this.swiper;
            
            if (swiperInstance && swiperInstance.autoplay) {
                // Configure Swiper native params for standard premium sliding carousels
                swiperInstance.params.autoplay.delay = 4000; 
                swiperInstance.params.autoplay.disableOnInteraction = false;
                swiperInstance.params.autoplay.pauseOnMouseEnter = true; 
                
                // Normal transition speed and premium easing
                swiperInstance.params.speed = 800;
                
                // Force Swiper parameters update
                swiperInstance.update();
                
                // Wake up autoplay
                if (!swiperInstance.autoplay.running) {
                    swiperInstance.autoplay.run();
                    swiperInstance.autoplay.start();
                }
                
                // Mark as successfully configured
                $swiperEl.attr('data-configured', 'true');
                configuredCount++;
                console.log('Successfully configured Swiper instance #' + configuredCount + ' (Premium Carousel mode)');
            }
        });
        
        // Once all 3 carousels are successfully configured, stop polling
        if (configuredCount >= totalSwipers && swiperPollInterval) {
            clearInterval(swiperPollInterval);
            console.log('All Swiper carousels successfully initialized in Premium Carousel mode.');
        }
    }

    // Poll for jQuery to be loaded to completely avoid any script loading race conditions
    var checkCount = 0;
    var jQueryPoll = setInterval(function() {
        checkCount++;
        if (typeof jQuery !== 'undefined') {
            clearInterval(jQueryPoll);
            
            // Start polling for Swiper initialization every 200ms
            swiperPollInterval = setInterval(startAndConfigureSwipers, 200);
            
            // Also run on scroll/load just in case
            window.addEventListener('load', startAndConfigureSwipers);
            window.addEventListener('scroll', startAndConfigureSwipers);
            
            // Safety timeout: stop polling after 15 seconds to save resources if some carousels don't exist
            setTimeout(function() {
                if (swiperPollInterval) {
                    clearInterval(swiperPollInterval);
                }
            }, 15000);
        } else if (checkCount > 200) { // Stop polling after 10 seconds if jQuery fails
            clearInterval(jQueryPoll);
            console.warn('jQuery not found. Carousel config skipped.');
        }
    }, 50);
})();
</script>
`;
$('body').append(customJS);

fs.writeFileSync('index.html', $.html());
console.log('Successfully configured all carousels natively in Premium Carousel mode with fully visible, positioned arrows and mask-image disabled!');
