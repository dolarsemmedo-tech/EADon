const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('index.html', 'utf8');
const $ = cheerio.load(html, { decodeEntities: false });

// Remove previous styles and scripts to update cleanly
$('style').each((i, el) => {
    const text = $(el).text();
    if (text.includes('SISTEMA DE ANIMAÇÃO AO ROLAR A TELA (SCROLL REVEAL)')) {
        $(el).remove();
    }
});
$('#custom-scroll-reveal-script').remove();

const fixedStyles = `
<style id="custom-scroll-reveal-styles">
/* ========================================================
   SISTEMA DE ANIMAÇÃO AO ROLAR A TELA (SCROLL REVEAL) - FIX
   ======================================================== */

/* Configuração Inicial dos Títulos (Invisível) */
.elementor-element-4827e1c7, 
.elementor-element-36b75d89,
.elementor-element-38869286 {
    opacity: 0 !important;
    transform: translateY(30px) !important;
    transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

/* Configuração Inicial dos Itens da Lista (Invisível) */
.elementor-element-7ef56d00 .elementor-icon-list-item,
.elementor-element-1018c2ab .elementor-icon-list-item,
.elementor-element-20b1ea80 .elementor-icon-list-item {
    opacity: 0 !important;
    transform: translateY(20px) !important;
    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

/* Quando os elementos individuais (títulos) ganham a classe active */
.reveal-active {
    opacity: 1 !important;
    transform: translateY(0) !important;
}

/* Quando o CONTAINER PAI da lista ganha a classe active, revela os filhos */
.elementor-element-7ef56d00.reveal-active .elementor-icon-list-item,
.elementor-element-1018c2ab.reveal-active .elementor-icon-list-item,
.elementor-element-20b1ea80.reveal-active .elementor-icon-list-item {
    opacity: 1 !important;
    transform: translateY(0) !important;
}

/* Efeito Cascata (Staggered Delay) na Seção 1 (Hero) - Revela itens um por um */
.elementor-element-7ef56d00.reveal-active .elementor-icon-list-item:nth-child(1),
.elementor-element-1018c2ab.reveal-active .elementor-icon-list-item:nth-child(1) { transition-delay: 0.1s !important; }
.elementor-element-7ef56d00.reveal-active .elementor-icon-list-item:nth-child(2),
.elementor-element-1018c2ab.reveal-active .elementor-icon-list-item:nth-child(2) { transition-delay: 0.3s !important; }
.elementor-element-7ef56d00.reveal-active .elementor-icon-list-item:nth-child(3),
.elementor-element-1018c2ab.reveal-active .elementor-icon-list-item:nth-child(3) { transition-delay: 0.5s !important; }
.elementor-element-7ef56d00.reveal-active .elementor-icon-list-item:nth-child(4),
.elementor-element-1018c2ab.reveal-active .elementor-icon-list-item:nth-child(4) { transition-delay: 0.7s !important; }

/* Efeito Cascata (Staggered Delay) na Seção 2 (Por que Acessar) */
.elementor-element-20b1ea80.reveal-active .elementor-icon-list-item:nth-child(1) { transition-delay: 0.2s !important; }
.elementor-element-20b1ea80.reveal-active .elementor-icon-list-item:nth-child(2) { transition-delay: 0.4s !important; }
.elementor-element-20b1ea80.reveal-active .elementor-icon-list-item:nth-child(3) { transition-delay: 0.6s !important; }


/* Animação Contínua do Foguete (Sempre ativa) */
@keyframes rocketFloat {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(4deg); }
    100% { transform: translateY(0px) rotate(0deg); }
}

.elementor-element-2138700f {
    animation: rocketFloat 5s ease-in-out infinite !important;
    transform-origin: center bottom;
    filter: drop-shadow(0 0 8px rgba(86, 187, 123, 0.3));
    transition: filter 0.3s ease;
}

.elementor-element-2138700f:hover {
    filter: drop-shadow(0 0 15px rgba(86, 187, 123, 0.6));
}
</style>
`;

$('head').append(fixedStyles);

const fixedScript = `
<script id="custom-scroll-reveal-script">
document.addEventListener("DOMContentLoaded", function() {
    const observerOptions = {
        root: null,
        rootMargin: "0px 0px -60px 0px",
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal-active");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Seletores dos elementos principais.
    // Observamos o PAI das listas (.elementor-widget-icon-list) em vez dos itens diretamente,
    // pois o pai tem tamanho visível maior no layout garantindo o acionamento confiável.
    const elementsToReveal = [
        '.elementor-element-4827e1c7', // Título Hero Desktop
        '.elementor-element-36b75d89', // Título Hero Mobile
        '.elementor-element-7ef56d00', // Widget Lista Hero Desktop (PAI)
        '.elementor-element-1018c2ab', // Widget Lista Hero Mobile (PAI)
        '.elementor-element-38869286', // Título Seção 2
        '.elementor-element-20b1ea80'  // Widget Lista Seção 2 (PAI)
    ];

    elementsToReveal.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            revealObserver.observe(el);
        });
    });
});
</script>
`;

$('body').append(fixedScript);

fs.writeFileSync('index.html', $.html());
console.log('Successfully fixed text descriptions reveal by targeting parent list widgets!');
