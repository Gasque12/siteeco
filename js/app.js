/**
 * ECOREFIL - MERCADO DE PRODUTOS A GRANEL
 * Módulo Principal da Aplicação (app.js)
 * Orquestração, Checkout, WhatsApp, Delivery, Assinaturas e Gráficos
 */

const WHATSAPP_PHONE = '5519998668149';

const DELIVERY_RATES = {
  'Vila Rezende': { fee: 3.00, time: '20 a 30 min', distance: '1,2 km', co2Saved: '320g' },
  'São Dimas': { fee: 5.00, time: '30 a 40 min', distance: '3,1 km', co2Saved: '540g' },
  'Cidade Alta': { fee: 6.00, time: '35 a 45 min', distance: '4,5 km', co2Saved: '720g' },
  'Centro': { fee: 5.00, time: '30 a 40 min', distance: '3,4 km', co2Saved: '610g' },
  'Jardim Primavera': { fee: 7.00, time: '40 a 50 min', distance: '5,2 km', co2Saved: '890g' }
};

// Inicialização Geral da Página
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initProductsSection();
  initCartListeners();
  initAuthUI();
  initDeliveryCalculator();
  initFinancialCharts();
  initContactForm();
  initBackToTop();
  updateCartBadge();
  updateAuthUI();
});

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;

  const icons = {
    success: '🌿',
    error: '⚠️',
    warning: '💡',
    info: '✨'
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '🌱'}</span>
    <div class="toast-text">${message}</div>
    <button type="button" class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);

  // Animar entrada
  setTimeout(() => toast.classList.add('visible'), 20);

  // Auto-remover após 4.5 segundos
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

// Navbar & Menu Mobile
function initNavbar() {
  const header = document.querySelector('.site-header');
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('main-nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Efeito de sombra e blur no scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Toggle do menu mobile
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      menuToggle.classList.toggle('active');
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
    });

    // Fechar ao clicar em qualquer link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

// Navegação suave entre seções
function scrollToSection(sectionId) {
  const elem = document.getElementById(sectionId);
  if (elem) {
    const offset = 80;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elemRect = elem.getBoundingClientRect().top;
    const elemPosition = elemRect - bodyRect;
    const offsetPosition = elemPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

// Inicializar Seção de Produtos e Filtros
function initProductsSection() {
  const products = getStoredProducts();
  renderProductsGrid(products, 'todos');

  // Filtros de Categoria
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.dataset.category || 'todos';
      const searchInput = document.getElementById('product-search-input');
      const searchTerm = searchInput ? searchInput.value : '';
      renderProductsGrid(getStoredProducts(), category, searchTerm);
    });
  });

  // Pesquisa de Produtos em Tempo Real
  const searchInput = document.getElementById('product-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const activeFilterBtn = document.querySelector('.filter-btn.active');
      const currentCategory = activeFilterBtn ? activeFilterBtn.dataset.category : 'todos';
      renderProductsGrid(getStoredProducts(), currentCategory, e.target.value);
    });
  }
}

// Atalho rápido de pesquisa no Header
function focusProductSearch() {
  scrollToSection('produtos');
  setTimeout(() => {
    const input = document.getElementById('product-search-input');
    if (input) {
      input.focus();
      input.select();
    }
  }, 400);
}

// Listeners do Carrinho
function initCartListeners() {
  const overlay = document.getElementById('cart-drawer-overlay');
  if (overlay) {
    overlay.addEventListener('click', () => toggleCart(false));
  }

  // Listener para checkbox de reutilizar embalagem no carrinho
  const reuseCheck = document.getElementById('cart-reuse-packaging-check');
  if (reuseCheck) {
    reuseCheck.addEventListener('change', (e) => {
      setReusingPackaging(e.target.checked);
      if (e.target.checked) {
        showToast('Incrível! Você trará sua embalagem e ganhará +5 EcoPontos por item! ♻️', 'success');
      }
    });
  }
}

