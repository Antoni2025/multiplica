// Estat i constants
let multiplicacions = [];
let actual = null;
let fallades = 0;
let tempsInici = null;

const PES_NO = 500;      // Columnes 1–5 (NO ASSOLIT)
const PES_NEUTRE = 30;    // Columnes 6–8 (NEUTRE)
const PES_ASSOLIT = 1;   // Columna 9 (ASSOLIT)


// Missatges possibles del professor enfadat
const missatgesBronca = [
  "No siguis babau, aquesta no la pots fallar!",
  "Aquesta no la pots fallar!",
  "No passa res, com diu en Batman, caiem per aixecar-nos... o era l'Spiderman?",
  "Ostres, tu... va no passa res!",
  "Cachis la mar salada!",
  "Va, tros de quòniam, tu pots",  
  "Renoi!",
  "Ets un babau integral!",
  "No pateixis, Einstein també suspenia les mates",  
  "Te voy a arrancar la puta cabeza!!!",
  "Vatua l'olla, quina llàstima"
];

// Pots posar aquí la URL d'una imatge lliure de drets
const imatgeBronca = "kepa.png"; // substitueix per la teva imatge


// Inicialització de dades a localStorage (sense data.json)
function initDades() {
  const guardat = localStorage.getItem('multiplicacions_v2');
  if (guardat) {
    multiplicacions = JSON.parse(guardat);
  } else {
    // Genera totes les combinacions 1..9 i posa-les a la columna 6 (NEUTRE)
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        multiplicacions.push({ a, b, columna: 6 });
      }
    }
    guardar();
  }
}

function initSessio() {
  fallades = 0;
  tempsInici = Date.now();
}

function guardar() {
  localStorage.setItem('multiplicacions_v2', JSON.stringify(multiplicacions));
}

// Utilitats de categoria i pesos
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

// Selecció aleatòria ponderada sense crear llistes grans
function seleccionarMultiplicacio() {
  const pesos = multiplicacions.map(m => pesPerColumna(m.columna));
  const total = pesos.reduce((s, p) => s + p, 0);
  let r = Math.random() * total;
  for (let i = 0; i < multiplicacions.length; i++) {
    r -= pesos[i];
    if (r <= 0) return multiplicacions[i];
  }
  return multiplicacions[multiplicacions.length - 1]; // fallback
}

function novaPregunta() {
  actual = seleccionarMultiplicacio();
  const el = document.getElementById('pregunta');
  el.textContent = `${actual.a} × ${actual.b} = ?`;
  document.getElementById('resposta').value = '';
  // Mantén el missatge anterior visible (no netegem 'resultat')
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
    // Missatge amb la resposta correcta
    document.getElementById('resultat').textContent =
      `❌ Incorrecte. La resposta correcta és ${correcte}`;
    actual.columna = 1;
    fallades++;

    // Mostra la bronca
    const broncaDiv = document.getElementById('bronca');
    const broncaImg = document.getElementById('bronca-img');
    const broncaText = document.getElementById('bronca-text');

    if (broncaDiv && broncaImg && broncaText) {
      broncaImg.src = imatgeBronca;
      broncaText.textContent = missatgesBronca[Math.floor(Math.random() * missatgesBronca.length)];
      broncaDiv.style.display = 'block';
    }
  }

  // Desa i refresca
  guardar();
  renderMatriu();

  // Si totes estan assolides (columna 9), mostra pantalla final
  if (multiplicacions.every(m => m.columna === 9)) {
    mostrarPantallaFinal();
  } else {
    // Passa a la següent immediatament, mantenint els missatges visibles
    novaPregunta();
  }
}

function iconaPerColumna(col) {
  const icones = {
    1: '😭', // plor desconsolat
    2: '😡', // molt enfadat
    3: '😠', // enfadat
    4: '😤', // bufant de ràbia
    5: '😒', // determinat / insatisfet
    6: '😐', // neutre
    7: '🙂', // mig somriure
    8: '😃', // content
    9: '🤩'  // eufòric
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
    colDiv.setAttribute('data-col', String(col));

    // Capçalera només amb l’emoji centrat
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

// Pantalla final tipus overlay (no destrueix la pàgina)
function mostrarPantallaFinal() {
  const tempsFinal = Date.now();
  const segonsTotals = Math.floor((tempsFinal - tempsInici) / 1000);
  const minuts = Math.floor(segonsTotals / 60);
  const segons = segonsTotals % 60;

  // Crea overlay si no existeix
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

    // Botó per reiniciar la partida
    const tornarBtn = document.getElementById('btn-tornar-jugar');
    tornarBtn.addEventListener('click', () => {
      localStorage.removeItem('multiplicacions_v2');
      location.reload();
    });
  } else {
    overlay.style.display = 'flex';
  }
}

// Esdeveniments
document.addEventListener('DOMContentLoaded', () => {
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
      localStorage.removeItem('multiplicacions_v2');
      multiplicacions = [];
      initDades();
      initSessio();
      renderMatriu();
      novaPregunta();
      // Neteja missatges visibles en reiniciar
      const broncaDiv = document.getElementById('bronca');
      if (broncaDiv) broncaDiv.style.display = 'none';
      const res = document.getElementById('resultat');
      if (res) res.textContent = '';
    }
  });
});
