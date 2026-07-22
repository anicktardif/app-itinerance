/**
 * Mockup — Spots pour dormir (Québec)
 * Données fictives pour démonstration
 */

const STATUS = {
  green: { label: 'Toléré', icon: '✓', badge: 'Toléré' },
  yellow: { label: 'Surveillé', icon: '!', badge: 'Surveillé' },
  red: { label: 'À éviter', icon: '✕', badge: 'À éviter' },
};

const ACTION_LABELS = {
  going: "J'y vais",
  watched: 'Surveillé',
  tolerated: 'Toléré',
};

const SPOTS = [
  {
    id: 'francophonie',
    name: 'Parc de la Francophonie',
    area: 'Saint-Roch',
    lat: 46.8148,
    lng: -71.2285,
    status: 'green',
    summary: 'Calme en semaine. Quelques personnes la nuit, rarement dérangées.',
    comments: [
      { author: 'Sam', time: 'Il y a 2 h', text: 'Toléré, personne ce soir.', tag: 'tolerated' },
      { author: 'Anonyme', time: 'Hier', text: 'Propre, éclairage faible mais OK.', tag: null },
    ],
  },
  {
    id: 'vieux-port',
    name: 'Abords du Vieux-Port',
    area: 'La Cité-Limoilou',
    lat: 46.8095,
    lng: -71.2025,
    status: 'yellow',
    summary: 'Patrouilles possibles le week-end. Vérifier avant de s\'installer.',
    comments: [
      { author: 'Jo', time: 'Il y a 45 min', text: 'Patrouille en chariot vers 22 h.', tag: 'watched' },
      { author: 'Anonyme', time: 'Il y a 3 h', text: 'J\'y vais pour la nuit.', tag: 'going' },
    ],
  },
  {
    id: 'bassin-louise',
    name: 'Stationnement Bassin Louise',
    area: 'Saint-Roch',
    lat: 46.8172,
    lng: -71.2198,
    status: 'red',
    summary: 'Signalements récents de déplacements forcés. À éviter pour le moment.',
    comments: [
      { author: 'Anonyme', time: 'Il y a 1 h', text: 'Intervention ce matin, pas toléré.', tag: 'watched' },
      { author: 'Marie', time: 'Il y a 5 h', text: 'Sécurité appelée hier soir.', tag: 'watched' },
    ],
  },
  {
    id: 'dyouville',
    name: 'Place D\'Youville',
    area: 'La Cité-Limoilou',
    lat: 46.8129,
    lng: -71.2142,
    status: 'green',
    summary: 'Endroit connu, généralement toléré en semaine.',
    comments: [
      { author: 'Anonyme', time: 'Il y a 4 h', text: 'Tranquille, plusieurs personnes.', tag: 'tolerated' },
    ],
  },
  {
    id: 'cap-rouge',
    name: 'Sentier Cap-Rouge',
    area: 'Cap-Rouge',
    lat: 46.7512,
    lng: -71.3385,
    status: 'yellow',
    summary: 'Isolé. Toléré parfois, mais peu d\'éclairage.',
    comments: [
      { author: 'Alex', time: 'Il y a 6 h', text: 'Surveillé par des résidents parfois.', tag: 'watched' },
    ],
  },
  {
    id: 'victoria',
    name: 'Parc Victoria',
    area: 'Saint-Sauveur',
    lat: 46.8048,
    lng: -71.2435,
    status: 'green',
    summary: 'Bancs abrités. Retours positifs cette semaine.',
    comments: [
      { author: 'Anonyme', time: 'Il y a 30 min', text: 'Toléré ce soir.', tag: 'tolerated' },
      { author: 'Pat', time: 'Avant-hier', text: 'Calme, pas de patrouille.', tag: null },
    ],
  },
  {
    id: 'saint-joseph',
    name: 'Rue Saint-Joseph (centre)',
    area: 'La Cité-Limoilou',
    lat: 46.8135,
    lng: -71.2268,
    status: 'red',
    summary: 'Plusieurs avis négatifs récents. Risque élevé d\'intervention.',
    comments: [
      { author: 'Anonyme', time: 'Il y a 20 min', text: 'Déplacement ce soir, éviter.', tag: 'watched' },
    ],
  },
];

let map;
let markers = {};
let activeSpotId = null;

const els = {
  mapView: document.getElementById('map-view'),
  listView: document.getElementById('list-view'),
  spotList: document.getElementById('spot-list'),
  viewBtns: document.querySelectorAll('.view-toggle__btn'),
  sheet: document.getElementById('spot-sheet'),
  sheetClose: document.getElementById('spot-sheet-close'),
  sheetTitle: document.getElementById('spot-sheet-title'),
  sheetArea: document.getElementById('spot-sheet-area'),
  sheetSummary: document.getElementById('spot-sheet-summary'),
  sheetStatus: document.getElementById('spot-sheet-status'),
  commentsList: document.getElementById('comments-list'),
  commentName: document.getElementById('comment-name'),
  commentText: document.getElementById('comment-text'),
  commentSubmit: document.getElementById('comment-submit'),
  quickFeedback: document.getElementById('quick-feedback'),
  quickBtns: document.querySelectorAll('.quick-btn'),
};

function statusMeta(status) {
  return STATUS[status] || STATUS.yellow;
}