// Inicializar Usuários
function initAuthUI() {
  // Configurar formulário de login
  const loginForm = document.getElementById('form-login');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;
      const res = loginUser(email, pass);
      if (res.success) {
        closeAuthModal();
      }
    });
  }

  // Configurar formulário de cadastro
  const regForm = document.getElementById('form-register');
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      const phone = document.getElementById('reg-phone').value;
      const address = document.getElementById('reg-address').value;
      const neighborhood = document.getElementById('reg-neighborhood').value;

      const res = registerUser({ name, email, password, phone, address, neighborhood });
      if (res.success) {
        closeAuthModal();
      }
    });
  }
}

// Calculadora de Delivery Sustentável
function initDeliveryCalculator() {
  const select = document.getElementById('delivery-calc-neighborhood');
  if (!select) return;

  select.addEventListener('change', () => {
    calculateDeliveryNeighborhood(select.value);
  });

  // Cálculo inicial padrão
  calculateDeliveryNeighborhood(select.value);
}

function calculateDeliveryNeighborhood(neighborhood) {
  const resultCard = document.getElementById('delivery-calc-result');
  const feeEl = document.getElementById('calc-fee-val');
  const timeEl = document.getElementById('calc-time-val');
  const co2El = document.getElementById('calc-co2-val');
  const distanceEl = document.getElementById('calc-distance-val');

  const data = DELIVERY_RATES[neighborhood];
  if (!data) return;

  if (feeEl) feeEl.textContent = `R$ ${data.fee.toFixed(2).replace('.', ',')}`;
  if (timeEl) timeEl.textContent = data.time;
  if (co2El) co2El.textContent = `-${data.co2Saved}`;
  if (distanceEl) distanceEl.textContent = data.distance;

  if (resultCard) {
    resultCard.classList.remove('hidden');
  }
}

// CHECKOUT: Abrir e Inicializar
function openCheckoutModal() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Seu carrinho está vazio. Adicione produtos antes de finalizar.', 'warning');
    return;
  }

  // Fechar gaveta do carrinho
  toggleCart(false);

  const modal = document.getElementById('checkout-modal');
  if (!modal) return;

  // Auto-preencher dados com o usuário logado se existir
  const user = getCurrentUser();
  if (user) {
    const nameInput = document.getElementById('checkout-name');
    const phoneInput = document.getElementById('checkout-phone');
    const emailInput = document.getElementById('checkout-email');
    const addrInput = document.getElementById('checkout-address');
    const numInput = document.getElementById('checkout-number');
    const neighSelect = document.getElementById('checkout-neighborhood');

    if (nameInput) nameInput.value = user.name || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (emailInput) emailInput.value = user.email || '';
    if (addrInput) addrInput.value = user.address || '';
    if (numInput) numInput.value = user.number || '';
    if (neighSelect && user.neighborhood) neighSelect.value = user.neighborhood;
  }

  updateCheckoutSummary();

  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
}

