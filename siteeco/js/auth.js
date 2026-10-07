/**
 * ECOREFIL - MERCADO DE PRODUTOS A GRANEL
 * Módulo de Autenticação, Usuários e EcoPontos (auth.js)
 * 
 * AVISO IMPORTANTE:
 * Este módulo realiza uma SIMULAÇÃO FRONTEND em localStorage para fins acadêmicos
 * e demonstração de protótipo de empresa sustentável. NÃO constitui autenticação
 * de segurança real em backend.
 */

const USERS_STORAGE_KEY = 'ecorefil_users';
const CURRENT_USER_STORAGE_KEY = 'ecorefil_current_user';
const ORDERS_STORAGE_KEY = 'ecorefil_orders';
const SUBSCRIPTION_STORAGE_KEY = 'ecorefil_subscription';

// Usuários iniciais de exemplo para facilitar avaliação do projeto
const DEFAULT_USERS = [
  {
    id: 'usr_demo_1',
    name: 'Camila Ferreira',
    email: 'cliente@ecorefil.com.br',
    password: '123',
    phone: '(19) 99876-5432',
    address: 'Rua São José',
    number: '420',
    neighborhood: 'Vila Rezende',
    city: 'Piracicaba',
    state: 'SP',
    cep: '13405-240',
    ecoPoints: 65,
    role: 'customer',
    createdAt: '2026-09-15'
  },
  {
    id: 'usr_admin',
    name: 'Administrador EcoRefil',
    email: 'admin@ecorefil.com.br',
    password: 'admin',
    phone: '(19) 99866-8149',
    address: 'Rua Maria Manieiro',
    number: '100',
    neighborhood: 'Vila Rezende',
    city: 'Piracicaba',
    state: 'SP',
    cep: '13405-000',
    ecoPoints: 350,
    role: 'admin',
    createdAt: '2026-08-01'
  }
];

// Obter usuários cadastrados
function getRegisteredUsers() {
  const data = localStorage.getItem(USERS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    return [...DEFAULT_USERS];
  }
  try {
    const list = JSON.parse(data);
    return Array.isArray(list) ? list : [...DEFAULT_USERS];
  } catch (e) {
    console.error('Erro ao ler usuários:', e);
    return [...DEFAULT_USERS];
  }
}

// Salvar usuários
function saveRegisteredUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Obter usuário atualmente logado
function getCurrentUser() {
  const data = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

// Salvar sessão do usuário atual
function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  }
  updateAuthUI();
}

// Cadastrar novo usuário
function registerUser(formData) {
  const { name, email, password, phone, address, number, neighborhood, cep } = formData;
  const users = getRegisteredUsers();

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    showToast('Este e-mail já está cadastrado no EcoRefil.', 'warning');
    return { success: false, message: 'E-mail já existente' };
  }

  const newUser = {
    id: 'usr_' + Date.now(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: password,
    phone: phone || '(19) 99999-9999',
    address: address || '',
    number: number || '',
    neighborhood: neighborhood || 'Vila Rezende',
    city: 'Piracicaba',
    state: 'SP',
    cep: cep || '13405-000',
    ecoPoints: 20, // Bônus de boas-vindas sustentável
    role: 'customer',
    createdAt: new Date().toISOString().split('T')[0]
  };

  users.push(newUser);
  saveRegisteredUsers(users);
  setCurrentUser(newUser);

  showToast(`Cadastro realizado com sucesso! Bem-vindo(a), ${newUser.name}! Você ganhou +20 EcoPontos de boas-vindas! 🌱`, 'success');
  return { success: true, user: newUser };
}

// Realizar Login
function loginUser(email, password) {
  const users = getRegisteredUsers();
  const user = users.find(u => 
    u.email.toLowerCase() === email.toLowerCase().trim() && 
    u.password === password
  );

  if (!user) {
    showToast('E-mail ou senha incorretos.', 'error');
    return { success: false, message: 'Credenciais inválidas' };
  }

  setCurrentUser(user);
  showToast(`Olá, ${user.name}! Bem-vindo(a) de volta ao EcoRefil!`, 'success');
  return { success: true, user };
}

