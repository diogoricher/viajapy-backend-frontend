const toast = document.querySelector('#toast');
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

const authModal = document.querySelector('#auth-modal');
const authTitle = document.querySelector('#auth-title');
const authSubtitle = document.querySelector('#auth-subtitle');
const authClose = document.querySelector('#auth-close');
const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector('#register-form');
const authCopy = {
  login: { title: 'Bienvenido de vuelta', subtitle: 'Entrá para guardar destinos, sumar puntos y continuar tu mapa.' },
  register: { title: 'Creá tu cuenta viajera', subtitle: 'Guardá tus lugares favoritos y empezá a desbloquear Paraguay.' },
};

function setAuthView(view) {
  const copy = authCopy[view];
  if (!copy) return;
  authTitle.textContent = copy.title;
  authSubtitle.textContent = copy.subtitle;
  document.querySelectorAll('[data-auth-tab]').forEach((tab) => {
    const isActive = tab.dataset.authTab === view;
    if (tab.classList.contains('auth-tab')) tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
  loginForm?.classList.toggle('auth-hidden', view !== 'login');
  registerForm?.classList.toggle('auth-hidden', view !== 'register');
}

function toggleAuth(open, view = 'login') {
  if (!authModal) return;
  authModal.hidden = !open;
  document.body.classList.toggle('modal-open', open);
  if (open) {
    setAuthView(view);
    window.setTimeout(() => authModal.querySelector('input:not([type="checkbox"])')?.focus(), 50);
  }
}

// Los botones de acceso se configuran debajo para distinguir iniciar sesión de cerrar sesión.
document.querySelectorAll('[data-auth-tab]').forEach((button) => button.addEventListener('click', () => setAuthView(button.dataset.authTab)));
authClose?.addEventListener('click', () => toggleAuth(false));
authModal?.querySelectorAll('[data-close-auth]').forEach((element) => element.addEventListener('click', () => toggleAuth(false)));
// Configuración de la API del Backend de ViajaPy
const API_BASE_URL = window.location.origin;

const authUsersKey = 'viajapy-demo-users';
const authSessionKey = 'viajapy-session'; // Guardamos { id, name, email, rol, token }
const getAuthSession = () => JSON.parse(localStorage.getItem(authSessionKey) || 'null');
const setDeveloperMode = (enabled) => {
  document.body.classList.toggle('developer-mode', enabled);
  localStorage.setItem('viajapy-demo-developer', enabled ? 'true' : 'false');
};
setDeveloperMode(false);
function toggleDeveloperMode() {
  const enabled = !document.body.classList.contains('developer-mode');
  setDeveloperMode(enabled);
  showToast(enabled ? 'Modo desarrollador activado para la exposición.' : 'Modo desarrollador desactivado.');
}
document.addEventListener('click', (event) => {
  if (event.target.closest('#developer-trigger')) toggleDeveloperMode();
});
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd') {
    event.preventDefault();
    toggleDeveloperMode();
  }
});

const updateAuthButton = () => {
  const session = getAuthSession();
  document.querySelectorAll('[data-open-auth]').forEach((button) => {
    button.textContent = session ? `${session.nombre || session.name} · Salir` : 'Iniciar sesión ↗';
    button.onclick = session ? () => {
      localStorage.removeItem(authSessionKey);
      updateAuthButton();
      showToast('Cerraste tu sesión.');
    } : () => toggleAuth(true, 'login');
  });
};
updateAuthButton();

document.querySelectorAll('[data-social]').forEach((button) => button.addEventListener('click', () => showToast('El acceso con ' + button.dataset.social + ' se habilitará próximamente.')));

// LOGIN conectado a la API de Node.js / MySQL (/api/usuarios/login)
loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  const email = String(data.get('email')).trim().toLowerCase();
  const password = String(data.get('password'));
  const submitBtn = loginForm.querySelector('button[type="submit"]');

  if (submitBtn) submitBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE_URL}/api/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await res.json();

    if (!res.ok) {
      showToast(result.mensaje || 'Error al iniciar sesión.');
      return;
    }

    // Guardar sesión real con JWT
    localStorage.setItem(authSessionKey, JSON.stringify({
      id: result.usuario.id,
      nombre: result.usuario.nombre,
      email: result.usuario.email,
      rol: result.usuario.rol,
      token: result.token
    }));

    updateAuthButton();
    toggleAuth(false);
    showToast(`¡Bienvenido a viajaPY, ${result.usuario.nombre}!`);
    loginForm.reset();

    // Actualizar datos del usuario logueado en la pantalla
    cargarVisitasUsuario();
  } catch (err) {
    console.error('Error login:', err);
    showToast('Error de red al conectar con el servidor.');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});

