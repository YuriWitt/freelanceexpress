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
    title: 'Design Gráfico',
    description: 'Criamos identidade visual consistente para fortalecer sua marca em qualquer canal.',
    benefits: [
      'Logos e identidade visual',
      'Materiais digitais e impressos',
      'Layouts de alta qualidade',
    ],
  },
  marketing: {
    title: 'Marketing Digital',
    description: 'Planejamos campanhas eficazes para aumentar alcance, conversão e engajamento.',
    benefits: [
      'Conteúdo estratégico para redes sociais',
      'Anúncios otimizados para ROI',
      'Monitoramento de resultados',
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
    };

    statusMessage.textContent = 'Enviando solicitação...';
    statusMessage.style.color = '#9cb0ff';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Falha ao enviar a mensagem.');
      }

      statusMessage.textContent = result.message;
      statusMessage.style.color = '#a5d6a7';
      form.reset();
    } catch (error) {
      statusMessage.textContent = 'Erro ao enviar. Por favor tente via WhatsApp ou e-mail.';
      statusMessage.style.color = '#ff8a8a';
      console.error(error);
    }
  });
}
