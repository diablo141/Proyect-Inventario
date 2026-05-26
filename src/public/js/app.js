const API_BASE = '/api';
const state = {
  user: null,
  products: [],
  categories: [],
  providers: [],
  sales: [],
  notifications: [],
  saleItems: [],
  reports: { ventas: {}, productos: {}, ganancias: {} }
};

const selectors = {
  logoutBtn: document.getElementById('logoutBtn'),
  sectionButtons: document.querySelectorAll('.menu-link'),
  sections: document.querySelectorAll('.page-section'),
  searchInput: document.getElementById('searchInput'),
  reloadDashboard: document.getElementById('reloadDashboard'),
  totalProductos: document.getElementById('totalProductos'),
  totalCategorias: document.getElementById('totalCategorias'),
  ventasDia: document.getElementById('ventasDia'),
  gananciaMes: document.getElementById('gananciaMes'),
  lowStockCount: document.getElementById('lowStockCount'),
  recommendedProvider: document.getElementById('recommendedProvider'),
  bestProduct: document.getElementById('bestProduct'),
  categorySales: document.getElementById('categorySales'),
  recentProductsTable: document.getElementById('recentProductsTable'),
  productsTable: document.getElementById('productsTable'),
  categoriesTable: document.getElementById('categoriesTable'),
  categoryFilter: document.getElementById('categoryFilter'),
  clearFilter: document.getElementById('clearFilter'),
  showProductForm: document.getElementById('showProductForm'),
  showCategoryForm: document.getElementById('showCategoryForm'),
  showProviderForm: document.getElementById('showProviderForm'),
  providerSearchInput: document.getElementById('providerSearchInput'),
  providersTable: document.getElementById('providersTable'),
  saleProductSelect: document.getElementById('saleProductSelect'),
  saleQuantity: document.getElementById('saleQuantity'),
  addSaleItem: document.getElementById('addSaleItem'),
  saleItemsTable: document.getElementById('saleItemsTable'),
  saleTotal: document.getElementById('saleTotal'),
  submitSale: document.getElementById('submitSale'),
  salesHistoryTable: document.getElementById('salesHistoryTable'),
  notificationsList: document.getElementById('notificationsList'),
  toast: document.getElementById('toast'),
  userName: document.getElementById('userName'),
  profileName: document.getElementById('profileName'),
  profileRole: document.getElementById('profileRole')
};

let salesChart;
let categoryChart;
let productChart;

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

const showToast = (message, type = 'success') => {
  selectors.toast.textContent = message;
  selectors.toast.style.background = type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(15, 23, 42, 0.95)';
  selectors.toast.classList.remove('hidden');
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => selectors.toast.classList.add('hidden'), 3200);
};

const setActiveSection = (sectionId) => {
  selectors.sectionButtons.forEach((button) => button.classList.toggle('active', button.dataset.section === sectionId));
  selectors.sections.forEach((section) => section.classList.toggle('hidden', section.id !== `${sectionId}Section`));
};

const getToken = () => localStorage.getItem('token');
const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
};

const fetchJson = async (url, options = {}) => {
  options.headers = { ...(options.headers || {}), ...authHeaders() };
  try {
    const response = await fetch(url, options);
    if (response.status === 401 || response.status === 403) {
      logout();
      throw new Error('Acceso no autorizado');
    }
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Error en la petición');
    }
    return response.json();
  } catch (error) {
    showToast(error.message || 'Ocurrió un error', 'error');
    throw error;
  }
};

const checkLogin = async () => {
  const token = getToken();
  if (!token) return logout();
  try {
    const profile = await fetchJson(`${API_BASE}/auth/profile`);
    state.user = profile;
    if (selectors.userName) selectors.userName.textContent = profile.nombre;
    if (selectors.profileName) selectors.profileName.textContent = profile.nombre;
    if (selectors.profileRole) selectors.profileRole.textContent = profile.rol;
    await loadApp();
  } catch {
    logout();
  }
};

const loadApp = async () => {
  setActiveSection('dashboard');
  await Promise.all([fetchCategories(), fetchProviders(), fetchProducts(), fetchSales(), fetchNotifications(), fetchReports()]);
  renderDashboard();
};

const fetchCategories = async () => {
  state.categories = await fetchJson(`${API_BASE}/categorias`);
  renderCategoryOptions();
  renderCategoriesTable();
};