// REGISTRO conectado a la API de Node.js / MySQL (/api/usuarios)
registerForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(registerForm);
  const nombre = String(data.get('name')).trim();
  const email = String(data.get('email')).trim().toLowerCase();
  const password = String(data.get('password'));
  const submitBtn = registerForm.querySelector('button[type="submit"]');

  if (submitBtn) submitBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE_URL}/api/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });
    const result = await res.json();

    if (!res.ok) {
      showToast(result.mensaje || 'Error al registrar la cuenta.');
      return;
    }

    showToast('¡Cuenta creada con éxito! Ahora iniciá sesión con tus credenciales.');
    registerForm.reset();
    setAuthView('login');
  } catch (err) {
    console.error('Error register:', err);
    showToast('Error de red al conectar con el servidor.');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && authModal && !authModal.hidden) toggleAuth(false);
});

document.querySelectorAll('[data-toast]').forEach((element) => {
  element.addEventListener('click', (event) => {
    if (element.tagName === 'A') event.preventDefault();
    showToast(element.dataset.toast);
  });
});

document.querySelectorAll('[data-scroll]').forEach((element) => {
  element.addEventListener('click', () => {
    document.querySelector(`#${element.dataset.scroll}`)?.scrollIntoView({ behavior: 'smooth' });
  });
});

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.desktop-nav');
menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  nav.classList.toggle('mobile-open', !isOpen);
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuToggle?.setAttribute('aria-expanded', 'false');
  nav.classList.remove('mobile-open');
}));

const filterButtons = document.querySelectorAll('.filter-pill');
const destinationCards = document.querySelectorAll('.destination-card');
const emptyState = document.querySelector('#empty-state');
const foodStories = document.querySelector('.food-stories');

const paraguayCities = ['Asunción', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Capiatá', 'Lambaré', 'Fernando de la Mora', 'Mariano Roque Alonso', 'Limpio', 'Ñemby', 'Villa Elisa', 'Itauguá', 'Areguá', 'Caaguazú', 'Coronel Oviedo', 'Encarnación', 'Hohenau', 'Cambyretá', 'San Juan del Paraná', 'Pilar', 'San Ignacio', 'Santa Rosa', 'Ayolas', 'Villarrica', 'Caazapá', 'Paraguarí', 'Carapeguá', 'Yaguarón', 'Pirayú', 'Caacupé', 'Eusebio Ayala', 'Tobatí', 'San Bernardino', 'Altos', 'Arroyos y Esteros', 'Concepción', 'Horqueta', 'Belén', 'Loreto', 'Pedro Juan Caballero', 'Capitán Bado', 'Bella Vista Norte', 'Salto del Guairá', 'Curuguaty', 'Katueté', 'Filadelfia', 'Mariscal Estigarribia', 'Loma Plata', 'Fuerte Olimpo', 'Bahía Negra', 'Villa Hayes', 'Benjamín Aceval', 'Puerto Pinasco', 'General Bruguez'];
const cityPicker = document.querySelector('#city-picker');
const destinationPicker = document.querySelector('#destination-picker');
const destinationValue = document.querySelector('#destination-value');
const cityList = document.querySelector('#city-list');
const cityFilter = document.querySelector('#city-filter');
const destinationSearch = document.querySelector('#destination-search');

function renderCities(query = '') {
  const normalized = query.trim().toLowerCase();
  const matches = [...paraguayCities].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })).filter((city) => city.toLowerCase().includes(normalized));
  cityList.innerHTML = '';
  if (!matches.length) {
    cityList.innerHTML = '<span class="city-empty">No encontramos esa ciudad.</span>';
    return;
  }
  matches.forEach((city) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'city-option';
    option.setAttribute('role', 'option');
    option.textContent = city;
    option.addEventListener('click', () => {
      destinationValue.textContent = city;
      destinationSearch.value = city;
      cityPicker.hidden = true;
      destinationPicker.setAttribute('aria-expanded', 'false');
    });
    cityList.appendChild(option);
  });
}

function toggleCityPicker(open) {
  cityPicker.hidden = !open;
  destinationPicker.setAttribute('aria-expanded', String(open));
  if (open) { renderCities(cityFilter.value); cityFilter.focus(); }
}

destinationPicker?.addEventListener('click', () => toggleCityPicker(cityPicker.hidden));
cityFilter?.addEventListener('input', () => renderCities(cityFilter.value));
document.addEventListener('click', (event) => {
  if (!event.target.closest('.destination-field')) toggleCityPicker(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && cityPicker && !cityPicker.hidden) toggleCityPicker(false);
});
renderCities();

const travelDate = document.querySelector('#travel-date');
if (travelDate) {
  const today = new Date();
  travelDate.min = today.toISOString().split('T')[0];
  travelDate.addEventListener('change', () => {
    if (travelDate.value) showToast(`Fecha elegida: ${new Intl.DateTimeFormat('es-PY', { dateStyle: 'medium' }).format(new Date(`${travelDate.value}T12:00:00`))}.`);
  });
}