// Atualizar resumo do Checkout
function updateCheckoutSummary() {
  const cart = getCart();
  const totals = getCartTotals();
  const deliveryModeRadio = document.querySelector('input[name="checkout-delivery-mode"]:checked');
  const deliveryMode = deliveryModeRadio ? deliveryModeRadio.value : 'retirada';
  const neighborhoodSelect = document.getElementById('checkout-neighborhood');
  const neighborhood = neighborhoodSelect ? neighborhoodSelect.value : 'Vila Rezende';

  let deliveryFee = 0;
  if (deliveryMode === 'bike') {
    const rateData = DELIVERY_RATES[neighborhood];
    deliveryFee = rateData ? rateData.fee : 4.00;

    // Se o cupom ativo for frete grátis
    if (totals.activeCoupon && totals.activeCoupon.type === 'free_shipping') {
      deliveryFee = 0;
    }
  }

  const finalTotal = Math.max(0, totals.total + deliveryFee);

  // Renderizar itens no checkout
  const itemsContainer = document.getElementById('checkout-items-list');
  if (itemsContainer) {
    itemsContainer.innerHTML = cart.map(item => `
      <div class="checkout-summary-item">
        <span class="chk-item-name">${item.quantity}L ${item.name}</span>
        <span class="chk-item-price">R$ ${(item.pricePerLiter * item.quantity).toFixed(2).replace('.', ',')}</span>
      </div>
    `).join('');
  }

  // Atualizar valores na tela
  const subtotalEl = document.getElementById('checkout-subtotal-val');
  const feeEl = document.getElementById('checkout-delivery-fee-val');
  const totalEl = document.getElementById('checkout-total-val');
  const pointsToEarnEl = document.getElementById('checkout-points-earn-val');
  const deliveryAddressFields = document.getElementById('checkout-delivery-address-fields');

  if (subtotalEl) subtotalEl.textContent = `R$ ${totals.subtotal.toFixed(2).replace('.', ',')}`;
  if (feeEl) {
    if (deliveryMode === 'retirada') {
      feeEl.textContent = 'Grátis (Retirada na Loja)';
    } else {
      feeEl.textContent = deliveryFee === 0 ? 'Grátis (Cupom EcoPontos)' : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`;
    }
  }
  if (totalEl) totalEl.textContent = `R$ ${finalTotal.toFixed(2).replace('.', ',')}`;
  if (pointsToEarnEl) pointsToEarnEl.textContent = `+${totals.estimatedPoints} EcoPontos`;

  // Exibir ou ocultar campos de endereço de entrega conforme o modo
  if (deliveryAddressFields) {
    deliveryAddressFields.classList.toggle('hidden', deliveryMode === 'retirada');
  }
}

// Alternar modo de entrega no checkout
function onDeliveryModeChanged() {
  updateCheckoutSummary();
}

// Alternar método de pagamento no checkout
function onPaymentMethodChanged() {
  const methodRadio = document.querySelector('input[name="checkout-payment-method"]:checked');
  const method = methodRadio ? methodRadio.value : 'pix';

  const pixDetails = document.getElementById('payment-details-pix');
  const cardDetails = document.getElementById('payment-details-card');
  const cashDetails = document.getElementById('payment-details-cash');

  if (pixDetails) pixDetails.classList.toggle('hidden', method !== 'pix');
  if (cardDetails) cardDetails.classList.toggle('hidden', method !== 'card');
  if (cashDetails) cashDetails.classList.toggle('hidden', method !== 'cash');
}

// Copiar chave Pix simulada
function copyPixKey() {
  const key = '5519998668149';
  navigator.clipboard.writeText(key).then(() => {
    showToast('Chave Pix (Telefone) copiada com sucesso!', 'success');
  }).catch(() => {
    showToast('Chave Pix: 19998668149', 'info');
  });
}

// Confirmar Pedido
function submitCheckoutOrder(event) {
  event.preventDefault();

  const cart = getCart();
  if (cart.length === 0) {
    showToast('O carrinho está vazio.', 'error');
    return;
  }

  const name = document.getElementById('checkout-name').value.trim();
  const phone = document.getElementById('checkout-phone').value.trim();
  const email = document.getElementById('checkout-email').value.trim();
  const deliveryModeRadio = document.querySelector('input[name="checkout-delivery-mode"]:checked');
  const deliveryMode = deliveryModeRadio ? deliveryModeRadio.value : 'retirada';
  const paymentRadio = document.querySelector('input[name="checkout-payment-method"]:checked');
  const paymentMethod = paymentRadio ? paymentRadio.value : 'pix';

  if (!name || !phone) {
    showToast('Por favor, informe seu Nome e Telefone/WhatsApp.', 'warning');
    return;
  }

  let address = 'Retirada na Loja física (Rua Maria Manieiro, Vila Rezende)';
  let neighborhood = 'Vila Rezende';
  let deliveryFee = 0;

  if (deliveryMode === 'bike') {
    const street = document.getElementById('checkout-address').value.trim();
    const number = document.getElementById('checkout-number').value.trim();
    const neighSelect = document.getElementById('checkout-neighborhood');
    neighborhood = neighSelect ? neighSelect.value : 'Vila Rezende';

    if (!street || !number) {
      showToast('Por favor, informe a Rua e o Número para entrega por bike elétrica.', 'warning');
      return;
    }

    address = `${street}, nº ${number} - ${neighborhood}, Piracicaba/SP`;
    const rateData = DELIVERY_RATES[neighborhood];
    deliveryFee = rateData ? rateData.fee : 4.00;
  }

  const totals = getCartTotals();
  const finalTotal = Math.max(0, totals.total + deliveryFee);
  const orderNumber = '#ECO-2026-' + Math.floor(1000 + Math.random() * 9000);
  const currentUser = getCurrentUser();

  const orderData = {
    orderNumber,
    userId: currentUser ? currentUser.id : null,
    customerName: name,
    phone,
    email,
    date: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
    items: [...cart],
    subtotal: totals.subtotal,
    deliveryMode,
    deliveryFee,
    total: finalTotal,
    paymentMethod: paymentMethod === 'pix' ? 'Pix' : (paymentMethod === 'card' ? 'Cartão' : 'Dinheiro'),
    address,
    neighborhood,
    reusingPackaging: totals.reuseActive,
    earnedPoints: totals.estimatedPoints,
    status: 'pendente',
    statusText: 'Recebido'
  };

  // Salvar pedido no localStorage e creditar EcoPontos
  saveNewOrder(orderData);

  // Limpar carrinho
  clearCart();

  // Fechar modal de checkout
  closeCheckoutModal();

  // Abrir tela de confirmação do pedido
  openOrderSuccessModal(orderData);
}

// Modal de Sucesso do Pedido
function openOrderSuccessModal(order) {
  const modal = document.getElementById('order-success-modal');
  const content = document.getElementById('order-success-content');
  if (!modal || !content) return;

  const paymentLabels = {
    Pix: 'Pix (Chave celular: 19998668149)',
    Cartão: 'Cartão na máquina portátil do ciclista',
    Dinheiro: 'Dinheiro na entrega/retirada'
  };

  content.innerHTML = `
    <div class="success-icon-wrap">
      <div class="check-circle">✓</div>
    </div>
    <h3 class="success-title">Pedido realizado com sucesso!</h3>
    <p class="success-subtitle">Obrigado por escolher um consumo sustentável e sem desperdício de plástico.</p>

    <div class="success-order-box">
      <div class="order-box-row">
        <span>Número do Pedido:</span>
        <strong class="highlight-code">${order.orderNumber}</strong>
      </div>
      <div class="order-box-row">
        <span>Cliente:</span>
        <span>${order.customerName}</span>
      </div>
      <div class="order-box-row">
        <span>Entrega:</span>
        <span>${order.deliveryMode === 'bike' ? '🚲 Bicicleta Elétrica Sustentável' : '🏪 Retirada na Loja EcoRefil'}</span>
      </div>
      <div class="order-box-row">
        <span>Endereço:</span>
        <span>${order.address}</span>
      </div>
      <div class="order-box-row">
        <span>Forma de Pagamento:</span>
        <span>${paymentLabels[order.paymentMethod] || order.paymentMethod}</span>
      </div>
      <div class="order-box-row total-row">
        <span>Valor Total:</span>
        <strong class="total-big">R$ ${order.total.toFixed(2).replace('.', ',')}</strong>
      </div>
      <div class="success-points-alert">
        🌱 Parabéns! Você acumulou <strong>+${order.earnedPoints} EcoPontos</strong> com este pedido!
      </div>
    </div>

    <div class="success-actions">
      <button type="button" class="btn btn-whatsapp btn-block" onclick="sendOrderViaWhatsApp('${order.orderNumber}')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.299.144.347.491 1.2.534 1.288.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.087-.179.182-.077.357.101.174.453.748.971 1.21.668.595 1.232.78 1.406.866.173.087.275.072.376-.043.101-.116.433-.505.549-.679.116-.173.231-.144.39-.087s1.011.477 1.184.564c.173.087.289.13.332.202.043.073.043.419-.101.824z"/></svg>
        Enviar pedido pelo WhatsApp
      </button>
      <button type="button" class="btn btn-outline btn-block" onclick="closeOrderSuccessModal(); openAuthModal('profile')">
        Ver meus pedidos e EcoPontos
      </button>
    </div>
  `;

  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

function closeOrderSuccessModal() {
  const modal = document.getElementById('order-success-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
}

// Gerar e Enviar Pedido pelo WhatsApp
function sendOrderViaWhatsApp(orderNumber) {
  const orders = getStoredOrders();
  const order = orders.find(o => o.orderNumber === orderNumber);
  if (!order) {
    showToast('Pedido não encontrado para WhatsApp.', 'error');
    return;
  }

  const itemsList = order.items.map(it => `• ${it.name} - ${it.quantity}L (R$ ${(it.pricePerLiter * it.quantity).toFixed(2).replace('.', ',')})`).join('\n');
  const deliveryText = order.deliveryMode === 'bike' 
    ? `Bicicleta Elétrica (Taxa: R$ ${order.deliveryFee.toFixed(2).replace('.', ',')})`
    : 'Retirada na Loja física (Grátis)';
  const packagingText = order.reusingPackaging ? 'Sim, o cliente trará embalagens próprias (+EcoPontos)' : 'Frascos do EcoRefil';

  const message = `🌿 *NOVO PEDIDO - ECOREFIL* 🌿
------------------------------------
*Pedido:* ${order.orderNumber}
*Data:* ${order.date}
*Cliente:* ${order.customerName}
*Telefone:* ${order.phone}
*E-mail:* ${order.email || 'Não informado'}

*ITENS SELECIONADOS:*
${itemsList}

*Subtotal:* R$ ${order.subtotal ? order.subtotal.toFixed(2).replace('.', ',') : order.total.toFixed(2).replace('.', ',')}
*Entrega:* ${deliveryText}
*VALOR TOTAL:* R$ ${order.total.toFixed(2).replace('.', ',')}
*Pagamento:* ${order.paymentMethod}

*ENDEREÇO DE ENTREGA:*
${order.address}

*Reutilização de Embalagem:* ${packagingText}
*EcoPontos acumulados:* +${order.earnedPoints} pontos
------------------------------------
“Você compra o produto, não a embalagem.”
EcoRefil • Rua Maria Manieiro, Vila Rezende, Piracicaba - SP`;

  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

function resendOrderToWhatsApp(orderNumber) {
  sendOrderViaWhatsApp(orderNumber);
}

// Abrir WhatsApp direto para suporte/dúvidas
function openDirectWhatsAppChat() {
  const message = `Olá, EcoRefil! Gostaria de mais informações sobre os produtos de limpeza e higiene a granel, delivery de bike elétrica ou assinaturas!`;
  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// Modal de Benefícios de EcoPontos
function openEcoPointsModal() {
  const modal = document.getElementById('ecopoints-modal');
  const user = getCurrentUser();
  const currentPts = user ? user.ecoPoints : 0;

  const currentPtsEl = document.getElementById('modal-ecopoints-current');
  if (currentPtsEl) currentPtsEl.textContent = `${currentPts} EcoPontos`;

  // Habilitar ou desabilitar botões de resgate conforme saldo
  const btn50 = document.getElementById('claim-coupon-50');
  const btn100 = document.getElementById('claim-coupon-100');
  const btn200 = document.getElementById('claim-coupon-200');

  if (btn50) btn50.disabled = currentPts < 50;
  if (btn100) btn100.disabled = currentPts < 100;
  if (btn200) btn200.disabled = currentPts < 200;

  if (modal) {
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }
}

function closeEcoPointsModal() {
  const modal = document.getElementById('ecopoints-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
}

// Resgatar cupom de desconto com EcoPontos
function claimCoupon(pointsCost, couponType, value, desc) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Faça login ou cadastre-se para resgatar benefícios de EcoPontos!', 'warning');
    closeEcoPointsModal();
    openAuthModal('login');
    return;
  }

  if (user.ecoPoints < pointsCost) {
    showToast(`Você precisa de ${pointsCost} EcoPontos. Saldo atual: ${user.ecoPoints}.`, 'warning');
    return;
  }

  // Debitar pontos
  updateUserEcoPoints(user.id, -pointsCost);

  // Ativar cupom
  const coupon = {
    code: `ECO-${couponType.toUpperCase()}-${pointsCost}`,
    type: couponType,
    value: value,
    description: desc,
    cost: pointsCost
  };
  localStorage.setItem('ecorefil_active_coupon', JSON.stringify(coupon));

  showToast(`Parabéns! Benefício ativado: ${desc}! Aplicado automaticamente no seu carrinho.`, 'success');
  closeEcoPointsModal();
  updateAuthUI();
  renderCartDrawer();
}

// Modal de Assinatura Mensal (EcoRefil Mensal)
function openSubscriptionModal(planName, price, desc) {
  const modal = document.getElementById('subscription-modal');
  if (!modal) return;

  const planTitle = document.getElementById('sub-modal-plan-title');
  const planPrice = document.getElementById('sub-modal-plan-price');
  const planDesc = document.getElementById('sub-modal-plan-desc');

  if (planTitle) planTitle.textContent = `Plano EcoRefil ${planName}`;
  if (planPrice) planPrice.textContent = `R$ ${price}/mês`;
  if (planDesc) planDesc.textContent = desc;

  // Preencher dados do usuário caso logado
  const user = getCurrentUser();
  if (user) {
    const nameInp = document.getElementById('sub-name');
    const phoneInp = document.getElementById('sub-phone');
    const emailInp = document.getElementById('sub-email');
    const addrInp = document.getElementById('sub-address');

    if (nameInp) nameInp.value = user.name;
    if (phoneInp) phoneInp.value = user.phone || '';
    if (emailInp) emailInp.value = user.email;
    if (addrInp) addrInp.value = `${user.address || ''}, ${user.number || ''} - ${user.neighborhood || 'Vila Rezende'}`;
  }

  modal.dataset.currentPlan = planName;
  modal.dataset.currentPrice = price;
  modal.dataset.currentDesc = desc;

  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

function closeSubscriptionModal() {
  const modal = document.getElementById('subscription-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
}

// Salvar adesão de assinatura
function submitSubscription(event) {
  event.preventDefault();
  const modal = document.getElementById('subscription-modal');
  const planName = modal.dataset.currentPlan || 'Básico';
  const price = modal.dataset.currentPrice || '39,90';
  const desc = modal.dataset.currentDesc || '';

  const name = document.getElementById('sub-name').value.trim();
  const phone = document.getElementById('sub-phone').value.trim();
  const email = document.getElementById('sub-email').value.trim();
  const address = document.getElementById('sub-address').value.trim();
  const deliveryDay = document.getElementById('sub-day').value;

  if (!name || !phone || !email || !address) {
    showToast('Preencha todos os campos do formulário de assinatura.', 'warning');
    return;
  }

  const subData = {
    planName,
    price,
    description: desc,
    customerName: name,
    phone,
    email,
    address,
    deliveryDay,
    status: 'Ativa',
    startDate: new Date().toLocaleDateString('pt-BR')
  };

  saveSubscription(subData);
  closeSubscriptionModal();
}

// Formulário de Contato
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const msg = document.getElementById('contact-message').value.trim();

    if (!name || !email || !msg) {
      showToast('Por favor, preencha seu nome, e-mail e a mensagem.', 'warning');
      return;
    }

    form.reset();
    showToast('Mensagem enviada com sucesso! A equipe do EcoRefil responderá o mais breve possível. 🌱', 'success');
  });
}

// Gráficos do Planejamento Financeiro (Canvas + SVG)
function initFinancialCharts() {
  const canvas = document.getElementById('financeDonutChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Dados: 46,7% Gasto Inicial (R$ 18.674,76) vs 53,3% Capital de Giro (R$ 21.325,24)
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 300;
  const height = canvas.clientHeight || 300;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 20;
  const innerRadius = radius * 0.62;

  const initialAngle = -Math.PI / 2;
  const slice1Angle = (46.7 / 100) * 2 * Math.PI;

  // Fatia 1: Gasto Inicial (#B88B37 - Dourado sustentável)
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, initialAngle, initialAngle + slice1Angle);
  ctx.arc(centerX, centerY, innerRadius, initialAngle + slice1Angle, initialAngle, true);
  ctx.closePath();
  ctx.fillStyle = '#B88B37';
  ctx.fill();

  // Fatia 2: Capital de Giro (#1F5B3A - Verde Floresta EcoRefil)
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, initialAngle + slice1Angle, initialAngle + 2 * Math.PI);
  ctx.arc(centerX, centerY, innerRadius, initialAngle + 2 * Math.PI, initialAngle + slice1Angle, true);
  ctx.closePath();
  ctx.fillStyle = '#1F5B3A';
  ctx.fill();

  // Texto central
  ctx.fillStyle = '#2B362F';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('R$ 40.000', centerX, centerY - 10);

  ctx.font = '11px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('Orçamento Total', centerX, centerY + 12);
}

// Botão Voltar ao Topo
function initBackToTop() {
  const btn = document.getElementById('back-to-top-btn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