const fetchProviders = async () => {
  state.providers = await fetchJson(`${API_BASE}/proveedores`);
  renderProvidersTable();
};

const fetchProducts = async () => {
  const query = new URLSearchParams();
  if (selectors.searchInput.value.trim()) query.set('search', selectors.searchInput.value.trim());
  if (selectors.categoryFilter && selectors.categoryFilter.value) query.set('categoria', selectors.categoryFilter.value);
  state.products = await fetchJson(`${API_BASE}/productos?${query.toString()}`);
  renderProductsTable();
  renderSaleProductOptions();
};

const fetchSales = async () => {
  const data = await fetchJson(`${API_BASE}/ventas`);
  state.sales = data.ventas;
  renderSalesHistory();
};

const fetchNotifications = async () => {
  state.notifications = await fetchJson(`${API_BASE}/notificaciones`);
  renderNotifications();
};

const fetchReports = async () => {
  state.reports.ventas = await fetchJson(`${API_BASE}/reportes/ventas`);
  state.reports.productos = await fetchJson(`${API_BASE}/reportes/productos`);
  state.reports.ganancias = await fetchJson(`${API_BASE}/reportes/ganancias`);
};

const renderCategoryOptions = () => {
  if (!selectors.categoryFilter) return;
  selectors.categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
  state.categories.forEach((category) => {
    selectors.categoryFilter.innerHTML += `<option value="${category.id}">${category.nombre}</option>`;
  });
};

const renderNotifications = () => {
  const lowStockMessages = state.reports.productos.stockBajo?.map((item) => `El producto "${item.nombre}" está bajo stock (${item.stock}). Contacta a ${item.proveedor} en ${item.correo}.`) || [];
  selectors.notificationsList.innerHTML = '';
  [...lowStockMessages, ...state.notifications.map((item) => item.mensaje)].slice(0, 8).forEach((message) => {
    selectors.notificationsList.innerHTML += `<li>${message}</li>`;
  });
};

const renderProductsTable = () => {
  selectors.productsTable.innerHTML = '';
  const todayProducts = state.products.slice(0, 8);
  selectors.recentProductsTable.innerHTML = '';
  todayProducts.forEach((product) => {
    selectors.productsTable.innerHTML += `
      <tr>
        <td>${product.nombre}</td>
        <td>${product.categoria}</td>
        <td>${product.proveedor}</td>
        <td>${product.stock}</td>
        <td>${formatCurrency(product.precio)}</td>
        <td>
          <button class="button-secondary" onclick="window.showEditProduct(${product.id})">Editar</button>
          <button class="button-secondary" onclick="window.deleteProduct(${product.id})">Eliminar</button>
        </td>
      </tr>
    `;
    selectors.recentProductsTable.innerHTML += `
      <tr>
        <td>${product.nombre}</td>
        <td>${product.categoria}</td>
        <td>${product.stock}</td>
        <td>${formatCurrency(product.precio)}</td>
      </tr>
    `;
  });
};

const renderCategoriesTable = () => {
  selectors.categoriesTable.innerHTML = '';
  state.categories.forEach((category) => {
    selectors.categoriesTable.innerHTML += `
      <tr>
        <td>${category.nombre}</td>
        <td>${category.descripcion || '-'}</td>
      </tr>
    `;
  });
};

const renderProvidersTable = () => {
  const filter = selectors.providerSearchInput.value.trim().toLowerCase();
  selectors.providersTable.innerHTML = '';
  state.providers.filter((provider) => {
    if (!filter) return true;
    return provider.nombre.toLowerCase().includes(filter) || provider.correo.toLowerCase().includes(filter) || provider.telefono.includes(filter);
  }).forEach((provider) => {
    selectors.providersTable.innerHTML += `
      <tr>
        <td>${provider.nombre}</td>
        <td>${provider.correo}</td>
        <td>${provider.telefono}</td>
        <td>${provider.direccion || '-'}</td>
        <td>
          <button class="button-secondary" onclick="window.showEditProvider(${provider.id})">Editar</button>
          <button class="button-secondary" onclick="window.deleteProvider(${provider.id})">Eliminar</button>
        </td>
      </tr>
    `;
  });
};