function createMarkerIcon(status) {
  const meta = statusMeta(status);
  return L.divIcon({
    className: '',
    html: `<div class="spot-marker spot-marker--${status}" role="img" aria-label="${meta.label}"><span class="spot-marker__inner">${meta.icon}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

function initMap() {
  map = L.map('map', {
    zoomControl: true,
    scrollWheelZoom: true,
  }).setView([46.8139, -71.225], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map);

  SPOTS.forEach((spot) => {
    const marker = L.marker([spot.lat, spot.lng], {
      icon: createMarkerIcon(spot.status),
      title: spot.name,
    }).addTo(map);

    marker.on('click', () => openSpot(spot.id));
    markers[spot.id] = marker;
  });
}

function renderSpotList() {
  els.spotList.innerHTML = SPOTS.map((spot) => {
    const meta = statusMeta(spot.status);
    return `
      <li>
        <button type="button" class="spot-card" data-spot-id="${spot.id}" aria-label="${spot.name}, ${meta.label}">
          <span class="spot-card__badge spot-card__badge--${spot.status}" aria-hidden="true">${meta.icon}</span>
          <span>
            <p class="spot-card__name">${spot.name}</p>
            <p class="spot-card__meta">${spot.area}</p>
          </span>
          <span class="spot-card__status-label spot-card__status-label--${spot.status}">${meta.badge}</span>
        </button>
      </li>
    `;
  }).join('');

  els.spotList.querySelectorAll('.spot-card').forEach((btn) => {
    btn.addEventListener('click', () => openSpot(btn.dataset.spotId));
  });
}

function renderComments(spot) {
  if (!spot.comments.length) {
    els.commentsList.innerHTML = '<li><p class="comment__text">Aucun commentaire pour le moment.</p></li>';
    return;
  }

  els.commentsList.innerHTML = spot.comments.map((c) => {
    const tagHtml = c.tag
      ? `<span class="comment__tag comment__tag--${c.tag}">${ACTION_LABELS[c.tag]}</span>`
      : '';
    return `
      <li class="comment">
        <div class="comment__head">
          <span class="comment__author">${escapeHtml(c.author)}</span>
          <span class="comment__time">${escapeHtml(c.time)}</span>
        </div>
        <p class="comment__text">${escapeHtml(c.text)}</p>
        ${tagHtml}
      </li>
    `;
  }).join('');
}

function openSpot(id) {
  const spot = SPOTS.find((s) => s.id === id);
  if (!spot) return;

  activeSpotId = id;
  const meta = statusMeta(spot.status);

  els.sheetTitle.textContent = spot.name;
  els.sheetArea.textContent = spot.area;
  els.sheetSummary.textContent = spot.summary;
  els.sheetStatus.className = `spot-sheet__status spot-sheet__status--${spot.status}`;
  els.sheetStatus.innerHTML = `<span aria-hidden="true">${meta.icon}</span> ${meta.label} <span style="font-weight:400;font-size:0.85em">(récent)</span>`;
  els.quickFeedback.textContent = '';
  els.commentName.value = '';
  els.commentText.value = '';

  renderComments(spot);
  els.sheet.showModal();

  if (map && markers[id]) {
    map.setView([spot.lat, spot.lng], 14, { animate: true });
    markers[id].openPopup();
  }
}

function closeSheet() {
  els.sheet.close();
  activeSpotId = null;
}

function switchView(view) {
  const isMap = view === 'map';
  els.mapView.classList.toggle('view--active', isMap);
  els.mapView.hidden = !isMap;
  els.listView.classList.toggle('view--active', !isMap);
  els.listView.hidden = isMap;

  els.viewBtns.forEach((btn) => {
    const active = btn.dataset.view === view;
    btn.classList.toggle('view-toggle__btn--active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  if (isMap && map) {
    setTimeout(() => map.invalidateSize(), 100);
  }
}

function addQuickAction(action) {
  if (!activeSpotId) return;
  const spot = SPOTS.find((s) => s.id === activeSpotId);
  if (!spot) return;

  const comment = {
    author: 'Anonyme',
    time: 'À l\'instant',
    text: ACTION_LABELS[action],
    tag: action,
  };

  spot.comments.unshift(comment);

  if (action === 'tolerated') spot.status = 'green';
  else if (action === 'watched') spot.status = 'yellow';
  else if (action === 'going') spot.status = spot.status === 'red' ? 'yellow' : spot.status;

  updateSpotUI(spot);
  renderComments(spot);
  els.quickFeedback.textContent = `Merci — « ${ACTION_LABELS[action]} » est enregistré.`;
}

function addComment() {
  if (!activeSpotId) return;
  const spot = SPOTS.find((s) => s.id === activeSpotId);
  if (!spot) return;

  const text = els.commentText.value.trim();
  if (!text) {
    els.commentText.focus();
    return;
  }

  const name = els.commentName.value.trim() || 'Anonyme';
  spot.comments.unshift({
    author: name,
    time: 'À l\'instant',
    text,
    tag: null,
  });

  els.commentText.value = '';
  renderComments(spot);
  els.quickFeedback.textContent = 'Commentaire ajouté.';
}

function updateSpotUI(spot) {
  const meta = statusMeta(spot.status);
  els.sheetStatus.className = `spot-sheet__status spot-sheet__status--${spot.status}`;
  els.sheetStatus.innerHTML = `<span aria-hidden="true">${meta.icon}</span> ${meta.label} <span style="font-weight:400;font-size:0.85em">(récent)</span>`;

  if (markers[spot.id]) {
    markers[spot.id].setIcon(createMarkerIcon(spot.status));
  }

  renderSpotList();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function bindEvents() {
  els.viewBtns.forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  els.sheetClose.addEventListener('click', closeSheet);
  els.sheet.addEventListener('click', (e) => {
    if (e.target === els.sheet) closeSheet();
  });
  els.sheet.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeSheet();
  });

  els.quickBtns.forEach((btn) => {
    btn.addEventListener('click', () => addQuickAction(btn.dataset.action));
  });

  els.commentSubmit.addEventListener('click', addComment);
}

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  renderSpotList();
  bindEvents();
});