function applyFilter(filter) {
  let visibleCards = 0;
  const cards = document.querySelectorAll('.destination-card');
  cards.forEach((card) => {
    const shouldShow = filter === 'Todos' || card.dataset.category === filter;
    card.classList.toggle('hidden', !shouldShow);
    if (shouldShow) visibleCards += 1;
  });
  if (emptyState) emptyState.classList.toggle('visible', visibleCards === 0);
  foodStories?.classList.toggle('hidden', filter !== 'Todos' && filter !== 'Cultura');
}

filterButtons.forEach((button) => button.addEventListener('click', () => {
  filterButtons.forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  applyFilter(button.dataset.filter);
}));

document.querySelectorAll('.category-card').forEach((card) => card.addEventListener('click', () => {
  const filter = card.dataset.filter;
  const matchingFilter = [...filterButtons].find((button) => button.dataset.filter === filter);
  matchingFilter?.click();
  document.querySelector(filter === 'Cultura' ? '#historias' : '#destinos')?.scrollIntoView({ behavior: 'smooth' });
}));

document.querySelectorAll('.heart-btn').forEach((button) => button.addEventListener('click', (event) => {
  event.stopPropagation();
  const saved = button.classList.toggle('saved');
  button.textContent = saved ? '♥' : '♡';
  showToast(saved ? 'Guardado en tus favoritos.' : 'Eliminado de tus favoritos.');
}));

let currentSelectedDestination = null;

