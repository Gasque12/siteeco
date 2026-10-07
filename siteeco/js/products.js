/**
 * ECOREFIL - MERCADO DE PRODUTOS A GRANEL
 * Módulo de Gestão de Produtos (products.js)
 * Simulação via localStorage
 */

const PRODUCTS_STORAGE_KEY = 'ecorefil_products';

// Produtos Iniciais Oficiais
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Detergente Ecológico',
    category: 'limpeza',
    pricePerLiter: 3.98,
    isBestseller: true,
    image: 'img/detergente.jpg',
    shortDesc: 'Alto poder desengordurante com tensoativos biodegradáveis e aroma cítrico.',
    fullDesc: 'Fórmula concentrada à base de extratos vegetais e óleo de coco saponificado. Remove gorduras pesadas de louças e utensílios sem ressecar as mãos e sem poluir rios e mananciais. 100% biodegradável e livre de fosfatos.',
    ecoBenefit: 'Economiza em média 2 frascos plásticos por mês.',
    ecoPoints: 10,
    unit: 'litro',
    stock: 250
  },
  {
    id: 2,
    name: 'Desinfetante Natural Eucalipto',
    category: 'limpeza',
    pricePerLiter: 2.74,
    isBestseller: true,
    image: 'img/desinfetante.jpg',
    shortDesc: 'Ação bactericida e perfumação prolongada com óleo puro de eucalipto.',
    fullDesc: 'Desinfecção profunda para pisos, bancadas, ralos e azulejos. Elimina 99,9% dos germes e bactérias sem utilizar cloro nem componentes corrosivos. Aroma refrescante e duradouro.',
    ecoBenefit: 'Zero descarte de embalagens descartáveis.',
    ecoPoints: 10,
    unit: 'litro',
    stock: 320
  },
  {
    id: 3,
    name: 'Amaciante Toque de Algodão',
    category: 'limpeza',
    pricePerLiter: 3.99,
    isBestseller: false,
    image: 'img/amaciante.svg',
    shortDesc: 'Maciez prolongada, fibras alinhadas e perfume suave hipoalergênico.',
    fullDesc: 'Desenvolvido com agentes condicionantes botânicos que facilitam o passar de roupas e mantêm as fibras dos tecidos macias e perfumadas. Não mancha roupas brancas nem escuras.',
    ecoBenefit: 'Fórmula concentrada com menor pegada hídrica.',
    ecoPoints: 10,
    unit: 'litro',
    stock: 180
  },
  {
    id: 4,
    name: 'Sabão Líquido Concentrado',
    category: 'limpeza',
    pricePerLiter: 8.41,
    isBestseller: true,
    image: 'img/sabao-liquido.svg',
    shortDesc: 'Limpeza profunda para roupas brancas e coloridas, rende 3x mais.',
    fullDesc: 'Fórmula de alta performance enzimática para lavagem de roupas na máquina ou à mão. Dissolve manchas orgânicas difíceis sem agredir os tecidos nem desbotar cores vivas.',
    ecoBenefit: 'Substitui galões volumosos de plástico rígido.',
    ecoPoints: 10,
    unit: 'litro',
    stock: 220
  },
  {
    id: 5,
    name: 'Água Sanitária 2,5%',
    category: 'limpeza',
    pricePerLiter: 2.72,
    isBestseller: false,
    image: 'img/agua-sanitaria.svg',
    shortDesc: 'Alvejante e desinfetante potente com teor ativo rigorosamente certificado.',
    fullDesc: 'Solução estabilizada de hipoclorito de sódio indicada para desinfecção pesada de banheiros, calçadas, quintais e higienização geral de ambientes.',
    ecoBenefit: 'Refil em bombona de alta resistência reutilizável.',
    ecoPoints: 10,
    unit: 'litro',
    stock: 210
  },
  {
    id: 6,
    name: 'Sabonete Líquido Lavanda & Aloe',
    category: 'higiene',
    pricePerLiter: 5.40,
    isBestseller: true,
    image: 'img/sabonete.jpg',
    shortDesc: 'Hidratante e suave para mãos e corpo com extrato puro de aloe vera.',
    fullDesc: 'Elaborado com pH neutro fisiológico, glicerina vegetal e extrato puro de aloe vera. Limpa com delicadeza, produz espuma aveludada e hidrata a pele no uso diário.',
    ecoBenefit: 'Abasteça seus dispensers de pia com zero desperdício.',
    ecoPoints: 10,
    unit: 'litro',
    stock: 190
  },
  {
    id: 7,
    name: 'Shampoo Alecrim & Camomila',
    category: 'higiene',
    pricePerLiter: 9.60,
    isBestseller: false,
    image: 'img/shampoo.jpg',
    shortDesc: 'Livre de sulfatos agressivos e parabenos, revigora os fios naturalmente.',
    fullDesc: 'Nutrição botânica para todos os tipos de cabelo. O extrato de alecrim estimula o couro cabeludo enquanto a camomila proporciona brilho e maciez natural. Vegano e cruelty-free.',
    ecoBenefit: 'Banho sustentável sem frascos de uso único no lixo.',
    ecoPoints: 10,
    unit: 'litro',
    stock: 140
  }
];

