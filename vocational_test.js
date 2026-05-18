/**
 * EADon - Teste Vocacional Premium Engine (Howard Gardner Model)
 * ------------------------------------------------------------------
 * Handles the step-by-step vocational test based on the 32 objective questions
 * using Gardner's Multiple Intelligences Theory. All calculations are 100%
 * mathematical and processed locally in the browser with lead capture.
 */

(function () {
  // Configuration
  // Set your Google Sheets Web App URL here. 
  // If empty, the system will save leads locally to localStorage as a fallback.
  const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwk6BRBPsDJgvy7wRE_8G5l-aLxPqBLB55g_87Vq0OSrmWvdCRO2j4RdCw4dV9hwXzspw/exec"; 

  // 32-Question Database mapped to the 8 Intelligences
  const questions = [
    { id: 1, text: "Costumo interpretar palavras, gestos e objetivos subentendidos em uma conversa.", category: "interpessoal" },
    { id: 2, text: "As pessoas do meu convívio me consideram aventureiro.", category: "corporal" },
    { id: 3, text: "Mantenho o foco em atividades que possuo maior domínio, mas não deixo de trabalhar pontos de melhoria em mim.", category: "intrapessoal" },
    { id: 4, text: "Valorizo áreas do conhecimento que envolvam a natureza.", category: "naturalista" },
    { id: 5, text: "Utilizo meu tempo livre para ouvir diferentes músicas e associá-las a outras composições.", category: "musical" },
    { id: 6, text: "Eu gosto de escrever e sensibilizar o outro através de palavras.", category: "linguistica" },
    { id: 7, text: "Possuo habilidades para reconhecer notas musicais provenientes de qualquer tipo de objeto.", category: "musical" },
    { id: 8, text: "Eu me adapto às situações, mesmo que elas sejam complicadas ou delicadas.", category: "intrapessoal" },
    { id: 9, text: "Possuo habilidade e capacidade de entender, criar e systematizar padrões.", category: "logico_matematica" },
    { id: 10, text: "Recebo elogios de amigos por criar melodias que lhes agradam.", category: "musical" },
    { id: 11, text: "Eu aprendo com facilidade e procuro utilizar novas ferramentas para qualquer atividade.", category: "intrapessoal" },
    { id: 12, text: "Ao construir pensamentos e ideias, costumo fundamentá-los em argumentos concretos.", category: "logico_matematica" },
    { id: 13, text: "Normalmente consigo ler nas entrelinhas o que uma pessoa quer dizer, mas tenho dificuldades em expressar com palavras.", category: "linguistica" },
    { id: 14, text: "Prefiro atividades ao ar livre.", category: "naturalista" },
    { id: 15, text: "Tenho facilidade em executar várias tarefas ao mesmo tempo sem necessariamente ter uma rotina.", category: "corporal" },
    { id: 16, text: "Prefiro atuar na criação ao invés da execução de uma tarefa.", category: "espacial" },
    { id: 17, text: "Gosto de expressar sentimentos verbalmente para as pessoas.", category: "linguistica" },
    { id: 18, text: "Eu tenho facilidade em negociar, motivar e convencer as pessoas e não me preocupo com o que vão pensar.", category: "interpessoal" },
    { id: 19, text: "Valorizo tarefas que possam desenvolver o meu lado pessoal e minhas relações.", category: "interpessoal" },
    { id: 20, text: "Eu me sinto confortável em conviver com grandes grupos.", category: "interpessoal" },
    { id: 21, text: "Consigo visualizar projetos claramente, antes mesmo de fazer os primeiros rascunhos.", category: "espacial" },
    { id: 22, text: "Procuro ajudar os outros a resolverem os seus problemas.", category: "interpessoal" },
    { id: 23, text: "Frequentemente utilizo o meu corpo para expressar emoções.", category: "corporal" },
    { id: 24, text: "Gosto de identificar detalhes, pois valorizo a estética.", category: "espacial" },
    { id: 25, text: "Prefiro resolver problemas complexos que envolvam números.", category: "logico_matematica" },
    { id: 26, text: "Eu me conheço, compreendo minhas emoções e limites.", category: "intrapessoal" },
    { id: 27, text: "Eu me interesso por planilhas e gráficos e gosto de explicar aos outros.", category: "logico_matematica" },
    { id: 28, text: "Eu me considero muito empático.", category: "interpessoal" },
    { id: 29, text: "Tenho facilidade em correlacionar minhas emoções a imagens, cenários e cores.", category: "espacial" },
    { id: 30, text: "Prefiro expressar o meu ponto de vista de maneira mais ponderada e comedida.", category: "linguistica" },
    { id: 31, text: "Gosto de tocar instrumentos musicais.", category: "musical" },
    { id: 32, text: "Eu costumo viajar para lugares que tenham cachoeiras, praias e montanhas.", category: "naturalista" }
  ];

  // Detailed profiles for the 8 Intelligences
  const intelligencesDetails = {
    interpessoal: {
      name: "Interpessoal",
      shortName: "Interpessoal",
      icon: "🤝",
      description: "Você é o mestre da empatia! Possui grande facilidade para compreender gestos e sentimentos, além de liderar, negociar e inspirar pessoas. Você se sente muito confortável em grandes grupos e sente prazer em ajudar a resolver conflitos de forma colaborativa.",
      courses: ["Gestão de Recursos Humanos", "Psicologia", "Processos Gerenciais", "Gestão Comercial", "Marketing", "Serviço Social"]
    },
    naturalista: {
      name: "Naturalista",
      shortName: "Naturalista",
      icon: "🍃",
      description: "Sua conexão com o mundo vivo é inspiradora! Você valoriza a natureza, plantas, animais e se interessa profundamente pelo ecossistema e biologia. Prefere atividades dinâmicas ao ar livre e possui um olhar clínico para classificar e correlacionar espécies e fenômenos biológicos.",
      courses: ["Agronomia", "Ciências Biológicas", "Gestão Ambiental", "Nutrição", "Medicina Veterinária"]
    },
    intrapessoal: {
      name: "Intrapessoal",
      shortName: "Intrapessoal",
      icon: "👤",
      description: "Você possui um autoconhecimento profundo e invejável! Entende perfeitamente suas próprias emoções, motivações, forças e limitações. Tem foco direcionado à autoaprendizagem e ao aprimoramento individual, sabendo adaptar-se com resiliência a cenários complexos.",
      courses: ["Filosofia", "Psicologia", "Coaching e Mentoring", "Direito", "Sociologia", "Gestão Estratégica"]
    },
    musical: {
      name: "Musical",
      shortName: "Musical",
      icon: "🎵",
      description: "Você possui a mente ritmada pelos sons do mundo! Tem um ouvido incrivelmente apurado e facilidade para identificar notas, timbres, tons e criar melodias únicas. Valoriza a música em seu dia a dia e se expressa de maneira artística através de ritmos e instrumentos.",
      courses: ["Produção Fonográfica", "Música", "Sonoplastia", "Licenciatura em Música", "Artes"]
    },
    linguistica: {
      name: "Linguística",
      shortName: "Linguística",
      icon: "✍️",
      description: "A linguagem é a sua maior ferramenta! Você tem enorme habilidade para se expressar, escrever com fluidez, contar histórias e ler nas entrelinhas. Tem forte capacidade de comunicação oral e escrita, sensibilizando e transmitindo ideias com alta precisão e clareza.",
      courses: ["Letras", "Jornalismo", "Marketing", "Relações Públicas", "Pedagogia", "Publicidade e Propaganda"]
    },
    corporal: {
      name: "Corporal-Cinestésica",
      shortName: "Corporal",
      icon: "🏃",
      description: "Seu corpo fala e se expressa com maestria! Você tem excelente coordenação motora, agilidade e facilidade para realizar tarefas práticas, manuais ou dinâmicas. Gosta de movimento físico, aventuras e de utilizar o corpo de maneira integrada para expressar suas emoções.",
      courses: ["Educação Física", "Fisioterapia", "Estética e Cosmética", "Teatro e Artes Cênicas", "Logística"]
    },
    logico_matematica: {
      name: "Lógico-Matemática",
      shortName: "Lógico",
      icon: "📊",
      description: "Sua mente é uma máquina de raciocínio estruturado! Você tem extrema facilidade para lidar com números, dados, planilhas e resolver problemas lógicos complexos. Gosta de sistematizar padrões, buscar evidências concretas e fundamentar suas opiniões em argumentos sólidos.",
      courses: ["Análise e Desenvolvimento de Sistemas", "Ciências da Computação", "Engenharia de Produção", "Ciências Contábeis", "Administração de Empresas", "Gestão de TI"]
    },
    espacial: {
      name: "Espacial",
      shortName: "Espacial",
      icon: "🎨",
      description: "Seu campo de visão é tridimensional e altamente criativo! Você possui uma incrível habilidade para projetar layouts, cenários, imagens e correlacionar cores e emoções. Consegue visualizar projetos completos mentalmente e valoriza profundamente a estética dos detalhes.",
      courses: ["Design Gráfico", "Arquitetura e Urbanismo", "Web Design", "Marketing Digital", "Edição de Vídeo", "Jogos Digitais"]
    }
  };

  // Group mappings of questions by category to ensure correct mathematical calculations
  const categoryQuestions = {
    interpessoal: [1, 18, 19, 20, 22, 28],
    corporal: [2, 15, 23],
    intrapessoal: [3, 8, 11, 26],
    naturalista: [4, 14, 32],
    musical: [5, 7, 10, 31],
    linguistica: [6, 13, 17, 30],
    logico_matematica: [9, 12, 25, 27],
    espacial: [16, 21, 24, 29]
  };

  // State Variables
  let currentStep = 0; // 0 to 31: Questions, 32: Lead Form, 33: Loading, 34: Results
  let userResponses = {}; // keys: question index (0-31), value: 1 to 4
  let calculatedPercentages = {};
  let topIntelligence = "";

  // Core DOM Initialization
  function init() {
    const triggerBtn = document.getElementById("btn-iniciar-teste-vocacional");
    if (triggerBtn) {
      triggerBtn.addEventListener("click", openModal);
    }
  }

  // Open Modal
  function openModal() {
    // Check if modal already exists, remove it
    const existing = document.getElementById("vt-modal-overlay");
    if (existing) existing.remove();

    // Create Modal HTML Structure
    const overlay = document.createElement("div");
    overlay.id = "vt-modal-overlay";
    overlay.className = "vt-modal-overlay";
    
    overlay.innerHTML = `
      <div class="vt-modal-container" id="vt-modal-container">
        <div class="vt-modal-header">
          <h3>Orientador Vocacional - Múltiplas Inteligências</h3>
          <button class="vt-modal-close-btn" id="vt-modal-close" aria-label="Fechar modal">×</button>
        </div>
        <div class="vt-modal-body" id="vt-modal-body">
          <!-- Step contents will be injected here -->
        </div>
        <div class="vt-modal-footer" id="vt-modal-footer">
          <!-- Footer buttons will be injected here -->
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Trigger active state transition
    setTimeout(() => {
      overlay.classList.add("active");
    }, 10);

    // Event listeners
    document.getElementById("vt-modal-close").addEventListener("click", closeModal);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });

    // Reset State & Render first question
    currentStep = 0;
    userResponses = {};
    calculatedPercentages = {};
    topIntelligence = "";
    
    // Reset modal size
    const container = document.getElementById("vt-modal-container");
    if (container) {
      container.classList.remove("vt-modal-expanded");
    }

    renderCurrentStep();
  }

  function closeModal() {
    const overlay = document.getElementById("vt-modal-overlay");
    if (!overlay) return;
    
    overlay.classList.remove("active");
    setTimeout(() => {
      overlay.remove();
    }, 400);
  }

  // Step Renderer
  function renderCurrentStep() {
    const body = document.getElementById("vt-modal-body");
    const footer = document.getElementById("vt-modal-footer");
    const container = document.getElementById("vt-modal-container");
    if (!body || !footer) return;

    // Clear contents
    body.innerHTML = "";
    footer.innerHTML = "";

    // Step 0-31: 32 Objective Questions
    if (currentStep >= 0 && currentStep < 32) {
      if (container) container.classList.remove("vt-modal-expanded");

      const q = questions[currentStep];
      const progressPercent = Math.round((currentStep / 32) * 100);

      // Render Question Layout
      body.innerHTML = `
        <div class="vt-progress-wrapper">
          <div class="vt-progress-info">
            <span class="vt-progress-text">Afirmação ${currentStep + 1} de 32</span>
            <span class="vt-progress-text">${progressPercent}% completo</span>
          </div>
          <div class="vt-progress-bar-bg">
            <div class="vt-progress-bar-fill" style="width: ${progressPercent}%"></div>
          </div>
        </div>
        
        <div class="vt-question-container">
          <p class="vt-question-instruction">Avalie o quanto você se identifica com a afirmação abaixo:</p>
          <h4 class="vt-question-title-objective">
            "${q.text}"
          </h4>
          
          <div class="vt-scale-options">
            <button class="vt-scale-btn" data-val="4">
              <span class="vt-scale-number vt-scale-num-4">4</span>
              <span class="vt-scale-text">Concordo plenamente</span>
            </button>
            <button class="vt-scale-btn" data-val="3">
              <span class="vt-scale-number vt-scale-num-3">3</span>
              <span class="vt-scale-text">Concordo</span>
            </button>
            <button class="vt-scale-btn" data-val="2">
              <span class="vt-scale-number vt-scale-num-2">2</span>
              <span class="vt-scale-text">Concordo parcialmente</span>
            </button>
            <button class="vt-scale-btn" data-val="1">
              <span class="vt-scale-number vt-scale-num-1">1</span>
              <span class="vt-scale-text">Não concordo</span>
            </button>
          </div>
        </div>
      `;

      // Restore previously saved answer if back button used
      const savedAnswer = userResponses[currentStep];
      if (savedAnswer) {
        const activeBtn = body.querySelector(`.vt-scale-btn[data-val="${savedAnswer}"]`);
        if (activeBtn) activeBtn.classList.add("selected");
      }

      // Add Zero-Friction Click Action to scale buttons
      const buttons = body.querySelectorAll(".vt-scale-btn");
      buttons.forEach((btn) => {
        btn.addEventListener("click", function () {
          buttons.forEach((b) => b.classList.remove("selected"));
          this.classList.add("selected");
          
          const val = parseInt(this.getAttribute("data-val"));
          userResponses[currentStep] = val;

          // Enable next button immediately
          const nextBtn = document.getElementById("vt-btn-next");
          if (nextBtn) nextBtn.disabled = false;

          // Auto-advance after a visual feedback delay (200ms)
          setTimeout(() => {
            handleNextStep();
          }, 200);
        });
      });

      // Footer Navigation buttons
      footer.innerHTML = `
        ${
          currentStep > 0
            ? `<button class="vt-btn vt-btn-secondary" id="vt-btn-back">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                <span>Voltar</span>
               </button>`
            : ""
        }
        <button class="vt-btn vt-btn-primary" id="vt-btn-next" ${savedAnswer ? "" : "disabled"}>
          <span>Avançar</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      `;

      document.getElementById("vt-btn-next").addEventListener("click", handleNextStep);
      
      const backBtn = document.getElementById("vt-btn-back");
      if (backBtn) backBtn.addEventListener("click", handleBackStep);
    } 
    // Step 32: Lead Capture Form (Nome, WhatsApp, Idade)
    else if (currentStep === 32) {
      if (container) container.classList.remove("vt-modal-expanded");

      body.innerHTML = `
        <div class="vt-progress-wrapper">
          <div class="vt-progress-info">
            <span class="vt-progress-text">Quase pronto! 🎯</span>
            <span class="vt-progress-text">100% das afirmações concluídas</span>
          </div>
          <div class="vt-progress-bar-bg">
            <div class="vt-progress-bar-fill" style="width: 100%"></div>
          </div>
        </div>

        <div class="vt-question-container" style="text-align: center;">
          <div class="vt-lead-header-icon">🏆</div>
          <h4 style="font-family: 'Work Sans', sans-serif; font-size: 20px; font-weight: 700; color: #FFFFFF; margin-bottom: 8px;">Mapeamento Concluído!</h4>
          <p style="font-family: 'Work Sans', sans-serif; font-size: 14px; color: #B7C3D3; margin-bottom: 24px; line-height: 1.5;">
            Calculamos com sucesso suas afinidades intelectuais. Preencha seus dados de contato abaixo para visualizar seu gráfico de resultados e recomendações de cursos!
          </p>

          <form id="vt-lead-form" onsubmit="return false;">
            <div class="vt-form-group">
              <label for="vt-lead-name">Nome Completo *</label>
              <input type="text" id="vt-lead-name" class="vt-input" placeholder="Ex: Ailton Santos" required />
            </div>
            <div class="vt-form-row">
              <div class="vt-form-group vt-flex-2">
                <label for="vt-lead-whatsapp">WhatsApp (com DDD) *</label>
                <input type="tel" id="vt-lead-whatsapp" class="vt-input" placeholder="Ex: (11) 99999-9999" required />
              </div>
              <div class="vt-form-group vt-flex-1">
                <label for="vt-lead-age">Idade *</label>
                <input type="number" id="vt-lead-age" class="vt-input" placeholder="Ex: 22" min="10" max="100" required />
              </div>
            </div>
          </form>
        </div>
      `;

      // Set input phone mask helper
      const whatsappInput = document.getElementById("vt-lead-whatsapp");
      if (whatsappInput) {
        whatsappInput.addEventListener("input", function (e) {
          let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
          e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
          validateLeadForm();
        });
      }

      const nameInput = document.getElementById("vt-lead-name");
      const ageInput = document.getElementById("vt-lead-age");

      nameInput.addEventListener("input", validateLeadForm);
      ageInput.addEventListener("input", validateLeadForm);

      footer.innerHTML = `
        <button class="vt-btn vt-btn-secondary" id="vt-btn-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          <span>Voltar</span>
        </button>
        <button class="vt-btn vt-btn-primary" id="vt-btn-submit-lead" disabled style="background-image: linear-gradient(180deg, #F37610 0%, #FF9901 100%); box-shadow: 0 4px 15px rgba(243, 118, 16, 0.2);">
          <span>Liberar Meu Resultado ✨</span>
        </button>
      `;

      document.getElementById("vt-btn-submit-lead").addEventListener("click", handleSubmitLead);
      document.getElementById("vt-btn-back").addEventListener("click", handleBackStep);
    }
    // Step 33: Loading / Mathematical Calculation
    else if (currentStep === 33) {
      if (container) container.classList.remove("vt-modal-expanded");

      body.innerHTML = `
        <div class="vt-loader-container">
          <div class="vt-spinner"></div>
          <h4 class="vt-loader-title">Processando Perfil Vocacional</h4>
          <p class="vt-loader-text" id="vt-loader-msg">Sumarizando pontos de respostas...</p>
        </div>
      `;
      footer.innerHTML = "";

      startLoaderMessages();
      
      // Calculate results and advance after 1.8 seconds to feel premium & authentic
      setTimeout(() => {
        calculateMathematicalResults();
        saveAndTransitionToResults();
      }, 1800);
    }
    // Step 34: Premium Results Screen
    else if (currentStep === 34) {
      if (container) container.classList.add("vt-modal-expanded");

      // Find top intelligence
      const topDetail = intelligencesDetails[topIntelligence];

      // Build Bars HTML for the chart
      let chartBarsHTML = "";
      Object.keys(categoryQuestions).forEach((cat) => {
        const pct = calculatedPercentages[cat];
        const detail = intelligencesDetails[cat];
        const isTop = cat === topIntelligence;
        
        chartBarsHTML += `
          <div class="vt-chart-bar-wrapper ${isTop ? "is-top-intelligence" : ""}">
            <div class="vt-chart-bar-pct-bubble">${pct}%</div>
            <div class="vt-chart-bar-outer">
              <div class="vt-chart-bar-inner" style="height: ${pct}%"></div>
            </div>
            <div class="vt-chart-bar-icon-small">${detail.icon}</div>
            <div class="vt-chart-bar-label-small">${detail.shortName}</div>
          </div>
        `;
      });

      // Build Accordions HTML for all other intelligences
      let accordionsHTML = "";
      Object.keys(intelligencesDetails).forEach((cat) => {
        if (cat === topIntelligence) return; // Skip top intelligence (shown in main highlight)

        const pct = calculatedPercentages[cat];
        const detail = intelligencesDetails[cat];

        accordionsHTML += `
          <div class="vt-accordion-item">
            <button class="vt-accordion-header">
              <span class="vt-accordion-header-left">
                <span class="vt-accordion-icon-large">${detail.icon}</span>
                <span class="vt-accordion-title-name">${detail.name}</span>
              </span>
              <span class="vt-accordion-header-right">
                <span class="vt-accordion-badge">${pct}%</span>
                <svg class="vt-accordion-arrow-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            <div class="vt-accordion-content">
              <p class="vt-accordion-desc-text">${detail.description}</p>
              <div class="vt-courses-box">
                <h6>📚 Cursos Recomendados no EADon:</h6>
                <div class="vt-courses-tags">
                  ${detail.courses.map(course => `<span class="vt-course-tag">${course}</span>`).join("")}
                </div>
              </div>
            </div>
          </div>
        `;
      });

      body.innerHTML = `
        <div class="vt-result-premium-container">
          <!-- Top Orange Banner -->
          <div class="vt-result-top-banner-premium">
            <h4>Já temos o resultado do seu teste!</h4>
            <p>Confira o seu perfil de Múltiplas Inteligências</p>
          </div>

          <!-- Vertical Bar Chart -->
          <div class="vt-chart-block">
            <h5>Gráfico de Inteligências Predominantes:</h5>
            <div class="vt-chart-container">
              <div class="vt-chart-bars-row">
                ${chartBarsHTML}
              </div>
            </div>
          </div>

          <!-- Predominant / Highest Score Highlight -->
          <div class="vt-predominant-card">
            <div class="vt-predominant-badge">🔥 Inteligência Predominante</div>
            <div class="vt-predominant-header">
              <div class="vt-predominant-icon-big">${topDetail.icon}</div>
              <div>
                <h4 class="vt-predominant-title">${topDetail.name}</h4>
                <p class="vt-predominant-subtitle">Sua pontuação: <strong>${calculatedPercentages[topIntelligence]}%</strong></p>
              </div>
            </div>
            
            <p class="vt-predominant-desc-text">
              ${topDetail.description}
            </p>

            <div class="vt-courses-box-top">
              <h6>🎯 Melhores Cursos recomendados para você no EADon:</h6>
              <div class="vt-courses-tags">
                ${topDetail.courses.map(course => `<span class="vt-course-tag-top">${course}</span>`).join("")}
              </div>
            </div>

            <!-- WhatsApp Engagement CTA -->
            <div class="vt-whatsapp-engagement-box">
              <div class="vt-whatsapp-header">
                <span class="vt-whatsapp-badge-icon">💬</span>
                <div>
                  <h6>Garantir Bolsa com Orientador EADon</h6>
                  <p>Fale grátis com nosso consultor no WhatsApp e garanta uma bolsa de estudo exclusiva para o seu perfil!</p>
                </div>
              </div>
              <button class="vt-btn-whatsapp-premium" id="vt-btn-whatsapp-consultor">
                <span>Garantir Bolsa no WhatsApp</span>
              </button>
            </div>
          </div>

          <!-- Accordion of remaining intelligences -->
          <div class="vt-accordions-block">
            <h5>Explorar Outras Inteligências:</h5>
            <div class="vt-accordions-list">
              ${accordionsHTML}
            </div>
          </div>
        </div>
      `;

      // Set up Accordion expand/collapse click behavior
      const accordionHeaders = body.querySelectorAll(".vt-accordion-header");
      accordionHeaders.forEach((header) => {
        header.addEventListener("click", function () {
          const item = this.parentElement;
          const isActive = item.classList.contains("active");
          
          // Collapse all others
          body.querySelectorAll(".vt-accordion-item").forEach((it) => {
            it.classList.remove("active");
          });

          // Toggle clicked one
          if (!isActive) {
            item.classList.add("active");
          }
        });
      });

      // Primary CTA redirects to courses portal
      footer.innerHTML = `
        <button class="vt-btn vt-btn-secondary" id="vt-btn-copy-result-text">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          <span>Copiar Relatório</span>
        </button>
        <button class="vt-btn vt-btn-primary" id="vt-btn-access-portal" style="background-image: linear-gradient(180deg, #F37610 0%, #FF9901 100%); box-shadow: 0 4px 15px rgba(243, 118, 16, 0.3);">
          <span>Acessar o portal dos cursos</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      `;

      // Event listeners for results screen
      document.getElementById("vt-btn-whatsapp-consultor").addEventListener("click", handleWhatsAppRedirect);
      document.getElementById("vt-btn-copy-result-text").addEventListener("click", copyResultToClipboard);
      
      document.getElementById("vt-btn-access-portal").addEventListener("click", function () {
        // Redirect to EADon courses portal in new tab
        window.open("https://eadon.com.br/inoveead", "_blank");
        closeModal();
      });
    }
  }

  // Input Validator helpers
  function validateLeadForm() {
    const name = document.getElementById("vt-lead-name").value.trim();
    const whatsapp = document.getElementById("vt-lead-whatsapp").value.trim();
    const ageVal = document.getElementById("vt-lead-age").value.trim();
    const submitBtn = document.getElementById("vt-btn-submit-lead");
    
    if (!submitBtn) return;

    const isNameValid = name.length >= 3;
    const isPhoneValid = whatsapp.replace(/\D/g, '').length >= 10;
    const age = parseInt(ageVal);
    const isAgeValid = !isNaN(age) && age >= 10 && age <= 100;

    submitBtn.disabled = !(isNameValid && isPhoneValid && isAgeValid);
  }

  // Navigation handlers
  function handleNextStep() {
    if (currentStep < 32) {
      currentStep++;
      renderCurrentStep();
    }
  }

  function handleBackStep() {
    if (currentStep > 0) {
      currentStep--;
      renderCurrentStep();
    }
  }

  function startLoaderMessages() {
    const messages = [
      "Processando pontuações lógicas...",
      "Mapeando perfil de comunicação...",
      "Identificando inteligência de empatia...",
      "Calculando gráficos estatísticos..."
    ];
    let msgIndex = 0;
    
    const interval = setInterval(() => {
      const loaderMsg = document.getElementById("vt-loader-msg");
      if (loaderMsg && currentStep === 33) {
        loaderMsg.textContent = messages[msgIndex];
        msgIndex = (msgIndex + 1) % messages.length;
      } else {
        clearInterval(interval);
      }
    }, 450);
  }

  // Submit Lead triggers transition to loading step
  function handleSubmitLead() {
    const name = document.getElementById("vt-lead-name").value.trim();
    const whatsapp = document.getElementById("vt-lead-whatsapp").value.trim();
    const age = document.getElementById("vt-lead-age").value.trim();

    userResponses["lead_name"] = name;
    userResponses["lead_whatsapp"] = whatsapp;
    userResponses["lead_age"] = age;

    currentStep = 33;
    renderCurrentStep();
  }

  // Mathematical Gardner Multiple Intelligences Profiling
  function calculateMathematicalResults() {
    const scores = {};
    
    Object.keys(categoryQuestions).forEach((cat) => {
      const qIds = categoryQuestions[cat];
      let sum = 0;
      qIds.forEach((id) => {
        // userResponses is indexed 0 to 31. The id in database is 1 to 32.
        const ans = parseInt(userResponses[id - 1] || 1);
        sum += ans;
      });
      const N = qIds.length;
      // Normalization formula: ((Sum - N) / (3N)) * 100
      const pct = Math.round(((sum - N) / (3 * N)) * 100);
      scores[cat] = sum;
      calculatedPercentages[cat] = pct;
    });

    // Find the intelligence with the absolute highest percentage
    let maxCat = "logico_matematica";
    let maxVal = -1;
    Object.keys(calculatedPercentages).forEach((cat) => {
      if (calculatedPercentages[cat] > maxVal) {
        maxVal = calculatedPercentages[cat];
        maxCat = cat;
      }
    });

    topIntelligence = maxCat;
  }

  // Save data to localStorage/Webhook and transition to step 34
  async function saveAndTransitionToResults() {
    try {
      const name = userResponses.lead_name || "Estudante";
      const whatsapp = userResponses.lead_whatsapp || "";
      const age = userResponses.lead_age || "";
      const topDetail = intelligencesDetails[topIntelligence];

      // Formulate simple text report for backup / webhook
      let summaryText = `Resultados Vocacionais:\n`;
      Object.keys(calculatedPercentages).forEach((cat) => {
        summaryText += `- ${intelligencesDetails[cat].name}: ${calculatedPercentages[cat]}%\n`;
      });

      const leadData = {
        name: name,
        whatsapp: whatsapp,
        age: age,
        result_interpessoal: calculatedPercentages.interpessoal + "%",
        result_corporal: calculatedPercentages.corporal + "%",
        result_intrapessoal: calculatedPercentages.intrapessoal + "%",
        result_naturalista: calculatedPercentages.naturalista + "%",
        result_musical: calculatedPercentages.musical + "%",
        result_linguistica: calculatedPercentages.linguistica + "%",
        result_logico_matematica: calculatedPercentages.logico_matematica + "%",
        result_espacial: calculatedPercentages.espacial + "%",
        top_intelligence: topDetail.name,
        timestamp: new Date().toISOString()
      };

      // 1. Save locally to localStorage (key: eadon_leads)
      let localLeads = [];
      try {
        const stored = localStorage.getItem("eadon_leads");
        if (stored) localLeads = JSON.parse(stored);
      } catch (e) {
        console.error("Local storage read error", e);
      }
      localLeads.push(leadData);
      localStorage.setItem("eadon_leads", JSON.stringify(localLeads));

      // 2. Submit to Webhook if active
      if (GOOGLE_SHEETS_WEBHOOK_URL && GOOGLE_SHEETS_WEBHOOK_URL.trim() !== "") {
        try {
          await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(leadData)
          });
          console.log("Lead successfully submitted to sheets webhook.");
        } catch (err) {
          console.error("Failed to submit lead to Webhook:", err);
        }
      }
    } catch (e) {
      console.error("Error during save operation:", e);
    }

    // Go to Results screen
    currentStep = 34;
    renderCurrentStep();
  }

  // Handle WhatsApp Redirection to Sales Advisor
  function handleWhatsAppRedirect() {
    const name = userResponses.lead_name || "Estudante";
    const topDetail = intelligencesDetails[topIntelligence];
    const topVal = calculatedPercentages[topIntelligence];

    const baseMessage = `Olá! Meu nome é ${name} e acabei de concluir o Teste Vocacional das Múltiplas Inteligências no portal EADon! 🚀\n\nMinha inteligência predominante é:\n👉 *${topDetail.name}* com *${topVal}%* de afinidade!\n\nGostaria de falar com um consultor para conhecer os cursos sugeridos nessa área e resgatar minha Bolsa de Estudo exclusiva! 🎓`;
    
    // Sales consultant phone number
    const whatsappPhone = "5551997911411"; 
    const url = `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(baseMessage)}`;
    
    window.open(url, "_blank");
  }

  // Copy result to Clipboard helper
  function copyResultToClipboard() {
    const name = userResponses.lead_name || "Estudante";
    const whatsapp = userResponses.lead_whatsapp || "";
    const age = userResponses.lead_age || "";
    
    let textToCopy = `RELATÓRIO VOCACIONAL EADON - MÚLTIPLAS INTELIGÊNCIAS\n`;
    textToCopy += `------------------------------------------------------\n`;
    textToCopy += `Estudante: ${name}\n`;
    textToCopy += `WhatsApp: ${whatsapp}\n`;
    textToCopy += `Idade: ${age} anos\n`;
    textToCopy += `------------------------------------------------------\n\n`;
    textToCopy += `RESULTADOS PERCENTUAIS POR CATEGORIA:\n`;
    
    Object.keys(calculatedPercentages).forEach((cat) => {
      textToCopy += `- ${intelligencesDetails[cat].name}: ${calculatedPercentages[cat]}%\n`;
    });
    
    textToCopy += `\nINTELEGÊNCIA DESTAQUE: ${intelligencesDetails[topIntelligence].name} (${calculatedPercentages[topIntelligence]}%)\n\n`;
    textToCopy += `Descrição: ${intelligencesDetails[topIntelligence].description}\n\n`;
    textToCopy += `Cursos sugeridos: ${intelligencesDetails[topIntelligence].courses.join(", ")}\n\n`;
    textToCopy += `Gerado em: eadon.com.br`;

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showToast("📋 Relatório copiado com sucesso!");
      })
      .catch((err) => {
        console.error("Clipboard copy failed:", err);
        showToast("⚠️ Ops! Não consegui copiar automaticamente.");
      });
  }

  // Custom Toast helper
  function showToast(message) {
    const existing = document.getElementById("vt-custom-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "vt-custom-toast";
    toast.className = "vt-toast";
    toast.innerHTML = `<span>${message}</span>`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add("active");
    }, 10);

    setTimeout(() => {
      toast.classList.remove("active");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3500);
  }

  // Initialize once DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