// Cargar dinámicamente los lugares desde la API MySQL
async function cargarLugaresDesdeAPI() {
  const grid = document.querySelector('#destination-grid');
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/lugares`);
    const data = await res.json();
    if (res.ok && data.datos && data.datos.length > 0) {
      grid.innerHTML = data.datos.map((lugar, index) => {
        const num = String(index + 1).padStart(2, '0');
        const img = lugar.imagen_url || './assets/category-nature.png';
        const cat = lugar.categoria || 'Naturaleza';
        const precioTxt = lugar.precio ? `${lugar.precio.toLocaleString('es-PY')} Gs` : 'Acceso Libre';
        const horarioTxt = lugar.horario || 'Horario flexible';

        return `
          <article class="destination-card destination-card-clean" data-category="${cat}" data-id="${lugar.id}" data-img="${img}">
            <div class="card-clean-header">
              <span class="location-badge">${lugar.departamento}</span>
              <button class="heart-btn" type="button" aria-label="Guardar ${lugar.nombre}">♡</button>
            </div>
            <div class="card-clean-body">
              <span class="card-number">${num}</span>
              <h3 class="card-title">${lugar.nombre}</h3>
              <p class="destination-description">${lugar.descripcion || ''}</p>
            </div>
            <div class="destination-meta card-clean-footer">
              <span class="card-meta-tag">${cat} · ${precioTxt}</span>
              <span class="destination-arrow">Ver detalle ↗</span>
            </div>
          </article>
        `;
      }).join('');

      vincularTarjetasDestino();
    }
  } catch (err) {
    console.error('Error al cargar lugares dinámicos:', err);
  }
}

function vincularTarjetasDestino() {
  const cards = document.querySelectorAll('.destination-card');

  cards.forEach((card) => {
    card.setAttribute('tabindex', '0');
    const openDestination = () => {
      const title = card.querySelector('h3')?.textContent.trim();
      const description = card.querySelector('.destination-description')?.textContent.trim();
      const location = (card.querySelector('.location-badge') || card.querySelector('.location-tag'))?.textContent.trim();
      const id = card.dataset.id;
      const img = card.dataset.img || card.querySelector('.destination-image')?.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1').split(',')[1]?.trim() || card.querySelector('img')?.src;

      currentSelectedDestination = { id, title, location, description };

      destinationModal.hidden = false;
      document.body.classList.add('modal-open');
      if (destinationModalImage) {
        destinationModalImage.src = img || './assets/category-nature.png';
        destinationModalImage.alt = title;
      }
      if (destinationModalTitle) destinationModalTitle.textContent = title;
      if (destinationModalLocation) destinationModalLocation.textContent = location;
      if (destinationModalDescription) destinationModalDescription.textContent = description;
      destinationModalClose?.focus();
    };

    card.addEventListener('click', (event) => {
      if (!event.target.closest('.heart-btn')) openDestination();
    });

    card.addEventListener('keydown', (event) => {
      if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('.heart-btn')) {
        event.preventDefault();
        openDestination();
      }
    });

    const heart = card.querySelector('.heart-btn');
    heart?.addEventListener('click', (e) => {
      e.stopPropagation();
      const saved = heart.classList.toggle('saved');
      heart.textContent = saved ? '♥' : '♡';
      showToast(saved ? 'Guardado en tus favoritos.' : 'Eliminado de tus favoritos.');
    });
  });
}

// Ejecutar carga inicial de lugares dinámicos
cargarLugaresDesdeAPI();

const destinationModal = document.querySelector('#destination-modal');
const destinationModalClose = document.querySelector('#destination-modal-close');
const destinationModalImage = document.querySelector('#destination-modal-image');
const destinationModalTitle = document.querySelector('#destination-modal-title');
const destinationModalLocation = document.querySelector('#destination-modal-location');
const destinationModalDescription = document.querySelector('#destination-modal-description');
const btnRegistrarVisita = document.querySelector('#btn-registrar-visita');

function closeDestinationModal() {
  destinationModal.hidden = true;
  document.body.classList.remove('modal-open');
}
destinationModalClose?.addEventListener('click', closeDestinationModal);
destinationModal?.querySelectorAll('[data-close-destination]').forEach((element) => element.addEventListener('click', closeDestinationModal));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && destinationModal && !destinationModal.hidden) closeDestinationModal();
});

// Registrar visita conectada al backend (/api/visitas)
btnRegistrarVisita?.addEventListener('click', async () => {
  const session = getAuthSession();
  if (!session || !session.token) {
    showToast('Iniciá sesión para registrar visitas y ganar medallas.');
    toggleAuth(true, 'login');
    return;
  }

  if (!currentSelectedDestination) return;

  btnRegistrarVisita.disabled = true;
  try {
    // Buscamos si existe un lugar con nombre o departamento similar en la BD, o usamos id por defecto
    const resLugares = await fetch(`${API_BASE_URL}/api/lugares`);
    const dataLugares = await resLugares.json();
    const lugares = dataLugares.datos || [];
    
    // Hallar coincidencia
    let match = lugares.find(l => 
      l.nombre.toLowerCase().includes(currentSelectedDestination.title.toLowerCase()) ||
      currentSelectedDestination.title.toLowerCase().includes(l.nombre.toLowerCase())
    );

    if (!match) {
      match = lugares.find(l => 
        l.departamento.toLowerCase().includes(currentSelectedDestination.location.toLowerCase()) ||
        currentSelectedDestination.location.toLowerCase().includes(l.departamento.toLowerCase())
      );
    }

    const lugarId = match ? match.id : (lugares[0] ? lugares[0].id : 1);

    const res = await fetch(`${API_BASE_URL}/api/visitas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.token}`
      },
      body: JSON.stringify({ lugar_id: lugarId })
    });

    const resultado = await res.json();

    if (!res.ok) {
      showToast(resultado.mensaje || 'No se pudo registrar la visita.');
      return;
    }

    showToast(resultado.mensaje || '¡Visita registrada exitosamente!');
    pointsBalance += 10;
    refreshPoints();
    cargarVisitasUsuario();
  } catch (err) {
    console.error('Error al registrar visita:', err);
    showToast('Error al conectar con el servidor.');
  } finally {
    btnRegistrarVisita.disabled = false;
  }
});

document.querySelector('#search-button')?.addEventListener('click', () => {
  const query = document.querySelector('#destination-search').value.trim().toLowerCase();
  const cards = document.querySelectorAll('.destination-card');
  if (!query) {
    cards.forEach((card) => card.classList.remove('hidden'));
    document.querySelector('#destinos')?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  const matches = [...cards].filter((card) => card.textContent.toLowerCase().includes(query));
  cards.forEach((card) => card.classList.toggle('hidden', !matches.includes(card)));
  if (emptyState) emptyState.classList.toggle('visible', matches.length === 0);
  document.querySelectorAll('.filter-pill').forEach((pill) => pill.classList.remove('active'));
  document.querySelector('#destinos')?.scrollIntoView({ behavior: 'smooth' });
});

document.querySelector('#newsletter-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = event.currentTarget.querySelector('input');
  showToast(`Listo, ${input.value}: ya sos parte de viajaPY.`);
  input.value = '';
});

const mapModal = document.querySelector('#my-map-modal');
const mapButton = document.querySelector('#my-map-button');
const mapClose = document.querySelector('#map-close');

function toggleMap(open) {
  if (!mapModal) return;
  mapModal.hidden = !open;
  document.body.classList.toggle('modal-open', open);
  if (open) mapClose?.focus();
}

mapButton?.addEventListener('click', () => toggleMap(true));
mapClose?.addEventListener('click', () => toggleMap(false));
mapModal?.querySelectorAll('[data-close-map]').forEach((element) => element.addEventListener('click', () => toggleMap(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mapModal && !mapModal.hidden) toggleMap(false);
});

const paraguayMap = document.querySelector('.paraguay-map');
const mapRegionStatus = document.querySelector('#map-region-status');
const mapUnlockedCount = document.querySelector('#map-unlocked-count');
let mapScale = 1;
const mapRegionCopy = {
  Norte: 'El Norte te espera con cerros, saltos y caminos de naturaleza.',
  Centro: 'El Centro conecta cultura, pueblos con encanto y escapadas de un día.',
  Este: 'La región Este reúne selva, ríos y algunos de los saltos más increíbles.',
  Chaco: 'El Chaco ofrece horizontes abiertos, fauna silvestre y aventura auténtica.',
};
document.querySelectorAll('[data-map-action]').forEach((button) => button.addEventListener('click', () => {
  const action = button.dataset.mapAction;
  if (action === 'zoom-in') mapScale = Math.min(mapScale + .15, 1.6);
  if (action === 'zoom-out') mapScale = Math.max(mapScale - .15, .75);
  if (action === 'reset') mapScale = 1;
  paraguayMap.style.transform = `scale(${mapScale})`;
}));
document.querySelectorAll('[data-map-region]').forEach((button) => button.addEventListener('click', () => {
  const region = button.dataset.mapRegion;
  mapRegionStatus.textContent = mapRegionCopy[region];
  document.querySelectorAll('[data-map-region]').forEach((item) => item.classList.toggle('active', item === button));
}));
document.querySelectorAll('.paraguay-map .region').forEach((region, index) => region.addEventListener('click', () => {
  const names = ['Norte', 'Centro', 'Sur'];
  const name = names[index] || 'Paraguay';
  mapRegionStatus.textContent = `${name}: seleccionaste esta zona del mapa. Seguí explorando para desbloquear nuevas rutas.`;
  if (region.classList.contains('region-locked')) {
    region.classList.remove('region-locked');
    region.classList.add('region-unlocked');
    mapUnlockedCount.textContent = Number(mapUnlockedCount.textContent) + 1;
    showToast(`¡Desbloqueaste la región ${name}!`);
  }
}));
document.querySelectorAll('.paraguay-map .map-pin').forEach((pin) => pin.addEventListener('click', () => {
  const place = pin.nextElementSibling?.textContent || 'este lugar';
  mapRegionStatus.textContent = `${place}: punto de interés en tu ruta. ¡Hacé clic en el destino para conocer más!`;
}));

const routeModal = document.querySelector('#route-modal');
const createRouteButton = document.querySelector('#create-route-button');
const routeModalClose = document.querySelector('#route-modal-close');
const routeSelection = document.querySelector('#route-selection');
function toggleRouteModal(open) {
  if (!routeModal) return;
  routeModal.hidden = !open;
  document.body.classList.toggle('modal-open', open);
  if (open) routeModal.querySelector('.route-option')?.focus();
}
createRouteButton?.addEventListener('click', () => toggleRouteModal(true));
routeModalClose?.addEventListener('click', () => toggleRouteModal(false));
routeModal?.querySelectorAll('[data-close-route]').forEach((element) => element.addEventListener('click', () => toggleRouteModal(false)));
routeModal?.querySelectorAll('[data-route]').forEach((route) => route.addEventListener('click', () => {
  routeModal.querySelectorAll('[data-route]').forEach((item) => item.classList.remove('selected'));
  route.classList.add('selected');
  routeSelection.textContent = `¡Ruta elegida! ${route.dataset.route} se agregó a tu mapa. Sumás +10 puntos al completarla.`;
  showToast(`Seleccionaste ${route.dataset.route}.`);
}));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && routeModal && !routeModal.hidden) toggleRouteModal(false);
});

let pointsBalance = 40;
const pointsBalanceElement = document.querySelector('#points-balance');
const pointsNextElement = document.querySelector('#points-next');
const pointsProgressElement = document.querySelector('#points-progress');

function refreshPoints() {
  const nextReward = 50;
  const progress = Math.min((pointsBalance / nextReward) * 100, 100);
  pointsBalanceElement.textContent = pointsBalance;
  pointsNextElement.textContent = Math.max(nextReward - pointsBalance, 0);
  pointsProgressElement.style.width = `${progress}%`;
}

document.querySelector('#add-trip-button')?.addEventListener('click', () => {
  pointsBalance += 10;
  refreshPoints();
  showToast('¡Viaje registrado! Sumaste +10 puntos.');
});

document.querySelectorAll('[data-redeem]').forEach((button) => button.addEventListener('click', () => {
  const cost = Number(button.dataset.redeem);
  const reward = button.dataset.reward;
  if (pointsBalance < cost) {
    showToast(`Te faltan ${cost - pointsBalance} puntos para canjear esta promo.`);
    return;
  }
  pointsBalance -= cost;
  refreshPoints();
  showToast(`Canjeaste: ${reward}. ¡Disfrutá el beneficio!`);
}));

const chatbotPanel = document.querySelector('#chatbot-panel');
const chatbotLaunch = document.querySelector('#chatbot-launch');
const chatbotClose = document.querySelector('#chatbot-close');
const chatbotBody = document.querySelector('#chatbot-body');
const chatbotInput = document.querySelector('#chatbot-input');

function toggleChatbot(open) {
  chatbotPanel?.classList.toggle('open', open);
  chatbotPanel?.setAttribute('aria-hidden', String(!open));
  chatbotLaunch?.setAttribute('aria-expanded', String(open));
  if (open) chatbotInput?.focus();
}

chatbotLaunch?.addEventListener('click', () => {
  const isOpen = chatbotPanel.classList.contains('open');
  toggleChatbot(!isOpen);
});
chatbotClose?.addEventListener('click', () => toggleChatbot(false));

function addChatMessage(text, type = 'user-message') {
  const message = document.createElement('div');
  message.className = type;
  message.textContent = text;
  chatbotBody.appendChild(message);
  chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

// Cargar visitas y medallas del usuario autenticado
async function cargarVisitasUsuario() {
  const session = getAuthSession();
  const medallasEl = document.querySelector('#lista-medallas-usuario');
  const perfilNombre = document.querySelector('#perfil-nombre');
  const perfilEmail = document.querySelector('#perfil-email');
  const perfilAvatar = document.querySelector('#perfil-avatar');
  const perfilPuntosVal = document.querySelector('#perfil-puntos-val');
  const perfilVisitasVal = document.querySelector('#perfil-visitas-val');
  const perfilMedallasVal = document.querySelector('#perfil-medallas-val');
  const btnPerfilLogin = document.querySelector('#btn-perfil-login');
  const historialGrid = document.querySelector('#perfil-historial-visitas');

  if (!session || !session.id) {
    if (medallasEl) {
      medallasEl.innerHTML = '<span style="background:#fff; border:1px solid #1A73E8; padding:3px 8px; border-radius:12px; color:#1A73E8;">Iniciá sesión para ver tus medallas</span>';
    }
    if (perfilNombre) perfilNombre.textContent = 'Explorador Anónimo';
    if (perfilEmail) perfilEmail.textContent = 'Iniciá sesión para sincronizar tus viajes';
    if (perfilPuntosVal) perfilPuntosVal.textContent = '0';
    if (perfilVisitasVal) perfilVisitasVal.textContent = '0';
    if (perfilMedallasVal) perfilMedallasVal.textContent = '0 / 7';
    if (btnPerfilLogin) {
      btnPerfilLogin.style.display = 'inline-block';
      btnPerfilLogin.onclick = () => toggleAuth(true, 'login');
    }
    renderGaleriaMedallas([]);
    return;
  }

  if (btnPerfilLogin) btnPerfilLogin.style.display = 'none';
  if (perfilNombre) perfilNombre.textContent = session.nombre || session.name;
  if (perfilEmail) perfilEmail.textContent = session.email;
  if (perfilAvatar) {
    const inicial = (session.nombre || session.name || 'U').charAt(0).toUpperCase();
    perfilAvatar.textContent = inicial;
  }

  try {
    // 1. Cargar historial de visitas
    const resVisitas = await fetch(`${API_BASE_URL}/api/visitas/usuario/${session.id}`);
    const dataVisitas = await resVisitas.json();
    const visitas = (resVisitas.ok && dataVisitas.datos) ? dataVisitas.datos : [];

    pointsBalance = 40 + (visitas.length * 10);
    refreshPoints();
    if (perfilPuntosVal) perfilPuntosVal.textContent = pointsBalance;
    if (perfilVisitasVal) perfilVisitasVal.textContent = visitas.length;
    const unlockedEl = document.querySelector('#map-unlocked-count');
    if (unlockedEl) unlockedEl.textContent = Math.max(visitas.length, 1);

    if (historialGrid) {
      if (visitas.length === 0) {
        historialGrid.innerHTML = '<span style="color:#64748b; font-size:12px;">Aún no tenés visitas registradas. Hacé clic en cualquier destino de la página para hacer check-in.</span>';
      } else {
        historialGrid.innerHTML = visitas.map(v => `
          <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:12px; padding:8px 14px; font-size:12px; display:inline-flex; align-items:center; gap:8px;">
            <span style="color:#10b981; font-weight:800;">✓</span>
            <strong style="color:#17324a;">${v.nombre}</strong>
            <small style="color:#64748b;">(${v.departamento})</small>
          </div>
        `).join('');
      }
    }

    // 2. Cargar medallas desde endpoint
    const resMedallas = await fetch(`${API_BASE_URL}/api/visitas/medallas/${session.id}`);
    const dataMedallas = await resMedallas.json();
    const medallas = (resMedallas.ok && dataMedallas.datos) ? dataMedallas.datos : [];

    const desbloqueadasCount = medallas.filter(m => m.desbloqueada).length;
    if (perfilMedallasVal) perfilMedallasVal.textContent = `${desbloqueadasCount} / ${medallas.length}`;

    renderGaleriaMedallas(medallas);

    // Resumen en widget de puntos
    if (medallasEl) {
      const ganadas = medallas.filter(m => m.desbloqueada);
      if (ganadas.length === 0) {
        medallasEl.innerHTML = '<span style="background:#fff; border:1px solid #d8dee8; padding:3px 8px; border-radius:12px; color:#5f6f7d;">Registrá tu primer destino para ganar una medalla</span>';
      } else {
        medallasEl.innerHTML = ganadas.map(m => `
          <span style="background:#FACC15; color:#17324a; font-weight:700; padding:4px 8px; border-radius:12px; display:inline-flex; align-items:center; gap:4px;">
            <img src="${m.icono_url}" style="width:14px; height:14px;" /> ${m.nombre}
          </span>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Error al cargar datos del perfil:', err);
  }
}