// Realizar Logout
function logoutUser() {
  const current = getCurrentUser();
  const name = current ? current.name : '';
  setCurrentUser(null);
  showToast(`Até breve, ${name}! Volte sempre para refilar.`, 'info');
  closeAuthModal();
  updateAuthUI();
}

// Adicionar ou debitar EcoPontos do usuário
function updateUserEcoPoints(userId, delta) {
  const users = getRegisteredUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) return 0;

  users[userIndex].ecoPoints = Math.max(0, (users[userIndex].ecoPoints || 0) + delta);
  saveRegisteredUsers(users);

  // Se for o usuário ativo
  const current = getCurrentUser();
  if (current && current.id === userId) {
    current.ecoPoints = users[userIndex].ecoPoints;
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(current));
    updateAuthUI();
  }

  return users[userIndex].ecoPoints;
}

// Obter pedidos salvos
function getStoredOrders(userId = null) {
  const data = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!data) return [];
  try {
    const list = JSON.parse(data);
    if (!Array.isArray(list)) return [];
    if (userId) {
      return list.filter(order => order.userId === userId || (!order.userId && userId === 'guest'));
    }
    return list;
  } catch (e) {
    return [];
  }
}

// Salvar novo pedido
function saveNewOrder(orderData) {
  const orders = getStoredOrders();
  orders.unshift(orderData);
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

  // Adicionar EcoPontos
  const currentUser = getCurrentUser();
  if (currentUser) {
    const pointsEarned = orderData.earnedPoints || 10;
    updateUserEcoPoints(currentUser.id, pointsEarned);
  }

  return orderData;
}

// Obter assinaturas do usuário
function getUserSubscription() {
  const data = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

// Salvar assinatura
function saveSubscription(subscriptionData) {
  localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscriptionData));
  showToast('Assinatura EcoRefil cadastrada com sucesso! Parabéns pela escolha sustentável! 🌱', 'success');
  updateAuthUI();
}

// Cancelar assinatura
function cancelSubscription() {
  localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
  showToast('Assinatura cancelada com sucesso.', 'info');
  updateAuthUI();
}

// Atualizar elementos da UI que dependem de autenticação
function updateAuthUI() {
  const user = getCurrentUser();
  const authTrigger = document.getElementById('auth-trigger-btn');
  const userNavName = document.getElementById('user-nav-name');
  const pointsCounterHeader = document.getElementById('user-points-badge');

  if (authTrigger) {
    if (user) {
      if (userNavName) userNavName.textContent = user.name.split(' ')[0];
      authTrigger.title = `Perfil de ${user.name} (${user.ecoPoints} EcoPontos)`;
      authTrigger.classList.add('logged-in');
      if (pointsCounterHeader) {
        pointsCounterHeader.textContent = `${user.ecoPoints} pts`;
        pointsCounterHeader.classList.remove('hidden');
      }
    } else {
      if (userNavName) userNavName.textContent = 'Entrar';
      authTrigger.title = 'Entrar ou Cadastrar';
      authTrigger.classList.remove('logged-in');
      if (pointsCounterHeader) {
        pointsCounterHeader.classList.add('hidden');
      }
    }
  }

  // Atualizar pontos na seção de EcoPontos na home
  const homeEcoPointsEl = document.getElementById('home-user-ecopoints');
  if (homeEcoPointsEl) {
    homeEcoPointsEl.textContent = user ? user.ecoPoints : 0;
  }

  // Atualizar barra de progresso de EcoPontos
  const progressBar = document.getElementById('ecopoints-progress-bar');
  const nextBenefitText = document.getElementById('ecopoints-next-goal');
  if (progressBar) {
    const pts = user ? user.ecoPoints : 0;
    let target = 50;
    let desc = '5% de desconto (meta: 50 pts)';
    if (pts >= 100) {
      target = 200;
      desc = 'Frete Grátis na Vila Rezende (meta: 200 pts)';
    } else if (pts >= 50) {
      target = 100;
      desc = '10% de desconto (meta: 100 pts)';
    }
    const percent = Math.min(100, Math.round((pts / target) * 100));
    progressBar.style.width = `${percent}%`;
    if (nextBenefitText) {
      nextBenefitText.textContent = `${pts}/${target} pts - Próximo: ${desc}`;
    }
  }
}

