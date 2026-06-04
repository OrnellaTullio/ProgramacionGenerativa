let c;
let brushImages = [];
let brushesListas = false;

// Velocidad base y modificadores
let velBoost = 1;
const VEL_RAPIDA = 3;
const VEL_LENTA = 0.3;

function preload() {
  brushImages[0] = loadImage('brushes/1.png');
  brushImages[1] = loadImage('brushes/2.png');
  brushImages[2] = loadImage('brushes/3.png');
}

function setup() {
  createCanvas(700, 500);
  background('#f0ece0');
  brushesListas = true;
  c = new Caminante();
}

function draw() {
  // Modificar velocidad según teclas mantenidas
  if (keyIsDown(86)) {        // V = rápido
    velBoost = VEL_RAPIDA;
  } else if (keyIsDown(76)) { // L = lento
    velBoost = VEL_LENTA;
  } else {
    velBoost = 1;
  }

  c.actualizar(velBoost);
  c.dibujar();

  if (c.muerto) {
    noLoop();
  }
}

function keyPressed() {
  // C: reiniciar con nuevo caminante (comportamiento original)
  if (key === 'c' || key === 'C') {
    background('#f0ece0');
    c = new Caminante();
    loop();
  }

  // R: reiniciar lienzo
  if (key === 'r' || key === 'R') {
    background('#f0ece0');
    c = new Caminante();
    loop();
  }

  // A: zona superior (se mantiene)
  if (key === 'a' || key === 'A') {
    c.zona = 'top';
    // Empujar al caminante hacia la zona superior si está fuera
    if (c.y > height * 0.5) {
      c.y = random(height * 0.1, height * 0.4);
    }
  }

  // I: zona inferior (se mantiene)
  if (key === 'i' || key === 'I') {
    c.zona = 'bottom';
    // Empujar al caminante hacia la zona inferior si está fuera
    if (c.y < height * 0.5) {
      c.y = random(height * 0.6, height * 0.9);
    }
  }
} 