// Renderizar la vitrina visual de medallas
function renderGaleriaMedallas(medallas = []) {
  const galeria = document.querySelector('#galeria-medallas-grid');
  if (!galeria) return;

  if (medallas.length === 0) {
    galeria.innerHTML = '<p style="color:#64748b; font-size:13px; grid-column: 1/-1;">Iniciá sesión para ver el estado de tus medallas de explorador.</p>';
    return;
  }

  galeria.innerHTML = medallas.map(m => {
    const opacity = m.desbloqueada ? '1' : '0.45';
    const border = m.desbloqueada ? '2px solid #FACC15' : '1px dashed #cbd5e1';
    const bg = m.desbloqueada ? '#fffdf0' : '#f8fafc';
    const badge = m.desbloqueada
      ? '<span style="background:#10b981; color:#fff; font-size:9px; font-weight:800; padding:2px 8px; border-radius:999px;">DESBLOQUEADA</span>'
      : '<span style="background:#94a3b8; color:#fff; font-size:9px; font-weight:800; padding:2px 8px; border-radius:999px;">BLOQUEADA</span>';

    return `
      <div style="background:${bg}; border:${border}; border-radius:18px; padding:16px; opacity:${opacity}; display:flex; flex-direction:column; align-items:center; text-align:center; transition:transform 0.2s; box-shadow: ${m.desbloqueada ? '0 8px 16px rgba(245,158,11,0.15)' : 'none'};">
        <div style="width:80px; height:80px; margin-bottom:12px; display:flex; align-items:center; justify-content:center;">
          <img src="${m.icono_url}" alt="${m.nombre}" style="width:100%; height:100%; object-fit:contain; filter:${m.desbloqueada ? 'none' : 'grayscale(1)'};" />
        </div>
        <div style="margin-bottom:8px;">${badge}</div>
        <strong style="color:#17324a; font-size:14px; margin-bottom:4px; display:block;">${m.nombre}</strong>
        <p style="color:#64748b; font-size:11px; margin:0; line-height:1.4;">${m.descripcion}</p>
      </div>
    `;
  }).join('');
}

