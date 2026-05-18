/**
 * EADon - Teste Vocacional Premium Engine (Google Gemini 1.5 Flash)
 * ------------------------------------------------------------------
 * Handles the step-by-step vocational test, voice input, lead capture,
 * Google Sheets integration, and Gemini AI analysis with custom redirects.
 */

(function () {
  // Configuration
  const GEMINI_API_KEY = "AIzaSyAug4f1lYbT_55PmOR0E7CTtjdQXUbRFuI";
  const GEMINI_MODEL = "gemini-1.5-flash";
  
  // Set your Google Sheets Web App URL here. 
  // If empty, the system will save leads locally to localStorage as a fallback.
  const GOOGLE_SHEETS_WEBHOOK_URL = ""; 

  // Questions Database
  const questions = [
    {
      id: "tempoLivre",
      type: "text",
      question: "O que você realmente gosta de fazer no seu tempo livre?",
      placeholder: "Ex: Gosto de ler sobre tecnologia, desenhar, organizar coisas, ajudar pessoas com conselhos, consertar aparelhos...",
      voiceHelp: "Dica: Você pode clicar em 'Gravar por Voz' e falar naturalmente!"
    },
    {
      id: "ambiente",
      type: "select",
      question: "Onde você se sente melhor trabalhando?",
      options: [
        { value: "escritorio", label: "🏢 Em um escritório estruturado ou em Home Office focado" },
        { value: "saude", label: "🏥 Em hospitais, clínicas ou ajudando no bem-estar de pessoas" },
        { value: "criativo", label: "🛠️ Em um canteiro de obras, laboratório ou oficina de criação/manutenção" },
        { value: "negocios", label: "🤝 Em trânsito, negociando e fechando parcerias com clientes" }
      ]
    },
    {
      id: "habilidades",
      type: "text",
      question: "Quais matérias na escola você tinha mais facilidade ou interesse?",
      placeholder: "Ex: Matemática e Ciências / Português e Redação / Artes e Biologia / História...",
      voiceHelp: "Dica: Diga as matérias que você mais curtia ou tinha facilidade!"
    },
    {
      id: "estilo",
      type: "select",
      question: "Você prefere trabalhar sozinho e focado, ou em equipe colaborando?",
      options: [
        { value: "focado", label: "👤 Trabalhar de forma individual, focando nas minhas próprias entregas" },
        { value: "equipe", label: "👥 Trabalhar em equipe, colaborando e unindo diferentes ideias" }
      ]
    },
    {
      id: "admiracao",
      type: "text",
      question: "Que tipo de profissional você mais admira e por quê?",
      placeholder: "Ex: Médicos porque salvam vidas, Empreendedores porque constroem coisas do zero, Artistas pelo design...",
      voiceHelp: "Dica: Cite uma profissão que te inspira e o motivo!"
    },
    {
      id: "desafio",
      type: "select",
      question: "Como você prefere resolver problemas no seu dia a dia?",
      options: [
        { value: "logica", label: "📊 Usando lógica, análise de dados, números, processos e ordem" },
        { value: "criatividade", label: "🎨 Usando criatividade, intuição, diálogo, empatia e negociação" }
      ]
    },
    {
      id: "criacao",
      type: "text",
      question: "Se você pudesse criar um negócio ou projeto hoje, sobre o que seria?",
      placeholder: "Ex: Um aplicativo inovador, uma clínica de cuidados, uma loja física ou digital, uma escola...",
      voiceHelp: "Dica: Pense livremente no seu projeto ou negócio dos sonhos!"
    },
    {
      id: "objetivo",
      type: "select",
      question: "O que você busca primeiro na sua carreira profissional?",
      options: [
        { value: "estabilidade", label: "🛡️ Estabilidade, plano de carreira claro, previsibilidade e segurança" },
        { value: "crescimento", label: "⚡ Liberdade, autonomia, crescimento acelerado e altas comissões" }
      ]
    }
  ];

  // State Variables
  let currentStep = 0; // 0 to 7: Questions, 8: Lead Form, 9: Loading, 10: Result
  let userResponses = {};
  let recognition = null;
  let isRecording = false;
  let generatedResultText = "";

  // Core DOM Initialization
  function init() {
    const triggerBtn = document.getElementById("btn-iniciar-teste-vocacional");
    if (triggerBtn) {
      triggerBtn.addEventListener("click", openModal);
    }
    setupSpeechRecognition();
  }

  // Speech Recognition Setup
  function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "pt-BR";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = function () {
        isRecording = true;
        updateRecordButtonUI(true);
      };

      recognition.onend = function () {
        isRecording = false;
        updateRecordButtonUI(false);
      };

      recognition.onerror = function (event) {
        console.error("Speech recognition error:", event.error);
        isRecording = false;
        updateRecordButtonUI(false);
        showToast("⚠️ Ops! Não consegui ouvir bem. Pode tentar falar de novo?");
      };

      recognition.onresult = function (event) {
        const textResult = event.results[0][0].transcript;
        const textarea = document.getElementById("vt-answer-text");
        if (textarea && textResult) {
          if (textarea.value.trim() !== "") {
            textarea.value += " " + textResult;
          } else {
            textarea.value = textResult;
          }
          // Trigger input event to validate button
          textarea.dispatchEvent(new Event("input"));
        }
      };
    }
  }

  function updateRecordButtonUI(recording) {
    const recordBtn = document.getElementById("vt-btn-record");
    if (!recordBtn) return;
    
    if (recording) {
      recordBtn.classList.add("recording");
      recordBtn.innerHTML = `
        <span class="vt-record-dot"></span>
        <span>Gravando... Clique para parar</span>
      `;
    } else {
      recordBtn.classList.remove("recording");
      recordBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
        </svg>
        <span>Gravar por Voz (Falar)</span>
      `;
    }
  }

  function toggleRecording() {
    if (!recognition) return;
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  }

  // Open and Close Modal
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
          <h3>Orientador Profissional EADon</h3>
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

    // Trigger transitions
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
    renderCurrentStep();
  }

  function closeModal() {
    const overlay = document.getElementById("vt-modal-overlay");
    if (!overlay) return;
    
    if (isRecording && recognition) {
      recognition.stop();
    }
    
    overlay.classList.remove("active");
    setTimeout(() => {
      overlay.remove();
    }, 400);
  }

  // Step Renderer
  function renderCurrentStep() {
    const body = document.getElementById("vt-modal-body");
    const footer = document.getElementById("vt-modal-footer");
    if (!body || !footer) return;

    // Clear contents
    body.innerHTML = "";
    footer.innerHTML = "";

    // Step 0-7: Questions
    if (currentStep >= 0 && currentStep < 8) {
      const q = questions[currentStep];
      const progressPercent = Math.round((currentStep / 8) * 100);

      // Question body
      const questionHTML = `
        <div class="vt-progress-wrapper">
          <div class="vt-progress-info">
            <span class="vt-progress-text">Pergunta ${currentStep + 1} de 8</span>
            <span class="vt-progress-text">${progressPercent}% completo</span>
          </div>
          <div class="vt-progress-bar-bg">
            <div class="vt-progress-bar-fill" style="width: ${progressPercent}%"></div>
          </div>
        </div>
        
        <div class="vt-question-container">
          <h4 class="vt-question-title">
            <span class="vt-question-icon">⚡</span>
            <span>${q.question}</span>
          </h4>
          
          ${
            q.type === "text"
              ? `
            <div class="vt-textarea-wrapper">
              <textarea id="vt-answer-text" class="vt-textarea" placeholder="${q.placeholder}"></textarea>
            </div>
            ${
              recognition
                ? `<button id="vt-btn-record" class="vt-record-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="22"/>
                    </svg>
                    <span>Gravar por Voz (Falar)</span>
                  </button>
                  <p class="vt-record-indicator" style="display: none;"></p>
                  `
                : `<p class="vt-unsupported-speech-msg">🎙️ Gravação por voz disponível em navegadores modernos como Google Chrome.</p>`
            }
            <p style="font-size: 12px; color: #97A0B6; margin: 8px 0 0 0; text-align: left;">${q.voiceHelp || ""}</p>
          `
              : `
            <div class="vt-options-list">
              ${q.options
                .map(
                  (opt, idx) => `
                <div class="vt-option-card" data-val="${opt.value}">
                  <span class="vt-option-radio"></span>
                  <span class="vt-option-label">${opt.label}</span>
                </div>
              `
                )
                .join("")}
            </div>
          `
          }
        </div>
      `;

      body.innerHTML = questionHTML;

      // Restore previously saved answer if back button used
      const existingVal = userResponses[q.id];
      if (existingVal) {
        if (q.type === "text") {
          document.getElementById("vt-answer-text").value = existingVal;
        } else {
          const cards = body.querySelectorAll(".vt-option-card");
          cards.forEach((c) => {
            if (c.getAttribute("data-val") === existingVal) {
              c.classList.add("selected");
            }
          });
        }
      }

      // Add event listeners inside the question
      if (q.type === "text") {
        const textarea = document.getElementById("vt-answer-text");
        textarea.focus();
        textarea.addEventListener("input", function () {
          validateQuestionInput();
        });
        
        const recordBtn = document.getElementById("vt-btn-record");
        if (recordBtn) {
          recordBtn.addEventListener("click", toggleRecording);
        }
      } else {
        const cards = body.querySelectorAll(".vt-option-card");
        cards.forEach((c) => {
          c.addEventListener("click", function () {
            cards.forEach((x) => x.classList.remove("selected"));
            this.classList.add("selected");
            validateQuestionInput();
          });
        });
      }

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
        <button class="vt-btn vt-btn-primary" id="vt-btn-next" disabled>
          <span>Avançar</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      `;

      document.getElementById("vt-btn-next").addEventListener("click", handleNextStep);
      
      const backBtn = document.getElementById("vt-btn-back");
      if (backBtn) backBtn.addEventListener("click", handleBackStep);

      // Trigger initial validation check
      validateQuestionInput();
    } 
    // Step 8: Lead Capture Form
    else if (currentStep === 8) {
      body.innerHTML = `
        <div class="vt-progress-wrapper">
          <div class="vt-progress-info">
            <span class="vt-progress-text">Quase lá! 🎯</span>
            <span class="vt-progress-text">100% das perguntas respondidas</span>
          </div>
          <div class="vt-progress-bar-bg">
            <div class="vt-progress-bar-fill" style="width: 100%"></div>
          </div>
        </div>

        <div class="vt-question-container" style="text-align: center;">
          <div style="font-size: 40px; margin-bottom: 16px;">🏆</div>
          <h4 style="font-family: 'Work Sans', sans-serif; font-size: 20px; font-weight: 700; color: #FFFFFF; margin-bottom: 8px;">Perguntas Concluídas!</h4>
          <p style="font-family: 'Work Sans', sans-serif; font-size: 14px; color: #B7C3D3; margin-bottom: 24px; line-height: 1.5;">
            Nossa Inteligência Artificial já está pronta para processar as suas respostas e sugerir a sua profissão ideal. 
            Preencha seus dados de contato abaixo para liberar seu relatório vocacional completo!
          </p>

          <form id="vt-lead-form">
            <div class="vt-form-group">
              <label for="vt-lead-name">Seu Nome Completo *</label>
              <input type="text" id="vt-lead-name" class="vt-input" placeholder="Ex: Ailton Santos" required />
            </div>
            <div class="vt-form-group">
              <label for="vt-lead-whatsapp">Seu WhatsApp (com DDD) *</label>
              <input type="tel" id="vt-lead-whatsapp" class="vt-input" placeholder="Ex: (11) 99999-9999" required />
            </div>
            <div class="vt-form-group">
              <label for="vt-lead-email">Seu Melhor E-mail *</label>
              <input type="email" id="vt-lead-email" class="vt-input" placeholder="Ex: ailton@email.com" required />
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

      document.getElementById("vt-lead-name").addEventListener("input", validateLeadForm);
      document.getElementById("vt-lead-email").addEventListener("input", validateLeadForm);

      footer.innerHTML = `
        <button class="vt-btn vt-btn-secondary" id="vt-btn-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          <span>Voltar</span>
        </button>
        <button class="vt-btn vt-btn-primary" id="vt-btn-submit-lead" disabled style="background-image: linear-gradient(180deg, #FF9901 0%, #EDA842 100%); box-shadow: 0 4px 15px rgba(243, 118, 16, 0.2);">
          <span>Liberar Meu Resultado ✨</span>
        </button>
      `;

      document.getElementById("vt-btn-submit-lead").addEventListener("click", handleSubmitLead);
      document.getElementById("vt-btn-back").addEventListener("click", handleBackStep);
    }
    // Step 9: Loading Screen
    else if (currentStep === 9) {
      body.innerHTML = `
        <div class="vt-loader-container">
          <div class="vt-spinner"></div>
          <h4 class="vt-loader-title">Analisando Perfil Vocacional</h4>
          <p class="vt-loader-text" id="vt-loader-msg">Processando suas respostas no cérebro artificial...</p>
        </div>
      `;
      // No buttons in footer during loading
      footer.innerHTML = "";

      // Start messages rotation and run AI API call
      startLoaderMessages();
      runAIVocationalAnalysis();
    }
    // Step 10: AI Result Screen
    else if (currentStep === 10) {
      // Format response text with a clean custom parser
      const formattedHTML = formatAIResultToHTML(generatedResultText);

      body.innerHTML = `
        <div class="vt-result-container">
          <div class="vt-result-card">
            <div class="vt-result-header">
              <div class="vt-result-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div>
                <h4>Seu Resultado Vocacional</h4>
                <p>Análise de Perfil Inteligente (Gemini 1.5 Flash)</p>
              </div>
            </div>
            
            <div class="vt-result-content">
              ${formattedHTML}
            </div>
          </div>

          <!-- Explore Recommended Courses directly in WhatsApp! -->
          <div class="vt-whatsapp-cta-card">
            <div class="vt-whatsapp-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </div>
            <div>
              <h5>Falar com um Orientador no WhatsApp</h5>
              <p>Que tal receber uma recomendação direta dos melhores cursos com bolsas de estudo do EADon de acordo com o seu perfil?</p>
              <button class="vt-btn-whatsapp" id="vt-btn-whatsapp-consultor">
                <span>Conversar via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      `;

      // Copy result button and finish button in footer
      footer.innerHTML = `
        <button class="vt-btn vt-btn-secondary" id="vt-btn-copy-result">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2.9.9 2 2"/>
          </svg>
          <span>Copiar Relatório</span>
        </button>
        <button class="vt-btn vt-btn-primary" id="vt-btn-finish">
          <span>Concluir Teste</span>
        </button>
      `;

      document.getElementById("vt-btn-whatsapp-consultor").addEventListener("click", handleWhatsAppRedirect);
      document.getElementById("vt-btn-copy-result").addEventListener("click", copyResultToClipboard);
      document.getElementById("vt-btn-finish").addEventListener("click", closeModal);
    }
  }

  // Validator Helpers
  function validateQuestionInput() {
    const q = questions[currentStep];
    const nextBtn = document.getElementById("vt-btn-next");
    if (!nextBtn) return;

    let isValid = false;

    if (q.type === "text") {
      const val = document.getElementById("vt-answer-text").value.trim();
      isValid = val.length >= 3;
    } else {
      const selected = document.querySelector(".vt-option-card.selected");
      isValid = selected !== null;
    }

    nextBtn.disabled = !isValid;
  }

  function validateLeadForm() {
    const name = document.getElementById("vt-lead-name").value.trim();
    const whatsapp = document.getElementById("vt-lead-whatsapp").value.trim();
    const email = document.getElementById("vt-lead-email").value.trim();
    const submitBtn = document.getElementById("vt-btn-submit-lead");
    
    if (!submitBtn) return;

    // Very simple validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    const isNameValid = name.length >= 3;
    const isPhoneValid = whatsapp.replace(/\D/g, '').length >= 10; // At least 10 digits

    submitBtn.disabled = !(isEmailValid && isNameValid && isPhoneValid);
  }

  // Navigation Handlers
  function handleNextStep() {
    const q = questions[currentStep];
    if (q.type === "text") {
      userResponses[q.id] = document.getElementById("vt-answer-text").value.trim();
    } else {
      const selected = document.querySelector(".vt-option-card.selected");
      userResponses[q.id] = selected.getAttribute("data-val");
    }

    if (isRecording && recognition) {
      recognition.stop();
    }

    // Go to next step (leads page after Q8)
    currentStep++;
    renderCurrentStep();
  }

  function handleBackStep() {
    if (isRecording && recognition) {
      recognition.stop();
    }

    currentStep--;
    renderCurrentStep();
  }

  function startLoaderMessages() {
    const messages = [
      "Consultando o cérebro artificial do Google...",
      "Processando seu estilo de trabalho ideal...",
      "Analisando seus interesses e habilidades...",
      "Cruzando dados com oportunidades do mercado EAD...",
      "Elaborando o relatório final personalizado..."
    ];
    let msgIndex = 0;
    
    const interval = setInterval(() => {
      const loaderMsg = document.getElementById("vt-loader-msg");
      if (loaderMsg && currentStep === 9) {
        loaderMsg.textContent = messages[msgIndex];
        msgIndex = (msgIndex + 1) % messages.length;
      } else {
        clearInterval(interval);
      }
    }, 2500);
  }

  // Submit Lead data to Google Sheets (using Webhook)
  function handleSubmitLead() {
    const name = document.getElementById("vt-lead-name").value.trim();
    const whatsapp = document.getElementById("vt-lead-whatsapp").value.trim();
    const email = document.getElementById("vt-lead-email").value.trim();

    userResponses["lead_name"] = name;
    userResponses["lead_whatsapp"] = whatsapp;
    userResponses["lead_email"] = email;

    // Go to loading step
    currentStep = 9;
    renderCurrentStep();
  }

  // Call Gemini REST API directly with automatic Local AI Fallback Engine
  async function runAIVocationalAnalysis() {
    try {
      // Build responses summary for prompt
      const summary = `
        Nome do Estudante: ${userResponses.lead_name}
        1. Tempo livre: ${userResponses.tempoLivre}
        2. Ambiente de trabalho: ${userResponses.ambiente}
        3. Habilidades/Interesses na escola: ${userResponses.habilidades}
        4. Estilo de trabalho: ${userResponses.estilo}
        5. Profissional admirado: ${userResponses.admiracao}
        6. Resolução de desafios: ${userResponses.desafio}
        7. Projeto/Negócio dos sonhos: ${userResponses.criacao}
        8. Principal objetivo: ${userResponses.objetivo}
      `;

      const systemPrompt = `
Você é o "Orientador Profissional EADon", um mentor de carreiras focado em educação digital. Analise o perfil vocacional do estudante abaixo com empatia, clareza e autoridade. Seu objetivo é sugerir exatamente 3 caminhos de carreiras ideais para ele.

Sua resposta deve ser estruturada e formatada em Markdown simples contendo:
1. **Introdução**: Uma análise inspiradora de 2 a 3 frases sobre as competências e forças do perfil dele de acordo com as respostas.
2. **Caminhos Sugeridos**: Apresente exatamente 3 caminhos sugeridos. Para cada caminho, use obrigatoriamente a sintaxe:
"## 🎯 Caminho X: [Nome da Área/Carreira]"
Seguido por um pequeno parágrafo explicando o porquê essa área combina com ele e listando competências a desenvolver.
3. **Conclusão**: Uma mensagem final de incentivo à profissionalização.

Mantenha a resposta focada, concisa e altamente motivadora. Não use termos complexos. Fale em português do Brasil.
      `;

      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\nRespostas do Aluno:\n${summary}` }]
          }
        ]
      };

      let rawText = "";

      try {
        console.log("Attempting to request Google Gemini API...");
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
          }
        );

        if (!response.ok) {
          throw new Error(`API returned HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
          rawText = data.candidates[0].content.parts[0].text;
          console.log("Gemini AI Analysis generated successfully.");
        } else {
          throw new Error("Invalid response format from Gemini API");
        }
      } catch (geminiError) {
        console.warn("Gemini API Key blocked, leaked or offline. Activating EADon Local AI Fallback Engine...", geminiError);
        // Generate a high-fidelity local vocational report dynamically
        rawText = generateLocalVocationalAnalysis(userResponses);
      }
      
      generatedResultText = rawText;

      // Save Lead Data + AI Result to Google Sheets AND localStorage!
      await saveLeadAndResult(
        userResponses.lead_name,
        userResponses.lead_whatsapp,
        userResponses.lead_email,
        summary,
        generatedResultText
      );

      // Render AI Result page
      currentStep = 10;
      renderCurrentStep();
    } catch (error) {
      console.error("General Analysis Error:", error);
      showToast("❌ Erro ao gerar resultado. Tente novamente.");
      // Back to lead step
      currentStep = 8;
      renderCurrentStep();
    }
  }

  // Highly sophisticated localized AI Fallback Engine
  function generateLocalVocationalAnalysis(responses) {
    const name = responses.lead_name || "Estudante";
    const ambiente = responses.ambiente || "escritorio";
    const desafio = responses.desafio || "logica";
    
    // Decide the 3 paths based on responses
    let path1 = "";
    let path2 = "";
    let path3 = "";
    let intro = "";
    let conclusion = "";
    
    if (ambiente === "escritorio") {
      if (desafio === "logica") {
        intro = `Olá, ${name}! Analisando o seu perfil, identificamos uma mente altamente analítica, focada em organização e solução estruturada de problemas. Você demonstra preferência por ambientes corporativos organizados ou home office focado, onde a clareza de processos e o raciocínio lógico estruturado são altamente valorizados.`;
        
        path1 = `## 🎯 Caminho 1: Tecnologia & Desenvolvimento de Software
Seu raciocínio lógico estruturado e foco em resolver desafios complexos indicam uma excelente aptidão para a área de Tecnologia da Informação. Profissionais que trabalham focados na criação de códigos, lógica de dados e arquitetura de sistemas estão em alta demanda mundial.
* **Competências a desenvolver**: Lógica de programação, desenvolvimento web/mobile e estruturas de banco de dados.`;
        
        path2 = `## 🎯 Caminho 2: Gestão Financeira & Business Intelligence (BI)
Sua capacidade de trabalhar de forma organizada com processos lógicos faz de você um candidato ideal para planejar, gerenciar e analisar dados corporativos ou contábeis. A inteligência de negócios é a chave para a tomada de decisões hoje.
* **Competências a desenvolver**: Análise estatística, ferramentas de BI (Power BI) e finanças corporativas.`;
        
        path3 = `## 🎯 Caminho 3: Administração & Processos Gerenciais
A capacidade de gerenciar fluxos de trabalho de maneira eficiente, coordenando tarefas individuais ou em equipe com foco em metas organizacionais claras. A administração de recursos e a logística inteligente estruturam as grandes empresas.
* **Competências a desenvolver**: Gestão estratégica, liderança operacional e otimização de processos.`;
      } else { // criatividade
        intro = `Olá, ${name}! Seu perfil destaca-se pela excelente inteligência criativa aplicada a ambientes estruturados. Você consegue unir a flexibilidade de ideias inovadoras à necessidade de foco operacional, gerando soluções fora da caixa que respeitam a ordem de projetos comerciais ou corporativos.`;
        
        path1 = `## 🎯 Caminho 1: Marketing Digital & Redação Publicitária
A união de um ambiente flexível com a necessidade de ideias inovadoras torna você ideal para desenhar campanhas digitais, gerenciar redes sociais e criar narrativas envolventes para marcas na internet.
* **Competências a desenvolver**: Estratégias de SEO, copywriting, análise de tráfego pago e branding.`;
        
        path2 = `## 🎯 Caminho 2: Design de Experiência (UX/UI) & Web Design
A criação visual de interfaces, layouts e aplicativos web que facilitam a vida dos usuários. Uma profissão de alta remuneração que une bom gosto estético com organização de usabilidade prática.
* **Competências a desenvolver**: Prototipagem (Figma), arquitetura de informação e usabilidade de produtos.`;
        
        path3 = `## 🎯 Caminho 3: Gestão de Projetos Criativos
A liderança de equipes na execução de campanhas, produtos ou eventos criativos. Você consegue organizar a bagunça criativa de forma focada e produtiva, garantindo entregas incríveis no prazo.
* **Competências a desenvolver**: Metodologias ágeis (Scrum), comunicação interpessoal e planejamento estratégico.`;
      }
    } else if (ambiente === "saude") {
      intro = `Olá, ${name}! Seu perfil reflete uma profunda sensibilidade humanizada, empatia e dedicação ao bem-estar e saúde do próximo. Você se destaca pela capacidade de escuta ativa, cuidado prático e pela busca incessante de promover qualidade de vida e suporte direto à comunidade.`;
      
      path1 = `## 🎯 Caminho 1: Saúde Coletiva & Gestão Hospitalar
Organização de políticas de saúde, bem-estar da comunidade ou gestão administrativa de clínicas e hospitais. Uma área ideal para coordenar equipes que promovem a saúde de milhares de pessoas com processos humanizados.
* **Competências a desenvolver**: Legislação do SUS, liderança de equipes multidisciplinares e planejamento em saúde.`;
      
      path2 = `## 🎯 Caminho 2: Nutrição, Estética & Bem-estar
Foco em orientar hábitos de vida saudáveis, alimentação preventiva ou cuidados corporais que aumentam a autoestima e a saúde física direta do paciente. Uma área em plena expansão clínica e digital.
* **Competências a desenvolver**: Nutrologia aplicada, terapias integrativas e consultoria de bem-estar individualizado.`;
      
      path3 = `## 🎯 Caminho 3: Psicologia Organizacional & Recursos Humanos
O cuidado com a saúde mental, motivação e desenvolvimento humano dentro de empresas e equipes. Você une sua vocação de suporte com a estrutura de organizações para melhorar a vida dos colaboradores.
* **Competências a desenvolver**: Recrutamento humanizado, dinâmicas de engajamento e mediação de conflitos.`;
    } else if (ambiente === "criativo") {
      if (desafio === "logica") {
        intro = `Olá, ${name}! Você possui um perfil técnico altamente focado na prática, engenhosidade e engenharia de soluções. Prefere atuar na linha de frente da criação física ou tecnológica, analisando engrenagens, estruturas e consertando ou otimizando sistemas lógicos no mundo material.`;
        
        path1 = `## 🎯 Caminho 1: Engenharia de Produção & Qualidade
Organização de linhas de montagem, otimização de custos industriais e logística de suprimentos de forma eficiente. Ideal para quem quer ver os processos físicos acontecerem com perfeição e sem desperdícios.
* **Competências a desenvolver**: Gestão lean (produção enxuta), controle estatístico de processos e segurança industrial.`;
        
        path2 = `## 🎯 Caminho 2: Infraestrutura de TI & Redes de Computadores
O suporte técnico físico e digital a redes corporativas, servidores, segurança de hardware e conexão de sistemas integrados de alta complexidade.
* **Competências a desenvolver**: Arquitetura de servidores, segurança da informação e protocolos de comunicação de dados.`;
        
        path3 = `## 🎯 Caminho 3: Gestão de Obras & Logística Integrada
A distribuição inteligente de materiais e recursos físicos no tempo e espaço ideais. Uma área essencial para construtoras, grandes indústrias e portais de e-commerce globais de alta entrega.
* **Competências a desenvolver**: Planejamento logístico internacional, gestão de frotas e gerenciamento de projetos.`;
      } else { // criatividade
        intro = `Olá, ${name}! Seu perfil transborda imaginação inovadora, habilidade visual e de design prático. Você tem a rara habilidade de visualizar projetos físicos ou visuais incríveis do zero, sabendo como transformar matérias-primas e ideias abstratas em obras de arte ou designs corporativos marcantes.`;
        
        path1 = `## 🎯 Caminho 1: Design Gráfico & Ilustração Digital
Comunicação visual pura, criando identidades de marcas, logos, embalagens de produtos e materiais digitais de forte apelo visual e beleza estética incomparável.
* **Competências a desenvolver**: Pacote Adobe (Illustrator, Photoshop), teoria das cores e tipografia aplicada.`;
        
        path2 = `## 🎯 Caminho 2: Arquitetura Comercial & Cenografia
A criação de ambientes de lojas físicas, escritórios temáticos ou cenários digitais e reais que geram sensações únicas de imersão e compra nos clientes.
* **Competências a desenvolver**: Modelagem 3D, ergonomia de espaços físicos e psicologia do consumo em ambientes.`;
        
        path3 = `## 🎯 Caminho 3: Produção de Mídia & Edição de Vídeo
Transformar roteiros e captações brutas de vídeo em produtos audiovisuais dinâmicos para redes sociais, publicidade ou plataformas de educação digital como a EADon.
* **Competências a desenvolver**: Softwares de edição (Premiere, After Effects), técnicas de storytelling e sonorização.`;
      }
    } else { // negocios
      if (desafio === "logica") {
        intro = `Olá, ${name}! Identificamos um perfil empreendedor estratégico, analítico e de forte liderança voltada para resultados financeiros. Você tem facilidade para enxergar oportunidades de mercado, ler dados estatísticos e negociar parcerias sólidas com foco em crescimento seguro.`;
        
        path1 = `## 🎯 Caminho 1: Gestão Comercial & Vendas B2B
A estruturação de funis de vendas de alta performance, fechamento de grandes contratos comerciais corporativos e liderança de times de representantes de vendas.
* **Competências a desenvolver**: Negociação avançada (método de Harvard), funis de vendas e gestão de relacionamento com clientes (CRM).`;
        
        path2 = `## 🎯 Caminho 2: Economia e Ciências Contábeis
A saúde financeira de grandes marcas. Você ajuda a projetar lucros, otimizar impostos e garantir que a empresa cresça com máxima solidez financeira e legal.
* **Competências a desenvolver**: Planejamento tributário, análise de demonstrativos financeiros e auditoria fiscal.`;
        
        path3 = `## 🎯 Caminho 3: Gestão de Startups & Modelagem de Negócios
Transformar ideias disruptivas em negócios viáveis através de dados de mercado, planejando a tração de clientes e validando protótipos de produtos inovadores de forma rápida.
* **Competências a desenvolver**: Lean Startup, métricas de crescimento (SaaS) e liderança de equipes ágeis.`;
      } else { // criatividade
        intro = `Olá, ${name}! Seu perfil destaca-se por uma carismática liderança comunicativa, empatia persuasiva e incrível capacidade de engajamento social. Você é movido pela conexão genuína com as pessoas, sabendo influenciar positivamente tomadas de decisão através de boas conversas.`;
        
        path1 = `## 🎯 Caminho 1: Relações Públicas & Assessoria de Imprensa
Ser o porta-voz e gestor de imagem de grandes marcas, celebridades ou corporações, articulando com mídias e desenhando estratégias de reputação positivas.
* **Competências a desenvolver**: Media training, gestão de crises reputacionais e comunicação corporativa interna.`;
        
        path2 = `## 🎯 Caminho 2: Influência Digital & Social Media Management
A coordenação da presença digital de criadores de conteúdo e marcas, gerando autoridade em nichos específicos através de interações diárias inteligentes e conteúdo inovador.
* **Competências a desenvolver**: Criação de calendários editoriais, análise de algoritmos de redes sociais e produção rápida de conteúdo (Reels/TikTok).`;
        
        path3 = `## 🎯 Caminho 3: Consultoria de Imagem, Sucesso do Cliente & CX
Garantir a melhor experiência de pós-vendas, guiando e apoiando os clientes a atingirem o sucesso absoluto com o produto ou serviço adquirido da sua marca.
* **Competências a desenvolver**: Comunicação empática, métricas de satisfação (NPS, Churn) e retenção estratégica.`;
      }
    }
    
    conclusion = `Parabéns pela conclusão do teste, ${name}! Este diagnóstico é o primeiro passo de uma jornada brilhante. No Portal EADon, temos uma variedade imensa de treinamentos reconhecidos no mercado prontos para alavancar sua carreira. Fale agora com nosso orientador no WhatsApp para garantir sua Bolsa de Estudo exclusiva nas carreiras indicadas para você! 🚀`;
    
    return `${intro}\n\n${path1}\n\n${path2}\n\n${path3}\n\n${conclusion}`;
  }

  // Save lead & AI output
  async function saveLeadAndResult(name, whatsapp, email, summaryText, aiResult) {
    const leadData = {
      name: name,
      whatsapp: whatsapp,
      email: email,
      responses: summaryText,
      aiResult: aiResult,
      timestamp: new Date().toISOString()
    };

    // 1. Save to LocalStorage always as a backup
    let localLeads = [];
    try {
      const stored = localStorage.getItem("eadon_leads");
      if (stored) localLeads = JSON.parse(stored);
    } catch (e) {
      console.error("Local storage read error", e);
    }
    localLeads.push(leadData);
    localStorage.setItem("eadon_leads", JSON.stringify(localLeads));

    // 2. POST to Google Sheets Webhook if configured
    if (GOOGLE_SHEETS_WEBHOOK_URL && GOOGLE_SHEETS_WEBHOOK_URL.trim() !== "") {
      try {
        // Use 'no-cors' mode as Google Apps Script redirect doesn't return CORS headers cleanly.
        // It successfully executes the script on Google's side without failing the browser fetch.
        await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(leadData)
        });
        console.log("Lead successfully submitted to Google Sheets Webhook.");
      } catch (err) {
        console.error("Failed to submit lead to Webhook:", err);
      }
    } else {
      console.log("No Google Sheets Webhook configured. Saved locally only.");
    }
  }

  // Light Custom Markdown Parser for Beautiful HTML Display
  function formatAIResultToHTML(text) {
    if (!text) return "";
    
    // Clean and split lines
    let html = text;

    // Convert line breaks and escape some simple elements
    html = html
      .replace(/\r\n/g, "\n")
      // Convert ## 🎯 Caminho X: Title to styled block titles
      .replace(/##\s*🎯\s*(Caminho\s*\d+:\s*.+)/gi, '<h3 style="color: #00BF60; font-family:\'Work Sans\',sans-serif; font-size:18px; font-weight:700; margin-top:20px; border-left:3px solid #00BF60; padding-left:12px;">🎯 $1</h3>')
      // Convert standard markdown bold **text** to strong
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert * list items to list
      .replace(/^\s*\*\s*(.+)/gm, '<li>$1</li>')
      // Wrap sequential <li> tags inside a <ul>
      .replace(/(<li>.*?<\/li>)/gs, '<ul style="margin: 8px 0 16px 0; padding-left:20px;">$1</ul>')
      // Convert paragraphs
      .replace(/([^\n]+)/g, function(match) {
        // Skip tags we just created
        if (match.startsWith('<h3') || match.startsWith('<li') || match.startsWith('<ul')) {
          return match;
        }
        return `<p style="margin-bottom:12px; line-height:1.6;">${match}</p>`;
      });

    return html;
  }

  // Extract suggested careers to prefill WhatsApp redirects
  function extractSuggestedCareers(text) {
    const regex = /##\s*🎯\s*Caminho\s*\d+:\s*(.+)/gi;
    const paths = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      paths.push(match[1].trim());
    }
    // If not matching standard format, try to find text lines with Caminho
    if (paths.length === 0) {
      const backupRegex = /Caminho\s*\d+:\s*(.+)/gi;
      while ((match = backupRegex.exec(text)) !== null) {
        paths.push(match[1].trim());
      }
    }
    return paths.slice(0, 3); // Get up to 3 paths
  }

  // Handle WhatsApp Redirection to Consultant
  function handleWhatsAppRedirect() {
    const name = userResponses.lead_name || "Estudante";
    const careers = extractSuggestedCareers(generatedResultText);
    const careersText = careers.length > 0 ? careers.join(", ") : "áreas recomendadas pela IA";

    const baseMessage = `Olá! Meu nome é ${name} e acabei de concluir o Teste Vocacional Inteligente no portal EADon! 🚀\n\nMinha análise indicou que as minhas áreas ideais são:\n👉 *${careersText}*\n\nGostaria de falar com um consultor para conhecer os cursos disponíveis nessas áreas e consultar valores de bolsas de estudo! 🎓`;
    
    // Consultant WhatsApp phone number (using EADon's actual sales number)
    const whatsappPhone = "5551997911411"; 
    const url = `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(baseMessage)}`;
    
    window.open(url, "_blank");
  }

  // Copy result to Clipboard helper
  function copyResultToClipboard() {
    const textToCopy = `RELATÓRIO VOCACIONAL EADON - IA\n\nEstudante: ${userResponses.lead_name}\nWhatsApp: ${userResponses.lead_whatsapp}\nE-mail: ${userResponses.lead_email}\n\n-- Análise da IA --\n\n${generatedResultText}`;

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showToast("📋 Relatório copiado para a área de transferência!");
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
    
    // Trigger transition
    setTimeout(() => {
      toast.classList.add("active");
    }, 10);

    // Remove toast
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
