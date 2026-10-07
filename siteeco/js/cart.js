/**
 * ECOREFIL - MERCADO DE PRODUTOS A GRANEL
 * Módulo de Carrinho de Compras (cart.js)
 * Totalmente funcional com persistência em localStorage
 */

const CART_STORAGE_KEY = 'ecorefil_cart';
const REUSE_PACKAGING_STORAGE_KEY = 'ecorefil_reuse_packaging';

// Obter itens do carrinho
function getCart() {
  const data = localStorage.getItem(CART_STORAGE_KEY);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Erro ao ler carrinho:', e);
    return [];
  }
}

// Salvar itens do carrinho
function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
}

// Obter flag de reutilização de embalagens
function isReusingPackaging() {
  return localStorage.getItem(REUSE_PACKAGING_STORAGE_KEY) === 'true';
}

function setReusingPackaging(value) {
  localStorage.setItem(REUSE_PACKAGING_STORAGE_KEY, value ? 'true' : 'false');
  renderCartDrawer();
}

// Adicionar produto ao carrinho
function addToCart(productId, quantity = 1, showToastNotification = true) {
  const products = getStoredProducts();
  const product = products.find(p => p.id === productId);
  if (!product) {
    showToast('Produto não encontrado.', 'error');
    return;
  }

  const qty = parseFloat(quantity) || 1;
  if (qty <= 0) {
    showToast('Quantidade inválida.', 'error');
    return;
  }

  const cart = getCart();
  const existingItemIndex = cart.findIndex(item => item.id === productId);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity = parseFloat((cart[existingItemIndex].quantity + qty).toFixed(1));
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      pricePerLiter: product.pricePerLiter,
      image: product.image,
      category: product.category,
      unit: product.unit || 'litro',
      quantity: qty
    });
  }

  saveCart(cart);

  if (showToastNotification) {
    showToast(`"${product.name}" (${qty}L) adicionado ao carrinho!`, 'success');
  }

  // Animar botão do carrinho no header
  const cartTrigger = document.getElementById('cart-trigger-btn');
  if (cartTrigger) {
    cartTrigger.classList.add('bounce');
    setTimeout(() => cartTrigger.classList.remove('bounce'), 600);
  }
}

// Atualizar quantidade de um item
function updateCartItemQty(productId, newQty) {
  let cart = getCart();
  const itemIndex = cart.findIndex(item => item.id === productId);
  if (itemIndex === -1) return;

  const qty = parseFloat(newQty);
  if (qty <= 0) {
    removeFromCart(productId);
    return;
  }

  cart[itemIndex].quantity = parseFloat(qty.toFixed(1));
  saveCart(cart);
  showToast('Quantidade atualizada no carrinho.', 'info');
}

// Remover item do carrinho
function removeFromCart(productId) {
  let cart = getCart();
  const item = cart.find(i => i.id === productId);
  const itemName = item ? item.name : 'Produto';

  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  showToast(`"${itemName}" removido do carrinho.`, 'info');
}

// Limpar todo o carrinho
function clearCart() {
  saveCart([]);
  showToast('Carrinho limpo.', 'info');
}

// Calcular totais
function getCartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.pricePerLiter * item.quantity), 0);
  const totalLiters = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalItemsCount = cart.length;

  // Cálculo de desconto por EcoPontos
  let discount = 0;
  let activeCoupon = null;
  const couponData = localStorage.getItem('ecorefil_active_coupon');
  if (couponData) {
    try {
      activeCoupon = JSON.parse(couponData);
      if (activeCoupon.type === 'percent') {
        discount = subtotal * (activeCoupon.value / 100);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Pontos ganhos previstos: +10 pontos pela compra, +5 por produto caso traga embalagem
  const reuseActive = isReusingPackaging();
  const estimatedPoints = cart.length > 0 ? (10 + (reuseActive ? cart.length * 5 : 0)) : 0;

  return {
    subtotal,
    discount,
    activeCoupon,
    totalLiters,
    totalItemsCount,
    estimatedPoints,
    reuseActive,
    total: Math.max(0, subtotal - discount)
  };
}

// Atualizar Badge de Itens no Header
function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + (item.quantity > 0 ? 1 : 0), 0);
  const badges = document.querySelectorAll('.cart-count-badge');
  badges.forEach(badge => {
    badge.textContent = count;
    if (count > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  });
}

// Renderizar Drawer Lateral do Carrinho
function renderCartDrawer() {
  const cartList = document.getElementById('cart-items-container');
  const emptyState = document.getElementById('cart-empty-message');
  const footer = document.getElementById('cart-footer-section');
  if (!cartList) return;

  const cart = getCart();
  const totals = getCartTotals();

  if (cart.length === 0) {
    cartList.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    if (footer) footer.classList.add('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  if (footer) footer.classList.remove('hidden');

  cartList.innerHTML = cart.map(item => {
    const itemTotal = (item.pricePerLiter * item.quantity).toFixed(2).replace('.', ',');
    const pricePerL = item.pricePerLiter.toFixed(2).replace('.', ',');

    return `
      <div class="cart-item-row" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
        <div class="cart-item-details">
          <div class="cart-item-header">
            <h4 class="cart-item-name">${item.name}</h4>
            <button type="button" class="cart-remove-btn" onclick="removeFromCart(${item.id})" title="Remover produto">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
          <div class="cart-item-price-unit">
            R$ ${pricePerL} / litro
          </div>
          <div class="cart-item-controls">
            <div class="cart-stepper">
              <button type="button" class="cart-step-btn" onclick="updateCartItemQty(${item.id}, ${item.quantity - 0.5})">−</button>
              <input type="number" class="cart-item-qty-input" value="${item.quantity}" min="0.5" max="50" step="0.5" onchange="updateCartItemQty(${item.id}, this.value)">
              <button type="button" class="cart-step-btn" onclick="updateCartItemQty(${item.id}, ${item.quantity + 0.5})">+</button>
            </div>
            <div class="cart-item-subtotal">
              <strong>R$ ${itemTotal}</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Atualizar valores do rodapé do carrinho
  const subtotalEl = document.getElementById('cart-subtotal-val');
  const discountRow = document.getElementById('cart-discount-row');
  const discountValEl = document.getElementById('cart-discount-val');
  const totalEl = document.getElementById('cart-total-val');
  const pointsBadge = document.getElementById('cart-earned-points-badge');
  const reuseCheckbox = document.getElementById('cart-reuse-packaging-check');

  if (subtotalEl) subtotalEl.textContent = `R$ ${totals.subtotal.toFixed(2).replace('.', ',')}`;
  
  if (discountRow && discountValEl) {
    if (totals.discount > 0) {
      discountRow.classList.remove('hidden');
      discountValEl.textContent = `- R$ ${totals.discount.toFixed(2).replace('.', ',')}`;
    } else {
      discountRow.classList.add('hidden');
    }
  }

  if (totalEl) totalEl.textContent = `R$ ${totals.total.toFixed(2).replace('.', ',')}`;
  
  if (pointsBadge) {
    pointsBadge.textContent = `+${totals.estimatedPoints} EcoPontos nesta compra!`;
  }

  if (reuseCheckbox) {
    reuseCheckbox.checked = totals.reuseActive;
  }
}

// Abrir e Fechar Gaveta do Carrinho
function toggleCart(forceOpen) {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  if (!drawer) return;

  const isOpen = drawer.classList.contains('active');
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !isOpen;

  if (shouldOpen) {
    renderCartDrawer();
    drawer.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.classList.add('drawer-open');
  } else {
    drawer.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.classList.remove('drawer-open');
  }
}