// CONEXIÓN DEL FORMULARIO DESTACADO DE IA EN EL HERO
const heroIaForm = document.querySelector('#hero-ia-form');
heroIaForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const dias = document.querySelector('#hero-ia-dias')?.value;
  const departamento = document.querySelector('#hero-ia-departamento')?.value;
  const intereses = document.querySelector('#hero-ia-intereses')?.value;

  // Llenar datos en el modal de rutas y abrirlo
  const iaDias = document.querySelector('#ia-dias');
  const iaDepto = document.querySelector('#ia-departamento');
  const iaIntereses = document.querySelector('#ia-intereses');
  if (iaDias) iaDias.value = dias;
  if (iaDepto) iaDepto.value = departamento;
  if (iaIntereses) iaIntereses.value = intereses;

  toggleRouteModal(true);
  // Disparar generación automática
  setTimeout(() => {
    document.querySelector('#ia-route-form')?.dispatchEvent(new Event('submit', { cancelable: true }));
  }, 100);
});
cargarVisitasUsuario();

// GENERACIÓN DE ITINERARIO CON IA (Gemini 3.5 en /api/itinerarios/generar)
const iaRouteForm = document.querySelector('#ia-route-form');
const btnGenerarIa = document.querySelector('#btn-generar-ia');
const iaResultado = document.querySelector('#ia-resultado');

iaRouteForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const dias = parseInt(document.querySelector('#ia-dias')?.value || '2', 10);
  const departamento = document.querySelector('#ia-departamento')?.value.trim();
  const intereses = document.querySelector('#ia-intereses')?.value.trim();

  if (btnGenerarIa) {
    btnGenerarIa.disabled = true;
    btnGenerarIa.textContent = '⏳ Creando itinerario inteligente con Gemini...';
  }
  if (iaResultado) {
    iaResultado.style.display = 'block';
    iaResultado.innerHTML = '<em>Consultando destinos en base de datos y organizando con IA...</em>';
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/itinerarios/generar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dias, departamento, intereses })
    });

    const data = await res.json();

    if (!res.ok || !data.exito) {
      iaResultado.innerHTML = `<span style="color:#EF4444;">❌ Error: ${data.mensaje || 'No se pudo generar el itinerario.'}</span>`;
      return;
    }

    const itin = data.itinerario;
    let html = `<h3 style="color:#17324a; margin-top:0;">🌟 ${itin.titulo || 'Tu Itinerario Personalizado'}</h3>`;
    html += `<p style="margin-bottom:12px;">${itin.resumen || ''}</p>`;

    if (Array.isArray(itin.dias)) {
      itin.dias.forEach(d => {
        html += `<div style="margin-bottom:10px; padding:8px; background:#f4f9f7; border-radius:8px;">`;
        html += `<strong>Día ${d.dia}: ${d.titulo_dia || ''}</strong>`;
        if (Array.isArray(d.actividades)) {
          html += `<ul style="margin:5px 0 5px 18px; padding:0;">`;
          d.actividades.forEach(act => {
            html += `<li><b>${act.horario || ''}</b> - ${act.lugar || ''}: ${act.descripcion || ''}</li>`;
          });
          html += `</ul>`;
        }
        if (d.recomendacion_gastronomica) {
          html += `<small style="color:#F97316;">🍽️ <i>Sabor local: ${d.recomendacion_gastronomica}</i></small>`;
        }
        html += `</div>`;
      });
    }

    if (Array.isArray(itin.consejos) && itin.consejos.length > 0) {
      html += `<p style="font-size:11px; color:#5f6f7d; margin-top:8px;">💡 <b>Consejo:</b> ${itin.consejos.join(' ')}</p>`;
    }

    // Botón para guardar itinerario si está logueado
    const session = getAuthSession();
    if (session && session.token) {
      html += `<button type="button" id="btn-guardar-itinerario" class="primary-btn" style="margin-top:10px; padding:8px 14px; font-size:11px; cursor:pointer;">💾 Guardar este Itinerario</button>`;
    }

    iaResultado.innerHTML = html;

    // Conectar botón de guardar
    document.querySelector('#btn-guardar-itinerario')?.addEventListener('click', async () => {
      try {
        const resGuardar = await fetch(`${API_BASE_URL}/api/itinerarios/guardar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`
          },
          body: JSON.stringify({
            titulo: itin.titulo || `Ruta de ${dias} días por Paraguay`,
            resumen: itin.resumen || '',
            departamento: departamento || null,
            dias: dias,
            detalle: itin
          })
        });
        const resGuardarData = await resGuardar.json();
        if (resGuardar.ok) {
          showToast('¡Itinerario guardado en tu cuenta!');
        } else {
          showToast(resGuardarData.mensaje || 'Error al guardar itinerario.');
        }
      } catch (err) {
        showToast('Error al guardar el itinerario.');
      }
    });

    showToast('¡Itinerario generado con éxito!');
  } catch (err) {
    console.error('Error generando itinerario:', err);
    iaResultado.innerHTML = '<span style="color:#EF4444;">Error al conectar con la API de IA.</span>';
  } finally {
    if (btnGenerarIa) {
      btnGenerarIa.disabled = false;
      btnGenerarIa.textContent = '✨ Generar con IA de ViajaPy';
    }
  }
});

