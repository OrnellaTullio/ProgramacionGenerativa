let nuclei = [];
let walkers = [];

const COLS = 7;
const ROWS = 5;
const MIN_NUCLEI = 20;
const PROB_NUCLEO = 0.75; // probabilidad de que cada nodo se active

// Modos
let modoVelBoost = 1;
let modoCaos = false; // false = fluido, true = angular

const VEL_RAPIDA = 2.5;
const VEL_LENTA  = 0.25;

function setup() {
    createCanvas(700, 500);
    makeNuclei();
    init();
}

function draw() {
    let velBoost = 1;
    if (keyIsDown(86))      velBoost = VEL_RAPIDA; // V
    else if (keyIsDown(76)) velBoost = VEL_LENTA;  // L

    let all = true;
    for (let w of walkers) {
        if (!w.dead) {
            w.actualizar(velBoost);
            w.dibujar();
            all = false;
        }
    }
    if (all) noLoop();
}

function makeNuclei() {
    // Generar todos los candidatos
    let candidatos = [];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            candidatos.push({
                x: (c + 1) * width  / (COLS + 1),
                y: (r + 1) * height / (ROWS + 1)
            });
        }
    }

    // Shuffle para selección aleatoria justa
    candidatos = shuffle(candidatos);

    // Activar cada uno con probabilidad PROB_NUCLEO
    let activados = [];
    let resto = [];
    for (let n of candidatos) {
        if (random(1) < PROB_NUCLEO) {
            activados.push(n);
        } else {
            resto.push(n);
        }
    }

    // Garantizar mínimo MIN_NUCLEI
    while (activados.length < MIN_NUCLEI && resto.length > 0) {
        activados.push(resto.pop());
    }

    nuclei = activados;
}

function init() {
    background('#f5f2e8');
    walkers = [];
    spawnOleada();
    loop();
}

function spawnOleada() {
    for (let n of nuclei) {
        for (let i = 0; i < 3; i++) {
            let dir = (TWO_PI / 3) * i + random(TWO_PI / 3 * 0.4);
            walkers.push(new Caminante(n.x, n.y, dir));
        }
    }
}

function keyPressed() {
    // R: reiniciar lienzo y nuevos nuclei
    if (key === 'r' || key === 'R') {
        makeNuclei();
        init();
    }
    // O: oleada nueva sin borrar
    if (key === 'o' || key === 'O') {
        spawnOleada();
        loop();
    }
    // C: alternar modo caos
    if (key === 'c' || key === 'C') {
        modoCaos = !modoCaos;
    }
}
