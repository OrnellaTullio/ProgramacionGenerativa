let c;
let brushImages = [];
let brushesListas = false;
 
const VEL_RAPIDA = 3;
const VEL_LENTA  = 0.3;
 
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
  let velBoost = 1;
  if (keyIsDown(86))      velBoost = VEL_RAPIDA; // V
  else if (keyIsDown(76)) velBoost = VEL_LENTA;  // L
 
  c.actualizar(velBoost);
  c.dibujar();
 
  if (c.muerto) noLoop();
}
 
function keyPressed() {
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
 
  // A: inclinar atracción hacia arriba
  if (key === 'a' || key === 'A') {
    c.biasY = 'top';
  }
 
  // I: inclinar atracción hacia abajo
  if (key === 'i' || key === 'I') {
    c.biasY = 'bottom';
  }
}