// ASISTENTE DE CHAT CONECTADO A RUTAS / TRANSPORTE / IA
document.querySelectorAll('[data-chat]').forEach((button) => button.addEventListener('click', () => {
  const query = button.dataset.chat;
  addChatMessage(query);
  procesarChatIa(query);
}));

document.querySelector('#chatbot-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = chatbotInput.value.trim();
  if (!value) return;
  addChatMessage(value);
  chatbotInput.value = '';
  procesarChatIa(value);
});

async function procesarChatIa(pregunta) {
  addChatMessage('Analizando destinos y rutas...', 'bot-message');
  
  try {
    // Si consulta por transporte o cómo llegar
    const lower = pregunta.toLowerCase();
    if (lower.includes('terminal') || lower.includes('bus') || lower.includes('colectivo') || lower.includes('llegar') || lower.includes('distancia') || lower.includes('ruta')) {
      const resRutas = await fetch(`${API_BASE_URL}/api/transporte/rutas`);
      const rutasData = await resRutas.json();
      if (resRutas.ok && rutasData.datos && rutasData.datos.length > 0) {
        const r = rutasData.datos[0];
        setTimeout(() => {
          addChatMessage(`🚍 Info de viaje: Para conectar destinos podés tomar la ${r.ruta_nacional} (${r.origen} a ${r.destino}, aprox. ${r.tiempo_estimado}, ~${r.precio_estimado_gs.toLocaleString('es-PY')} Gs). Empresas sugeridas: ${r.empresas_sugeridas.join(', ')}.`, 'bot-message');
        }, 500);
        return;
      }
    }

    // Respuesta inteligente invocando itinerario / recomendaciones
    const res = await fetch(`${API_BASE_URL}/api/itinerarios/generar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dias: 2, intereses: pregunta })
    });
    const data = await res.json();

    if (res.ok && data.itinerario) {
      const itin = data.itinerario;
      const sugerencia = `✨ Te sugiero "${itin.titulo}": ${itin.resumen} (Consejo: ${itin.consejos ? itin.consejos[0] : 'Llevá tereré y ropa cómoda'}).`;
      setTimeout(() => addChatMessage(sugerencia, 'bot-message'), 400);
    } else {
      setTimeout(() => addChatMessage('¡Genial elección! En Paraguay te recomiendo visitar las Ruinas Jesuíticas en Itapúa o los Saltos del Monday en Alto Paraná.', 'bot-message'), 400);
    }
  } catch (e) {
    setTimeout(() => addChatMessage('¡Anotado! Podés explorar nuestra sección de Destinos para ver opciones de Naturaleza, Aventura y Cultura.', 'bot-message'), 400);
  }
}