const renderSaleProductOptions = () => {
  selectors.saleProductSelect.innerHTML = '';
  state.products.filter((product) => product.stock > 0).forEach((product) => {
    selectors.saleProductSelect.innerHTML += `<option value="${product.id}" data-price="${product.precio}">${product.nombre} (${product.stock} en stock)</option>`;
  });
};

const renderSalesHistory = () => {
  selectors.salesHistoryTable.innerHTML = '';
  state.sales.forEach((sale) => {
    selectors.salesHistoryTable.innerHTML += `
      <tr>
        <td>${sale.id}</td>
        <td>${sale.items}</td>
        <td>${formatCurrency(sale.total)}</td>
        <td>${new Date(sale.creado_en).toLocaleString()}</td>
      </tr>
    `;
  });
};

const renderDashboard = () => {
  selectors.totalProductos.textContent = state.products.length;
  selectors.totalCategorias.textContent = state.categories.length;
  selectors.ventasDia.textContent = formatCurrency(state.reports.ganancias.ventas_dia || 0);
  selectors.gananciaMes.textContent = formatCurrency(state.reports.ganancias.ventas_mes || 0);
  selectors.lowStockCount.textContent = state.reports.productos.stockBajo?.length || 0;
  selectors.bestProduct.textContent = state.reports.productos.masVendidos?.[0]?.nombre || 'Ninguno';
  selectors.categorySales.textContent = state.reports.productos.categoriaVentas?.length ? state.reports.productos.categoriaVentas.map((cat) => `${cat.categoria}: ${formatCurrency(cat.total_ventas)}`).join(' | ') : 'Sin datos';
  selectors.recommendedProvider.textContent = state.reports.productos.stockBajo?.[0]?.proveedor || 'Sin recomendaciones';
  renderNotifications();
  renderSalesChart();
  renderCategoryChart();
  renderProductChart();
};

const renderSalesChart = () => {
  const labels = state.reports.ventas.ventasMensuales?.map((item) => `Mes ${item.mes}`) || [];
  const values = state.reports.ventas.ventasMensuales?.map((item) => Number(item.total)) || [];
  if (salesChart) {
    salesChart.data.labels = labels;
    salesChart.data.datasets[0].data = values;
    salesChart.update();
    return;
  }
  const ctx = document.getElementById('salesChart').getContext('2d');
  salesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{ label: 'Ventas mensuales', data: values, borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.18)', fill: true, tension: 0.35, pointRadius: 4 }]
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } }
  });
};

const renderCategoryChart = () => {
  const labels = state.reports.productos.categoriaVentas?.map((item) => item.categoria) || [];
  const values = state.reports.productos.categoriaVentas?.map((item) => Number(item.total_ventas)) || [];
  if (categoryChart) {
    categoryChart.data.labels = labels;
    categoryChart.data.datasets[0].data = values;
    categoryChart.update();
    return;
  }
  const ctx = document.getElementById('categoryChart').getContext('2d');
  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values, backgroundColor: ['#2563eb', '#1d4ed8', '#60a5fa', '#93c5fd', '#bfdbfe'] }] },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  });
};

const renderProductChart = () => {
  const labels = state.reports.productos.masVendidos?.map((item) => item.nombre) || [];
  const sold = state.reports.productos.masVendidos?.map((item) => Number(item.vendidas)) || [];
  const lowSold = state.reports.productos.menosVendidos?.map((item) => Number(item.vendidas)) || [];
  if (productChart) {
    productChart.data.labels = labels;
    productChart.data.datasets[0].data = sold;
    productChart.data.datasets[1].data = lowSold;
    productChart.update();
    return;
  }
  const ctx = document.getElementById('productChart').getContext('2d');
  productChart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Más vendidos', data: sold, backgroundColor: '#2563eb' }, { label: 'Menos vendidos', data: lowSold, backgroundColor: '#f59e0b' }] },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }
  });
};

const addSaleItem = () => {
  const productId = Number(selectors.saleProductSelect.value);
  const quantity = Number(selectors.saleQuantity.value);
  if (!productId || quantity < 1) {
    return showToast('Selecciona un producto y cantidad válida', 'error');
  }
  const product = state.products.find((item) => item.id === productId);
  if (!product || product.stock < quantity) {
    return showToast('Stock insuficiente para este producto', 'error');
  }
  const existingItem = state.saleItems.find((item) => item.producto_id === productId);
  if (existingItem) {
    existingItem.cantidad += quantity;
  } else {
    state.saleItems.push({ producto_id: product.id, nombre: product.nombre, cantidad: quantity, precio_unitario: product.precio });
  }
  renderSaleCart();
};