// Obter produtos do localStorage ou inicializar
function getStoredProducts() {
  const data = localStorage.getItem(PRODUCTS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return [...INITIAL_PRODUCTS];
  }
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return [...INITIAL_PRODUCTS];
    }
    return parsed;
  } catch (e) {
    console.error('Erro ao ler produtos do localStorage:', e);
    return [...INITIAL_PRODUCTS];
  }
}

// Salvar lista de produtos
function saveStoredProducts(productsList) {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(productsList));
}

// Restaurar produtos padrão
function resetProductsToDefault() {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
  return [...INITIAL_PRODUCTS];
}

// Renderizar grade de produtos
function renderProductsGrid(products, activeCategory = 'todos', searchTerm = '') {
  const grid = document.getElementById('products-grid');
  const emptyState = document.getElementById('products-empty-state');
  if (!grid) return;

  let filtered = [...products];

  // Filtro de categoria
  if (activeCategory === 'limpeza') {
    filtered = filtered.filter(p => p.category === 'limpeza');
  } else if (activeCategory === 'higiene') {
    filtered = filtered.filter(p => p.category === 'higiene');
  } else if (activeCategory === 'mais-vendidos') {
    filtered = filtered.filter(p => p.isBestseller);
  }

  // Filtro de pesquisa
  if (searchTerm && searchTerm.trim() !== '') {
    const term = searchTerm.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.shortDesc.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  grid.innerHTML = filtered.map(product => {
    const priceFormatted = product.pricePerLiter.toFixed(2).replace('.', ',');
    const badgeCategory = product.category === 'limpeza' ? 'Limpeza' : 'Higiene';
    
    return `
      <article class="product-card" data-id="${product.id}">
        <div class="product-card-image-wrap">
          <img src="${product.image}" alt="${product.name}" class="product-card-image" loading="lazy">
          <div class="product-badges">
            <span class="badge badge-category">${badgeCategory}</span>
            ${product.isBestseller ? '<span class="badge badge-bestseller">⭐ Mais Vendido</span>' : ''}
          </div>
          <button type="button" class="quick-view-btn" onclick="openProductDetailModal(${product.id})" title="Ver detalhes completos do produto">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Espiar
          </button>
        </div>

        <div class="product-card-content">
          <div class="product-header">
            <h3 class="product-name" onclick="openProductDetailModal(${product.id})">${product.name}</h3>
            <p class="product-short-desc">${product.shortDesc}</p>
          </div>

          <div class="product-pricing">
            <div class="price-box">
              <span class="currency">R$</span>
              <span class="price-val">${priceFormatted}</span>
              <span class="price-unit">/ litro</span>
            </div>
            <div class="eco-benefit-pill" title="Impacto ambiental positivo">
              <span class="leaf-icon">🌱</span>
              <span class="eco-benefit-text">${product.ecoBenefit}</span>
            </div>
          </div>

          <!-- Seletor de Quantidade de Litros -->
          <div class="product-qty-selector">
            <span class="qty-label">Quantidade (Litros):</span>
            <div class="qty-stepper-wrap">
              <button type="button" class="qty-btn" onclick="stepProductCardQty(${product.id}, -1)" title="Diminuir 1L">−</button>
              <input type="number" id="card-qty-${product.id}" class="card-qty-input" value="1" min="0.5" max="50" step="0.5" onchange="updateCardSubtotal(${product.id}, ${product.pricePerLiter})">
              <button type="button" class="qty-btn" onclick="stepProductCardQty(${product.id}, 1)" title="Aumentar 1L">+</button>
            </div>
          </div>

          <!-- Subtotal em tempo real e Botão Comprar -->
          <div class="product-card-footer">
            <div class="card-subtotal-info">
              <span class="subtotal-label">Subtotal:</span>
              <span class="subtotal-val" id="card-subtotal-${product.id}">R$ ${priceFormatted}</span>
            </div>
            <button type="button" class="btn btn-primary btn-add-cart" onclick="addProductFromCard(${product.id})">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Adicionar
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Alterar quantidade no card de produto
function stepProductCardQty(productId, delta) {
  const input = document.getElementById(`card-qty-${productId}`);
  if (!input) return;
  let val = parseFloat(input.value) || 1;
  val = Math.max(0.5, val + delta);
  input.value = val;
  const products = getStoredProducts();
  const prod = products.find(p => p.id === productId);
  if (prod) {
    updateCardSubtotal(productId, prod.pricePerLiter);
  }
}

// Atualizar valor do subtotal no card
function updateCardSubtotal(productId, pricePerLiter) {
  const input = document.getElementById(`card-qty-${productId}`);
  const subtotalElem = document.getElementById(`card-subtotal-${productId}`);
  if (!input || !subtotalElem) return;
  let val = parseFloat(input.value) || 1;
  if (val < 0.5) val = 0.5;
  const total = val * pricePerLiter;
  subtotalElem.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Adicionar ao carrinho direto do card
function addProductFromCard(productId) {
  const input = document.getElementById(`card-qty-${productId}`);
  const qty = input ? parseFloat(input.value) || 1 : 1;
  if (typeof addToCart === 'function') {
    addToCart(productId, qty);
  }
}

// Modal de Detalhes do Produto
function openProductDetailModal(productId) {
  const products = getStoredProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('product-detail-modal');
  const modalBody = document.getElementById('product-detail-body');
  if (!modal || !modalBody) return;

  const priceFormatted = product.pricePerLiter.toFixed(2).replace('.', ',');

  modalBody.innerHTML = `
    <div class="product-modal-grid">
      <div class="product-modal-image-col">
        <img src="${product.image}" alt="${product.name}" class="product-modal-img">
        <div class="modal-eco-highlight">
          <span class="icon">♻️</span>
          <div>
            <strong>Economia Sustentável:</strong>
            <p>${product.ecoBenefit}</p>
          </div>
        </div>
      </div>
      <div class="product-modal-info-col">
        <span class="modal-category-tag">${product.category === 'limpeza' ? 'Produtos de Limpeza' : 'Higiene Pessoal'}</span>
        <h2 class="modal-product-title">${product.name}</h2>
        
        <div class="modal-price-box">
          <span class="modal-price">R$ ${priceFormatted}</span>
          <span class="modal-unit">por litro fracionado</span>
        </div>

        <div class="modal-desc-section">
          <h4>Sobre o produto:</h4>
          <p>${product.fullDesc}</p>
        </div>

        <div class="modal-eco-points-box">
          <div class="points-badge">+${product.ecoPoints} EcoPontos</div>
          <span>Ganhe pontos a cada litro e troque por descontos ou frete grátis!</span>
        </div>

        <div class="modal-how-to-refill">
          <h4>Como refilar:</h4>
          <ul>
            <li>✅ Traga sua própria embalagem (qualquer frasco limpo e com tampa).</li>
            <li>✅ Ou selecione nossos frascos retornáveis de vidro âmbar ou PET reciclado.</li>
            <li>✅ Compre apenas os litros ou mililitros que você realmente precisa.</li>
          </ul>
        </div>

        <div class="modal-purchase-action">
          <div class="modal-qty-control">
            <label for="modal-product-qty">Litros desejados:</label>
            <div class="stepper-row">
              <button type="button" class="qty-btn" onclick="stepModalQty(-1)">−</button>
              <input type="number" id="modal-product-qty" value="1" min="0.5" max="50" step="0.5" oninput="updateModalSubtotal(${product.pricePerLiter})">
              <button type="button" class="qty-btn" onclick="stepModalQty(1)">+</button>
            </div>
          </div>
          
          <div class="modal-subtotal-row">
            <span>Total calculado:</span>
            <strong id="modal-subtotal-val">R$ ${priceFormatted}</strong>
          </div>

          <button type="button" class="btn btn-primary btn-block" onclick="addProductFromModal(${product.id})">
            🛒 Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

function stepModalQty(delta) {
  const input = document.getElementById('modal-product-qty');
  if (!input) return;
  let val = parseFloat(input.value) || 1;
  val = Math.max(0.5, val + delta);
  input.value = val;
  input.dispatchEvent(new Event('input'));
}

function updateModalSubtotal(pricePerLiter) {
  const input = document.getElementById('modal-product-qty');
  const subtotalEl = document.getElementById('modal-subtotal-val');
  if (!input || !subtotalEl) return;
  const val = parseFloat(input.value) || 1;
  subtotalEl.textContent = `R$ ${(val * pricePerLiter).toFixed(2).replace('.', ',')}`;
}

function addProductFromModal(productId) {
  const input = document.getElementById('modal-product-qty');
  const qty = input ? parseFloat(input.value) || 1 : 1;
  if (typeof addToCart === 'function') {
    addToCart(productId, qty);
  }
  closeProductDetailModal();
}

function closeProductDetailModal() {
  const modal = document.getElementById('product-detail-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
}
