const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginMessage = document.getElementById('loginMessage');
const API_BASE_URL = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000'
  : '';

const showMessage = (message, type = 'error') => {
  loginMessage.textContent = message;
  loginMessage.classList.remove('error', 'success');
  loginMessage.classList.add('visible', type);
};

const setToken = (token) => {
  localStorage.setItem('token', token);
};

const getToken = () => localStorage.getItem('token');

const redirectToDashboard = () => {
  window.location.href = 'index.html';
};

const onLoad = async () => {
  const token = getToken();
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) redirectToDashboard();
  } catch (error) {
    localStorage.removeItem('token');
  }
};

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    return showMessage('Completa todos los campos', 'error');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();

    if (!response.ok) {
      return showMessage(data.message || 'Error al iniciar sesión', 'error');
    }

    setToken(data.token);
    showMessage('Autenticación exitosa. Redirigiendo...', 'success');
    setTimeout(redirectToDashboard, 700);
  } catch (error) {
    showMessage('No se pudo conectar al servidor', 'error');
  }
});

onLoad();
