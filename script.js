// Estat i constants
let multiplicacions = [];
let actual = null;
let fallades = 0;
let tempsInici = null;

const CLAU_TAULA_MAX = 'taula_maxima';
const CLAU_DADES = 'multiplicacions_v2';

const PES_NO = 500;      // Columnes 1–5 (NO ASSOLIT)
const PES_NEUTRE = 30;   // Columnes 6–8 (NEUTRE)
const PES_ASSOLIT = 1;   // Columna 9 (ASSOLIT)

// Missatges possibles del professor enfadat
const missatgesBronca = [
  "Molt malament, pesolet!",
  "Ui ui ui, que no anem bé, pesolet!",
  "No passa res, com diu en Batman, caiem per aixecar-nos... o era l'Spiderman?",
  "Ai ai ai... una mica més de concentració!",
  "Pesolet, això no ho pots fallar",
  "Em posaré les ulleres de veure nens que no saben multiplicar!",
  "Pesolet!",
  "Pesolet, això no m'ho esperava de tu",
  "Pesolet, aquesta ha fet plorar al nen Jesús",
  "No m'ho puc creure... aquest no és el meu pesolet",
  "Vatua l'olla, quina llàstima"
];

const imatgeBronca = "mariateresa.png";


// -----------------------------
// TAULA MÀXIMA
// -----------------------------

function demanarTaulaMaxima() {
  let max = prompt("Fins a quina taula vols practicar? (1–9)");
  if (!max) return;

  max = parseInt(max, 10);
  if (isNaN(max) || max < 1 || max > 9) {
    alert("Valor incorrecte. Introdueix un número entre 1 i 9.");
    return demanarTaulaMaxima();
  }

  localStorage.setItem(CLAU_TAULA_MAX, String(max));
  aplicarFiltreTaulaMaxima();
  guardar();
  renderMatriu();
  novaPregunta();
}

function aplicarFiltreTaulaMaxima() {
  const max = parseInt(localStorage.getItem(CLAU_TAULA_MAX) || "9", 10);

  // Filtra les existents
  multiplicacions = multiplicacions.filter(m => m.b <= max);

  // Regenera les que faltin
  const existents = new Set(multiplicacions.map(m => `${m.a}-${m.b}`));

  for (let a = 1; a <= 9; a++) {
    for (let b = 1; b <= max; b++) {
      const id = `${a}-${b}`;
      if (!existents.has(id)) {
        multiplicacions.push({ a, b, columna: 6 });
      }
    }
  }
}


// -----------------------------
// INICIALITZACIÓ
// -----------------------------

function initDades() {
  const guardat = localStorage.getItem(CLAU_DADES);
  if (guardat) {
    multiplicacions = JSON.parse(guardat);
  } else {
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        multiplicacions.push({ a, b, columna: 6 });
      }
    }
  }

  aplicarFiltreTaulaMaxima();
  guardar();
}

function initSessio() {
  fallades = 0;
  tempsInici = Date.now();
}

function guardar() {
  localStorage.setItem(CLAU_DADES, JSON.stringify(multiplicacions));
}


// -----------------------------
// UTILITATS
// -----------------------------

function categoriaPerColumna(col) {
  if (col <= 5) return 'NO ASSOLIT';
  if (col <= 8) return 'NEUTRE';
  return 'ASSOLIT';
}

function pesPerColumna(col) {
  if (col <= 5) return PES_NO;
  if (col <= 8) return PES_NEUTRE;
  return PES_ASSOLIT;
}

function seleccionarMultiplicacio() {
  const pesos = multiplicacions.map(m => pesPerColumna(m.columna));
  const total = pesos.reduce((s, p) => s + p, 0);
  let r = Math.random() * total;

  for (let i = 0; i < multiplicacions.length; i++) {
    r -= pesos[i];
    if (r <= 0) return multiplicacions[i];
  }
  return multiplicacions[multiplicacions.length - 1];
}


// -----------------------------
// FLUX PRINCIPAL
// -----------------------------

function novaPregunta() {
  actual = seleccionarMultiplicacio();
  document.getElementById('pregunta').textContent = `${actual.a} × ${actual.b} = ?`;
  document.getElementById('resposta').value = '';
  document.getElementById('resposta').focus();
}

