/**
 * ECOREFIL - MERCADO DE PRODUTOS A GRANEL
 * Módulo de Painel Administrativo (admin.js)
 * Gerenciamento de Produtos, Pedidos, Métricas e Demonstração
 */

let editingProductId = null;

// Abrir painel administrativo
function openAdminModal() {
  const modal = document.getElementById('admin-modal');
  if (!modal) return;

  renderAdminMetrics();
  renderAdminProductsTable();
  renderAdminOrdersTable();

  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

// Fechar painel administrativo
function closeAdminModal() {
  const modal = document.getElementById('admin-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
}

// Renderizar métricas do painel
function renderAdminMetrics() {
  const products = getStoredProducts();
  const orders = getStoredOrders();
  const users = getRegisteredUsers();

  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalLiters = orders.reduce((sum, o) => {
    return sum + (o.items ? o.items.reduce((s, it) => s + (it.quantity || 0), 0) : 0);
  }, 0);

  // Se ainda não houver pedidos na simulação, colocar um valor de base para apresentação escolar
  const displaySales = totalSales > 0 ? totalSales : 1842.50;
  const displayLiters = totalLiters > 0 ? totalLiters : 315;
  const displayOrdersCount = orders.length > 0 ? orders.length : 18;

  const countProdEl = document.getElementById('admin-metric-products');
  const countOrdersEl = document.getElementById('admin-metric-orders');
  const countUsersEl = document.getElementById('admin-metric-users');
  const countSalesEl = document.getElementById('admin-metric-sales');
  const countLitersEl = document.getElementById('admin-metric-liters');

  if (countProdEl) countProdEl.textContent = products.length;
  if (countOrdersEl) countOrdersEl.textContent = displayOrdersCount;
  if (countUsersEl) countUsersEl.textContent = users.length;
  if (countSalesEl) countSalesEl.textContent = `R$ ${displaySales.toFixed(2).replace('.', ',')}`;
  if (countLitersEl) countLitersEl.textContent = `${displayLiters} L`;
}

// Renderizar tabela de produtos no Admin
function renderAdminProductsTable() {
  const tableBody = document.getElementById('admin-products-tbody');
  if (!tableBody) return;

  const products = getStoredProducts();

  tableBody.innerHTML = products.map(prod => `
    <tr>
      <td>
        <img src="${prod.image}" alt="${prod.name}" class="admin-prod-thumb" onerror="this.src='img/amaciante.svg'">
      </td>
      <td>
        <strong>${prod.name}</strong>
        <div class="admin-small-text">${prod.shortDesc || ''}</div>
      </td>
      <td>
        <span class="badge ${prod.category === 'limpeza' ? 'badge-primary' : 'badge-gold'}">
          ${prod.category === 'limpeza' ? 'Limpeza' : 'Higiene'}
        </span>
      </td>
      <td>
        <strong>R$ ${prod.pricePerLiter.toFixed(2).replace('.', ',')}</strong> / L
      </td>
      <td>
        ${prod.isBestseller ? '<span class="badge badge-bestseller">⭐ Sim</span>' : '<span class="badge badge-light">Não</span>'}
      </td>
      <td>
        <div class="admin-actions-cell">
          <button type="button" class="btn btn-outline btn-xs" onclick="openProductEditForm(${prod.id})" title="Editar Produto">
            ✏️ Editar
          </button>
          <button type="button" class="btn btn-danger-outline btn-xs" onclick="deleteProductFromAdmin(${prod.id})" title="Excluir Produto">
            🗑️ Excluir
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Abrir formulário para adicionar novo produto
function openNewProductForm() {
  editingProductId = null;
  const modal = document.getElementById('admin-product-edit-modal');
  const form = document.getElementById('admin-product-form');
  const title = document.getElementById('admin-prod-form-title');

  if (form) form.reset();
  if (title) title.textContent = 'Adicionar Novo Produto a Granel';

  const preview = document.getElementById('admin-form-img-preview');
  if (preview) preview.src = 'img/detergente.jpg';

  if (modal) {
    modal.classList.add('active');
  }
}

// Abrir formulário para editar produto existente
function openProductEditForm(productId) {
  const products = getStoredProducts();
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  editingProductId = productId;
  const modal = document.getElementById('admin-product-edit-modal');
  const title = document.getElementById('admin-prod-form-title');
  if (title) title.textContent = `Editar Produto: ${prod.name}`;

  document.getElementById('admin-prod-name').value = prod.name;
  document.getElementById('admin-prod-category').value = prod.category;
  document.getElementById('admin-prod-price').value = prod.pricePerLiter;
  document.getElementById('admin-prod-image').value = prod.image;
  document.getElementById('admin-prod-shortdesc').value = prod.shortDesc || '';
  document.getElementById('admin-prod-fulldesc').value = prod.fullDesc || '';
  document.getElementById('admin-prod-ecobenefit').value = prod.ecoBenefit || '';
  document.getElementById('admin-prod-bestseller').checked = !!prod.isBestseller;

  const preview = document.getElementById('admin-form-img-preview');
  if (preview) preview.src = prod.image;

  if (modal) {
    modal.classList.add('active');
  }
}

// Fechar formulário de edição/criação
function closeProductEditForm() {
  const modal = document.getElementById('admin-product-edit-modal');
  if (modal) modal.classList.remove('active');
  editingProductId = null;
}

// Salvar produto do formulário (Criar ou Atualizar)
function saveAdminProduct(event) {
  event.preventDefault();
  const name = document.getElementById('admin-prod-name').value.trim();
  const category = document.getElementById('admin-prod-category').value;
  const price = parseFloat(document.getElementById('admin-prod-price').value);
  const image = document.getElementById('admin-prod-image').value.trim() || 'img/detergente.jpg';
  const shortDesc = document.getElementById('admin-prod-shortdesc').value.trim();
  const fullDesc = document.getElementById('admin-prod-fulldesc').value.trim();
  const ecoBenefit = document.getElementById('admin-prod-ecobenefit').value.trim();
  const isBestseller = document.getElementById('admin-prod-bestseller').checked;

  if (!name || isNaN(price) || price <= 0) {
    showToast('Preencha o nome e um preço válido por litro.', 'error');
    return;
  }

  let products = getStoredProducts();

  if (editingProductId) {
    // Editar
    const index = products.findIndex(p => p.id === editingProductId);
    if (index > -1) {
      products[index] = {
        ...products[index],
        name,
        category,
        pricePerLiter: price,
        image,
        shortDesc,
        fullDesc,
        ecoBenefit,
        isBestseller
      };
      saveStoredProducts(products);
      showToast(`Produto "${name}" atualizado com sucesso!`, 'success');
    }
  } else {
    // Criar novo
    const newId = Date.now();
    const newProd = {
      id: newId,
      name,
      category,
      pricePerLiter: price,
      image,
      shortDesc,
      fullDesc,
      ecoBenefit: ecoBenefit || 'Redução direta de resíduos plásticos.',
      ecoPoints: 10,
      unit: 'litro',
      stock: 100,
      isBestseller
    };
    products.push(newProd);
    saveStoredProducts(products);
    showToast(`Produto "${name}" adicionado ao catálogo!`, 'success');
  }

  closeProductEditForm();
  renderAdminProductsTable();
  renderAdminMetrics();

  // Re-renderizar catálogo principal da loja
  if (typeof renderProductsGrid === 'function') {
    renderProductsGrid(getStoredProducts(), 'todos');
  }
}

// Excluir produto
function deleteProductFromAdmin(productId) {
  let products = getStoredProducts();
  const prod = products.find(p => p.id === productId);
  const name = prod ? prod.name : 'Produto';

  if (!confirm(`Deseja realmente excluir o produto "${name}" do catálogo do EcoRefil?`)) {
    return;
  }

  products = products.filter(p => p.id !== productId);
  saveStoredProducts(products);

  // Também remover do carrinho se estiver presente
  if (typeof removeFromCart === 'function') {
    removeFromCart(productId);
  }

  showToast(`Produto "${name}" excluído.`, 'info');
  renderAdminProductsTable();
  renderAdminMetrics();

  if (typeof renderProductsGrid === 'function') {
    renderProductsGrid(getStoredProducts(), 'todos');
  }
}

// Renderizar tabela de pedidos no Admin
function renderAdminOrdersTable() {
  const tbody = document.getElementById('admin-orders-tbody');
  if (!tbody) return;

  const orders = getStoredOrders();

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4">Nenhum pedido registrado ainda. Finalize um pedido no site para vê-lo aqui!</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><strong>${o.orderNumber}</strong></td>
      <td>
        <strong>${o.customerName || 'Cliente'}</strong>
        <div class="admin-small-text">${o.phone || ''}</div>
      </td>
      <td>
        <div class="admin-small-text">
          ${o.items ? o.items.map(it => `${it.quantity}L ${it.name}`).join(', ') : 'Itens'}
        </div>
      </td>
      <td>
        <strong>R$ ${(o.total || 0).toFixed(2).replace('.', ',')}</strong>
      </td>
      <td>
        <span class="badge ${o.deliveryMode === 'bike' ? 'badge-primary' : 'badge-gold'}">
          ${o.deliveryMode === 'bike' ? '🚲 Bike Elétrica' : '🏪 Retirada'}
        </span>
      </td>
      <td>
        <span class="badge badge-light">${o.paymentMethod || 'Pix'}</span>
      </td>
      <td>
        <select class="admin-status-select" onchange="updateOrderStatus('${o.orderNumber}', this.value)">
          <option value="pendente" ${o.status === 'pendente' ? 'selected' : ''}>Pendente</option>
          <option value="separacao" ${o.status === 'separacao' ? 'selected' : ''}>Em separação</option>
          <option value="enviado" ${o.status === 'enviado' ? 'selected' : ''}>Em rota de Bike</option>
          <option value="concluido" ${o.status === 'concluido' ? 'selected' : ''}>Concluído</option>
        </select>
      </td>
    </tr>
  `).join('');
}

// Atualizar status do pedido
function updateOrderStatus(orderNumber, newStatus) {
  const orders = getStoredOrders();
  const order = orders.find(o => o.orderNumber === orderNumber);
  if (order) {
    order.status = newStatus;
    const labels = {
      pendente: 'Recebido',
      separacao: 'Em separação',
      enviado: 'Em rota de Bike',
      concluido: 'Entregue'
    };
    order.statusText = labels[newStatus] || newStatus;
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    showToast(`Status do pedido ${orderNumber} alterado para: ${order.statusText}.`, 'info');
  }
}

// Restaurar dados de demonstração
function restoreAdminDemoData() {
  if (!confirm('Deseja restaurar os produtos originais e dados de demonstração do EcoRefil?')) {
    return;
  }

  resetProductsToDefault();
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));

  // Criar 3 pedidos de demonstração para a apresentação escolar
  const demoOrders = [
    {
      orderNumber: '#ECO-2026-1042',
      customerName: 'Camila Ferreira',
      userId: 'usr_demo_1',
      phone: '(19) 99876-5432',
      date: 'Hoje, 14:30',
      items: [
        { name: 'Detergente Ecológico', quantity: 2, pricePerLiter: 3.98 },
        { name: 'Desinfetante Natural Eucalipto', quantity: 1, pricePerLiter: 2.74 }
      ],
      deliveryMode: 'bike',
      deliveryFee: 3.00,
      paymentMethod: 'Pix',
      address: 'Rua São José, 420 - Vila Rezende',
      reusingPackaging: true,
      earnedPoints: 20,
      total: 13.70,
      status: 'enviado',
      statusText: 'Em rota de Bike'
    },
    {
      orderNumber: '#ECO-2026-1039',
      customerName: 'Lucas Prado',
      userId: 'usr_demo_2',
      phone: '(19) 98123-4567',
      date: 'Ontem',
      items: [
        { name: 'Sabão Líquido Concentrado', quantity: 3, pricePerLiter: 8.41 },
        { name: 'Amaciante Toque de Algodão', quantity: 2, pricePerLiter: 3.99 }
      ],
      deliveryMode: 'bike',
      deliveryFee: 5.00,
      paymentMethod: 'Cartão',
      address: 'Av. Torquato da Silva Leitão - São Dimas',
      reusingPackaging: true,
      earnedPoints: 20,
      total: 38.21,
      status: 'concluido',
      statusText: 'Entregue'
    }
  ];

  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(demoOrders));

  showToast('Dados restaurados com sucesso para apresentação escolar!', 'success');
  renderAdminMetrics();
  renderAdminProductsTable();
  renderAdminOrdersTable();

  if (typeof renderProductsGrid === 'function') {
    renderProductsGrid(getStoredProducts(), 'todos');
  }
}