const renderSaleCart = () => {
  selectors.saleItemsTable.innerHTML = '';
  let total = 0;
  state.saleItems.forEach((item, index) => {
    const subtotal = item.precio_unitario * item.cantidad;
    total += subtotal;
    selectors.saleItemsTable.innerHTML += `
      <tr>
        <td>${item.nombre}</td>
        <td>${item.cantidad}</td>
        <td>${formatCurrency(item.precio_unitario)}</td>
        <td>${formatCurrency(subtotal)}</td>
        <td><button class="button-secondary" onclick="window.removeSaleItem(${index})">Eliminar</button></td>
      </tr>
    `;
  });
  selectors.saleTotal.textContent = formatCurrency(total);
};

const submitSale = async () => {
  if (!state.saleItems.length) {
    return showToast('Agrega productos al carrito antes de registrar la venta', 'error');
  }
  await fetchJson(`${API_BASE}/ventas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: state.saleItems }) });
  showToast('Venta registrada con éxito');
  state.saleItems = [];
  renderSaleCart();
  await Promise.all([fetchProducts(), fetchSales(), fetchReports(), fetchNotifications()]);
};

window.removeSaleItem = (index) => {
  state.saleItems.splice(index, 1);
  renderSaleCart();
};

window.showEditProduct = async (productId) => {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  showProductForm(product);
};

window.deleteProduct = async (productId) => {
  const confirmDelete = confirm('¿Deseas eliminar este producto? Esta acción no se puede deshacer.');
  if (!confirmDelete) return;
  await fetchJson(`${API_BASE}/productos/${productId}`, { method: 'DELETE' });
  showToast('Producto eliminado');
  await fetchProducts();
};

const showProductForm = (product = null) => {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card">
      <h3>${product ? 'Editar producto' : 'Crear producto'}</h3>
      <form id="productForm">
        <label>Nombre del producto</label>
        <input name="nombre" value="${product ? product.nombre : ''}" required />
        <label>Categoría</label>
        <select name="categoria_id" required>
          ${state.categories.map((category) => `<option value="${category.id}" ${product && product.categoria_id === category.id ? 'selected' : ''}>${category.nombre}</option>`).join('')}
        </select>
        <label>Proveedor</label>
        <select name="proveedor_id" required>
          ${state.providers.map((provider) => `<option value="${provider.id}" ${product && product.proveedor_id === provider.id ? 'selected' : ''}>${provider.nombre} - ${provider.correo}</option>`).join('')}
        </select>
        <label>Precio</label>
        <input name="precio" type="number" min="0" step="0.01" value="${product ? product.precio : ''}" required />
        <label>Stock</label>
        <input name="stock" type="number" min="0" value="${product ? product.stock : 1}" required />
        <label>Descripción</label>
        <textarea name="descripcion">${product ? product.descripcion : ''}</textarea>
        <div class="modal-actions">
          <button type="submit" class="button-primary">${product ? 'Guardar cambios' : 'Agregar producto'}</button>
          <button type="button" class="button-secondary" id="closeModal">Cancelar</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  const productForm = modal.querySelector('#productForm');
  const closeModal = () => modal.remove();
  modal.querySelector('#closeModal').addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  productForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(productForm);
    const payload = {
      nombre: formData.get('nombre').trim(),
      categoria_id: Number(formData.get('categoria_id')),
      proveedor_id: Number(formData.get('proveedor_id')),
      precio: Number(formData.get('precio')),
      stock: Number(formData.get('stock')),
      descripcion: formData.get('descripcion').trim()
    };
    const url = product ? `${API_BASE}/productos/${product.id}` : `${API_BASE}/productos`;
    const method = product ? 'PUT' : 'POST';
    await fetchJson(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    showToast(product ? 'Producto actualizado' : 'Producto creado');
    closeModal();
    await fetchProducts();
  });
};

const showCategoryForm = () => {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card">
      <h3>Nueva categoría</h3>
      <form id="categoryForm">
        <label>Nombre</label>
        <input name="nombre" required />
        <label>Descripción</label>
        <textarea name="descripcion"></textarea>
        <div class="modal-actions">
          <button type="submit" class="button-primary">Agregar categoría</button>
          <button type="button" class="button-secondary" id="closeCategoryModal">Cancelar</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  const categoryForm = modal.querySelector('#categoryForm');
  const closeModal = () => modal.remove();
  modal.querySelector('#closeCategoryModal').addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  categoryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(categoryForm);
    const payload = { nombre: formData.get('nombre').trim(), descripcion: formData.get('descripcion').trim() };
    await fetchJson(`${API_BASE}/categorias`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    showToast('Categoría agregada');
    closeModal();
    await fetchCategories();
    await fetchProducts();
  });
};

const showProviderForm = (provider = null) => {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card">
      <h3>${provider ? 'Editar proveedor' : 'Nuevo proveedor'}</h3>
      <form id="providerForm">
        <label>Nombre</label>
        <input name="nombre" value="${provider ? provider.nombre : ''}" required />
        <label>Correo</label>
        <input name="correo" type="email" value="${provider ? provider.correo : ''}" required />
        <label>Teléfono</label>
        <input name="telefono" value="${provider ? provider.telefono : ''}" required />
        <label>Dirección</label>
        <input name="direccion" value="${provider ? provider.direccion : ''}" />
        <div class="modal-actions">
          <button type="submit" class="button-primary">${provider ? 'Guardar cambios' : 'Agregar proveedor'}</button>
          <button type="button" class="button-secondary" id="closeProviderModal">Cancelar</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  const providerForm = modal.querySelector('#providerForm');
  const closeModal = () => modal.remove();
  modal.querySelector('#closeProviderModal').addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  providerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(providerForm);
    const payload = { nombre: formData.get('nombre').trim(), correo: formData.get('correo').trim(), telefono: formData.get('telefono').trim(), direccion: formData.get('direccion').trim() };
    const method = provider ? 'PUT' : 'POST';
    const url = provider ? `${API_BASE}/proveedores/${provider.id}` : `${API_BASE}/proveedores`;
    await fetchJson(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    showToast(provider ? 'Proveedor actualizado' : 'Proveedor agregado');
    closeModal();
    await fetchProviders();
    await fetchProducts();
    renderProvidersTable();
  });
};

window.showEditProvider = async (providerId) => {
  const provider = state.providers.find((item) => item.id === providerId);
  if (!provider) return;
  showProviderForm(provider);
};

window.deleteProvider = async (providerId) => {
  const confirmDelete = confirm('¿Deseas eliminar este proveedor? Esta acción afectará productos asociados.');
  if (!confirmDelete) return;
  await fetchJson(`${API_BASE}/proveedores/${providerId}`, { method: 'DELETE' });
  showToast('Proveedor eliminado');
  await fetchProviders();
  await fetchProducts();
  renderProvidersTable();
};

const loadDashboard = async () => {
  await Promise.all([fetchProducts(), fetchSales(), fetchReports(), fetchNotifications()]);
};

const attachListeners = () => {
  selectors.logoutBtn.addEventListener('click', logout);
  selectors.sectionButtons.forEach((button) => button.addEventListener('click', () => setActiveSection(button.dataset.section)));
  selectors.searchInput.addEventListener('input', () => fetchProducts());
  selectors.clearFilter.addEventListener('click', () => { selectors.categoryFilter.value = ''; fetchProducts(); });
  selectors.reloadDashboard.addEventListener('click', () => loadDashboard());
  selectors.showProductForm.addEventListener('click', () => showProductForm());
  selectors.showCategoryForm.addEventListener('click', () => showCategoryForm());
  selectors.showProviderForm.addEventListener('click', () => showProviderForm());
  selectors.providerSearchInput.addEventListener('input', () => renderProvidersTable());
  selectors.addSaleItem.addEventListener('click', addSaleItem);
  selectors.submitSale.addEventListener('click', submitSale);
};

const initialize = async () => {
  attachListeners();
  await checkLogin();
};

window.removeSaleItem = (index) => {
  state.saleItems.splice(index, 1);
  renderSaleCart();
};

window.addEventListener('DOMContentLoaded', initialize);