function comprovar() {
  const input = document.getElementById('resposta');
  const valor = input.value.trim();

  if (valor === '') {
    document.getElementById('resultat').textContent = 'Escriu una resposta.';
    input.focus();
    return;
  }

  const resposta = parseInt(valor, 10);
  const correcte = actual.a * actual.b;

  if (resposta === correcte) {
    document.getElementById('resultat').textContent = '✅ Correcte!';
    document.getElementById('bronca').style.display = 'none';
    actual.columna = Math.min(9, (actual.columna || 6) + 1);
  } else {
    document.getElementById('resultat').textContent =
      `❌ Incorrecte. La resposta correcta és ${correcte}`;
    actual.columna = 1;
    fallades++;

    const broncaDiv = document.getElementById('bronca');
    broncaDiv.style.display = 'block';
    document.getElementById('bronca-img').src = imatgeBronca;
    document.getElementById('bronca-text').textContent =
      missatgesBronca[Math.floor(Math.random() * missatgesBronca.length)];
  }

  guardar();
  renderMatriu();

  if (multiplicacions.every(m => m.columna === 9)) {
    mostrarPantallaFinal();
  } else {
    novaPregunta();
  }
}


// -----------------------------
// MATRIU DE PROGRÉS
// -----------------------------

function iconaPerColumna(col) {
  const icones = {
    1: '😭',
    2: '😡',
    3: '😠',
    4: '😤',
    5: '😒',
    6: '😐',
    7: '🙂',
    8: '😃',
    9: '🤩'
  };
  return icones[col] || '❓';
}

function renderMatriu() {
  const contenidor = document.getElementById('matriu');
  contenidor.innerHTML = '';

  for (let col = 1; col <= 9; col++) {
    const cat = categoriaPerColumna(col);
    const colDiv = document.createElement('div');
    colDiv.className = `col ${cat === 'NO ASSOLIT' ? 'col-no' : cat === 'NEUTRE' ? 'col-neutre' : 'col-assolit'}`;

    const cap = document.createElement('div');
    cap.className = 'col-cap';
    cap.innerHTML = `<div class="col-icona">${iconaPerColumna(col)}</div>`;
    colDiv.appendChild(cap);

    const llista = document.createElement('div');
    llista.className = 'col-contingut';

    multiplicacions
      .filter(m => m.columna === col)
      .forEach(m => {
        const span = document.createElement('span');
        span.className = 'badge item';
        span.textContent = `${m.a}×${m.b}`;
        llista.appendChild(span);
      });

    colDiv.appendChild(llista);
    contenidor.appendChild(colDiv);
  }
}


// -----------------------------
// PANTALLA FINAL
// -----------------------------

function mostrarPantallaFinal() {
  const tempsFinal = Date.now();
  const segonsTotals = Math.floor((tempsFinal - tempsInici) / 1000);
  const minuts = Math.floor(segonsTotals / 60);
  const segons = segonsTotals % 60;

  let overlay = document.getElementById('final-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'final-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.6)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';

    const box = document.createElement('div');
    box.style.background = '#fff';
    box.style.borderRadius = '12px';
    box.style.padding = '32px';
    box.style.maxWidth = '420px';
    box.style.width = '90%';
    box.style.textAlign = 'center';
    box.style.boxShadow = '0 10px 30px rgba(0,0,0,0.25)';

    box.innerHTML = `
      <h1 style="margin:0 0 12px; font-size:24px;">🎉 Enhorabona! Joc completat</h1>
      <p style="margin:6px 0; font-size:16px;">Temps emprat: <strong>${minuts} min ${segons} s</strong></p>
      <p style="margin:6px 0 20px; font-size:16px;">Nombre de fallades: <strong>${fallades}</strong></p>
      <button id="btn-tornar-jugar"
        style="background:#1e90ff; color:#fff; border:none; padding:10px 16px; border-radius:8px; cursor:pointer; font-size:15px;">
        Tornar a jugar
      </button>
    `;
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    document.getElementById('btn-tornar-jugar').addEventListener('click', () => {
      localStorage.removeItem(CLAU_DADES);
      location.reload();
    });
  } else {
    overlay.style.display = 'flex';
  }
}


// -----------------------------
// ESDEVENIMENTS
// -----------------------------

document.addEventListener('DOMContentLoaded', () => {

  if (!localStorage.getItem(CLAU_TAULA_MAX)) {
    demanarTaulaMaxima();
  }

  initDades();
  initSessio();
  renderMatriu();
  novaPregunta();

  document.getElementById('comprovar').addEventListener('click', comprovar);

  document.getElementById('resposta').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') comprovar();
  });

  document.getElementById('reiniciar').addEventListener('click', () => {
    if (confirm('Segur que vols reiniciar el progrés?')) {
      localStorage.removeItem(CLAU_DADES);
      multiplicacions = [];
      initDades();
      initSessio();
      renderMatriu();
      novaPregunta();
      document.getElementById('bronca').style.display = 'none';
      document.getElementById('resultat').textContent = '';
    }
  });

  document.getElementById('canviar-taula').addEventListener('click', demanarTaulaMaxima);
});