// Abrir Modal de Autenticação / Perfil
function openAuthModal(initialTab = 'login') {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;

  const user = getCurrentUser();
  if (user) {
    renderUserProfileTab();
    switchAuthTab('profile');
  } else {
    switchAuthTab(initialTab);
  }

  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
}

function switchAuthTab(tabName) {
  const loginView = document.getElementById('auth-view-login');
  const registerView = document.getElementById('auth-view-register');
  const profileView = document.getElementById('auth-view-profile');
  const tabs = document.querySelectorAll('.auth-tab-btn');

  tabs.forEach(t => t.classList.remove('active'));

  const activeTabBtn = document.querySelector(`.auth-tab-btn[data-tab="${tabName}"]`);
  if (activeTabBtn) activeTabBtn.classList.add('active');

  if (loginView) loginView.classList.toggle('hidden', tabName !== 'login');
  if (registerView) registerView.classList.toggle('hidden', tabName !== 'register');
  if (profileView) profileView.classList.toggle('hidden', tabName !== 'profile');

  if (tabName === 'profile') {
    renderUserProfileTab();
  }
}

// Renderizar painel do usuário logado
function renderUserProfileTab() {
  const profileContainer = document.getElementById('auth-profile-content');
  if (!profileContainer) return;

  const user = getCurrentUser();
  if (!user) {
    switchAuthTab('login');
    return;
  }

  const userOrders = getStoredOrders(user.id);
  const subscription = getUserSubscription();

  profileContainer.innerHTML = `
    <div class="user-profile-header">
      <div class="user-avatar-circle">
        ${user.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <h3 class="user-welcome-name">Olá, ${user.name}!</h3>
        <p class="user-email-tag">${user.email} • Membro desde ${user.createdAt || '2026'}</p>
      </div>
      <button type="button" class="btn btn-outline btn-sm logout-btn" onclick="logoutUser()">
        Sair da conta
      </button>
    </div>

    <!-- EcoPontos Card -->
    <div class="profile-ecopoints-card">
      <div class="points-header">
        <div>
          <span class="points-label">Seus EcoPontos Disponíveis:</span>
          <div class="points-huge">${user.ecoPoints} <span class="pts-text">pontos</span></div>
        </div>
        <button type="button" class="btn btn-sm btn-gold" onclick="openEcoPointsModal()">
          Ver Benefícios
        </button>
      </div>
      <div class="points-explanation">
        🌱 <strong>Como você pontuou:</strong> Cada compra finalizada (+10 pts) e cada embalagem própria reutilizada (+5 pts por item).
      </div>
    </div>

    <!-- Abas internas do Perfil -->
    <div class="profile-tabs-nav">
      <button class="subtab-btn active" onclick="switchProfileSubtab('orders', this)">📦 Meus Pedidos (${userOrders.length})</button>
      <button class="subtab-btn" onclick="switchProfileSubtab('subscription', this)">🔄 Minha Assinatura</button>
      <button class="subtab-btn" onclick="switchProfileSubtab('details', this)">👤 Meus Dados</button>
    </div>

    <!-- Conteúdo da sub-aba Pedidos -->
    <div id="subtab-orders" class="subtab-content">
      ${userOrders.length === 0 ? `
        <div class="empty-orders-box">
          <p>Você ainda não realizou nenhum pedido no EcoRefil.</p>
          <button type="button" class="btn btn-primary btn-sm" onclick="closeAuthModal(); scrollToSection('produtos')">
            Explorar Produtos a Granel
          </button>
        </div>
      ` : `
        <div class="orders-list-scroll">
          ${userOrders.map(order => `
            <div class="user-order-item">
              <div class="order-item-top">
                <span class="order-id-badge">${order.orderNumber}</span>
                <span class="order-date">${order.date || 'Hoje'}</span>
                <span class="order-status-badge status-${order.status || 'pendente'}">${order.statusText || 'Recebido'}</span>
              </div>
              <div class="order-products-summary">
                ${order.items.map(it => `<span>${it.quantity}L de ${it.name}</span>`).join(' • ')}
              </div>
              <div class="order-item-bottom">
                <span class="order-delivery-mode">${order.deliveryMode === 'bike' ? '🚲 Bike Elétrica' : '🏪 Retirada na Loja'}</span>
                <strong class="order-total-price">R$ ${order.total.toFixed(2).replace('.', ',')}</strong>
              </div>
              <button type="button" class="btn btn-outline btn-xs" onclick="resendOrderToWhatsApp('${order.orderNumber}')">
                📱 Enviar no WhatsApp
              </button>
            </div>
          `).join('')}
        </div>
      `}
    </div>

    <!-- Conteúdo da sub-aba Assinatura -->
    <div id="subtab-subscription" class="subtab-content hidden">
      ${subscription ? `
        <div class="active-subscription-card">
          <div class="sub-header">
            <div>
              <span class="badge badge-active">Assinatura Ativa</span>
              <h4>Plano EcoRefil ${subscription.planName}</h4>
            </div>
            <strong class="sub-price">R$ ${subscription.price}/mês</strong>
          </div>
          <p class="sub-desc">${subscription.description || 'Entrega mensal programada por bicicleta elétrica na Vila Rezende.'}</p>
          <div class="sub-details-grid">
            <div><strong>Próximo refil:</strong> Todo dia ${subscription.deliveryDay || '10'}</div>
            <div><strong>Endereço de entrega:</strong> ${subscription.address || user.address || 'Rua Maria Manieiro'}</div>
          </div>
          <button type="button" class="btn btn-danger-outline btn-sm" onclick="cancelSubscription()">
            Cancelar Assinatura
          </button>
        </div>
      ` : `
        <div class="empty-sub-box">
          <p>Você ainda não assinou nenhum dos nossos planos mensais com desconto e refil recorrente.</p>
          <button type="button" class="btn btn-gold btn-sm" onclick="closeAuthModal(); scrollToSection('assinatura')">
            Conhecer os Planos EcoRefil Mensal
          </button>
        </div>
      `}
    </div>

    <!-- Conteúdo da sub-aba Dados -->
    <div id="subtab-details" class="subtab-content hidden">
      <div class="user-details-form">
        <div class="detail-row"><strong>Nome:</strong> <span>${user.name}</span></div>
        <div class="detail-row"><strong>E-mail:</strong> <span>${user.email}</span></div>
        <div class="detail-row"><strong>Telefone:</strong> <span>${user.phone || 'Não informado'}</span></div>
        <div class="detail-row"><strong>Bairro:</strong> <span>${user.neighborhood || 'Vila Rezende'}</span></div>
        <div class="detail-row"><strong>Cidade:</strong> <span>${user.city || 'Piracicaba'} - SP</span></div>
        <p class="proto-disclaimer">ℹ️ Dados salvos no navegador (localStorage) para fins de prototipação escolar.</p>
      </div>
    </div>
  `;
}

function switchProfileSubtab(tabName, btnElem) {
  const contents = document.querySelectorAll('.subtab-content');
  contents.forEach(c => c.classList.add('hidden'));

  const navBtns = document.querySelectorAll('.subtab-btn');
  navBtns.forEach(b => b.classList.remove('active'));

  const activeContent = document.getElementById(`subtab-${tabName}`);
  if (activeContent) activeContent.classList.remove('hidden');
  if (btnElem) btnElem.classList.add('active');
}
