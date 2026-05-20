let c;
 let brushImages = [];
let brushesListas = false;

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
  c.actualizar();
  c.dibujar();
 
  if (c.muerto) {
    noLoop();
    // opcional: mostrar mensaje
    // textAlign(CENTER);
    // text("C para reiniciar", width/2, height/2);
  }
}
 
function keyPressed() {
  if (key === 'c' || key === 'C') {
    background('#f0ece0');
    c = new Caminante();
    loop();
  }
  if (key === 'r' || key === 'R') {
    c.zona = 'top';
  }
  if (key === 'f' || key === 'F') {
    c.zona = 'bottom';
  }
}
 