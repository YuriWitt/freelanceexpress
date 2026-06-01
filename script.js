const form = document.querySelector('#contact-form');
const statusMessage = document.querySelector('#form-status');
const serviceCards = document.querySelectorAll('.service-card.interactive');
const modal = document.querySelector('#service-modal');
const modalClose = document.querySelector('#modal-close');
const modalTitle = document.querySelector('#modal-title');
const modalDescription = document.querySelector('#modal-description');
const modalBenefits = document.querySelector('#modal-benefits');
const modalQuote = document.querySelector('#modal-quote');
const serviceSelect = document.querySelector('select[name="service"]');
const contactSection = document.querySelector('#contact');
const API_BASE_URL = resolveApiBaseUrl();

const serviceDetails = {
  web: {
    title: 'Desenvolvimento Web',
    description: 'Construímos sites profissionais que funcionam perfeitamente em desktop e dispositivos móveis.',
    benefits: [
      'Design responsivo e moderno',
      'Performance otimizada para carregamento',
      'Integração com formulários e lojas virtuais',
    ],
  },
  design: {
    title: 'Desenvolvimento Mobile',
    description: 'Criamos aplicativos para iOS e Android, com interface intuitiva e desempenho otimizado.',
    benefits: [
      'Otimização de performance',
      'Identidade visual consistente',
      'Interfaces de alta qualidade',
    ],
  },
  marketing: {
    title: 'Infraestrutura',
    description: 'Configuração e manutenção de servidores, redes e sistemas.',
    benefits: [
      'Configuração de servidores',
      'Manutenção preventiva e corretiva',
      'Suporte técnico especializado',
    ],
  },
  conteudo: {
    title: 'Conteúdo e Copywriting',
    description: 'Produzimos textos persuasivos que comunicam sua mensagem de forma clara e atraente.',
    benefits: [
      'Textos para sites e blogs',
      'E-mails e newsletters',
      'Mensagens que vendem',
    ],
  },
  uxui: {
    title: 'Consultoria UX/UI',
    description: 'Melhoramos a experiência do usuário para aumentar a satisfação e a conversão.',
    benefits: [
      'Pesquisa e prototipagem',
      'Fluxos de navegação intuitivos',
      'Interface visual amigável',
    ],
  },
  suporte: {
    title: 'Manutenção e Suporte',
    description: 'Oferecemos manutenção contínua para manter seu site seguro e atualizado.',
    benefits: [
      'Atualizações técnicas regulares',
      'Correção de bugs e ajustes rápidos',
      'Suporte para mudanças pequenas e médias',
    ],
  },
};

function openModal(serviceKey) {
  const details = serviceDetails[serviceKey];
  if (!details) return;

  modalTitle.textContent = details.title;
  modalDescription.textContent = details.description;
  modalBenefits.innerHTML = details.benefits.map((item) => `<li>${item}</li>`).join('');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  modalQuote.dataset.serviceKey = serviceKey;
}

function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  modalQuote.removeAttribute('data-service-key');
}

serviceCards.forEach((card) => {
  const serviceKey = card.dataset.service;
  card.addEventListener('click', () => openModal(serviceKey));
  card.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openModal(serviceKey);
    }
  });
});

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal || event.target === document.querySelector('.modal-backdrop')) {
    closeModal();
  }
});

modalQuote.addEventListener('click', () => {
  const selectedService = modalQuote.dataset.serviceKey;
  if (selectedService && serviceSelect) {
    serviceSelect.value = selectedService;
    closeModal();
    contactSection.scrollIntoView({ behavior: 'smooth' });
  }
});

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      service: formData.get('service'),
      message: formData.get('message'),
      company: formData.get('company') || '',
    };

    statusMessage.textContent = 'Enviando solicitação...';
    statusMessage.style.color = '#9cb0ff';

    try {
      const response = await fetch(buildApiUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Falha ao enviar a mensagem.');
      }

      statusMessage.textContent = result.message;
      statusMessage.style.color = '#a5d6a7';
      form.reset();
    } catch (error) {
      const fallbackMessage = 'Erro ao enviar. Por favor tente via WhatsApp ou e-mail.';
      statusMessage.textContent =
        error && error.message && error.message !== 'Failed to fetch' ? error.message : fallbackMessage;
      statusMessage.style.color = '#ff8a8a';
      console.error(error);
    }
  });
}

function resolveApiBaseUrl() {
  if (window.__APP_CONFIG__ && typeof window.__APP_CONFIG__.apiBaseUrl === 'string') {
    return window.__APP_CONFIG__.apiBaseUrl.replace(/\/+$/, '');
  }

  return '';
}

function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

// Projects data and renderer
const projects = [
  {
    title: 'Projeto Exemplo',
    description: 'Landing page responsiva construída com HTML, CSS e JS. Integração básica com formulário de contato.',
    github: 'https://yuriwitt.github.io/Site-reciclagem/',
    live: '',
    status: 'live', // 'live' or 'dev'
  },
  {
    title: 'App em Desenvolvimento',
    description: 'Aplicativo mobile com foco em produtividade — versão inicial em protótipo.',
    github: 'https://github.com/SEU_USUARIO/app-dev',
    live: '',
    status: 'dev',
  },
];

function renderProjects() {
  const list = document.querySelector('#projects-list');
  if (!list) return;

  if (!projects || projects.length === 0) {
    list.innerHTML = '<p>Nenhum projeto disponível no momento.</p>';
    return;
  }

  const slides = projects
    .map((p, idx) => {
      const badge = p.status === 'dev' ? '<span class="project-badge">Em desenvolvimento</span>' : '';
      const liveLink = p.live
        ? `<a class="project-link" href="${p.live}" target="_blank" rel="noopener noreferrer">Página inicial</a>`
        : '';
      const githubLink = p.github
        ? `<a class="project-link" href="${p.github}" target="_blank" rel="noopener noreferrer">Ver no GitHub</a>`
        : '';

      return `
        <li class="carousel-slide" role="group" aria-roledescription="slide" aria-label="${idx + 1} de ${projects.length}" data-index="${idx}" aria-hidden="${idx === 0 ? 'false' : 'true'}">
          <article class="project-card">
            ${badge}
            <h3>${p.title}</h3>
            <p class="project-desc">${p.description}</p>
            <div class="project-actions">
              ${liveLink}
              ${githubLink}
            </div>
          </article>
        </li>
      `;
    })
    .join('');

  list.innerHTML = `
    <div class="projects-carousel" tabindex="0">
      <button class="carousel-prev" aria-label="Anterior">‹</button>
      <div class="carousel-viewport">
        <ul class="carousel-track">
          ${slides}
        </ul>
      </div>
      <button class="carousel-next" aria-label="Próximo">›</button>
      <div class="carousel-indicators">
        ${projects.map((_, i) => `<button class="indicator" aria-label="Ir para slide ${i + 1}" data-index="${i}" ${i === 0 ? 'aria-current="true"' : ''}></button>`).join('')}
      </div>
    </div>
  `;

  initCarousel(list.querySelector('.projects-carousel'));
}

function initCarousel(root) {
  if (!root) return;
  const track = root.querySelector('.carousel-track');
  const slides = Array.from(track.children);
  const prevBtn = root.querySelector('.carousel-prev');
  const nextBtn = root.querySelector('.carousel-next');
  const indicators = Array.from(root.querySelectorAll('.indicator'));
  let current = 0;
  let autoplayId = null;

  function update() {
    track.style.transform = `translateX(-${current * 100}%)`;
    slides.forEach((s, i) => s.setAttribute('aria-hidden', i === current ? 'false' : 'true'));
    indicators.forEach((btn, i) => {
      if (i === current) {
        btn.setAttribute('aria-current', 'true');
      } else {
        btn.removeAttribute('aria-current');
      }
    });
  }

  function next() {
    current = (current + 1) % slides.length;
    update();
  }

  function prev() {
    current = (current - 1 + slides.length) % slides.length;
    update();
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  indicators.forEach((btn) => {
    btn.addEventListener('click', () => {
      current = Number(btn.dataset.index);
      update();
    });
  });

  // keyboard navigation when carousel is focused
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // autoplay
  function startAutoplay() {
    stopAutoplay();
    autoplayId = setInterval(next, 6000);
  }

  function stopAutoplay() {
    if (autoplayId) {
      clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('focusin', stopAutoplay);
  root.addEventListener('mouseleave', startAutoplay);
  root.addEventListener('focusout', startAutoplay);

  // initialize
  update();
  startAutoplay();
}

// Initialize projects on DOMContentLoaded
document.addEventListener('DOMContentLoaded', renderProjects);
