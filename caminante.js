class Caminante {
 
    constructor() {
        this.zona = 'full';
 
        this.x = random(width * 0.2, width * 0.8);
        this.y = random(height * 0.2, height * 0.8);
        this.vel = 3 + random(2);
        this.dir = random(TWO_PI);
 
        this.estado = 'recta';
        // ángulo original: radians(3) ≈ 0.052
        this.anguloGiro = radians(3) * (random(1) < 0.5 ? 1 : -1);
        this.cuentaRegresiva = int(random(10, 80));
 
        this.px = this.x;
        this.py = this.y;
 
        push();
        colorMode(HSB, 360, 100, 100);
        this.elColor = color(random(30), 15, 15); // negro con leve tono cálido
        pop();
 
        this.alpha = random(140, 220);
        this.grosor = random(0.8, 2.8);
 
        this.vida = random(12000, 18000);
        this.recorrido = 0;
        this.muerto = false;
 
        // estado del borde: null = libre, 'siguiendo' = pegado al borde
        this.estadoBorde = null;
        this.tiempoBorde = 0;         // cuántos frames queda siguiendo el borde
        this.dirBorde = 0;            // dirección paralela al borde mientras lo sigue
 
        // fuerza de atracción al centro (suave)
        this.fuerzaCentro = 0.018;
// ── BRUSH STAMP ──────────────────────────────────────────────
        // Elegir una imagen al azar del array global brushImages
        this.brushImg = brushImages[int(random(brushImages.length))];
 
        // Ancho base del stamp en px. El alto se calcula por proporción de la imagen.
        // Ajustá este valor para cambiar el tamaño general de los brushes.
        this.stampW = 30;
 
        // Separación entre stamps: menor = trazo más denso y continuo.
        // Si ves huecos subí este valor, si se superpone mucho bajalo.
        this.stampSep = 3;
        this.distAcum = 0;

this.tiempoCambioBrush = int(random(30, 120));

    }
 
    zonaBounds() {
        if (this.zona === 'top')    return { yMin: 0,          yMax: height * 0.5 };
        if (this.zona === 'bottom') return { yMin: height * 0.5, yMax: height };
        return { yMin: 0, yMax: height };
    }
 
    actualizar() {

        this.px = this.x;
        this.py = this.y;
 
        this.tiempoCambioBrush--;
if (this.tiempoCambioBrush <= 0) {
    this.brushImg = brushImages[int(random(brushImages.length))];
    this.tiempoCambioBrush = int(random(15, 60));
}
        const b = this.zonaBounds();
        const cx = width / 2;
        const cy = (b.yMin + b.yMax) / 2;
        const margen = 2;
 
        if (this.estadoBorde === 'siguiendo') {
            // moverse en dirección paralela al borde
            this.x += this.vel * cos(this.dirBorde);
            this.y += this.vel * sin(this.dirBorde);
            this.dir = this.dirBorde;
            this.tiempoBorde--;
 
            // clampear para no salirse
            this.x = constrain(this.x, margen, width - margen);
            this.y = constrain(this.y, b.yMin + margen, b.yMax - margen);
 
            if (this.tiempoBorde <= 0) {
                this.estadoBorde = null;
                // al salir del borde, orientar levemente hacia el centro
                let angCentro = atan2(cy - this.y, cx - this.x);
                this.dir = lerpAngle(this.dir, angCentro, 0.35);
            }
 
        } else {
            // movimiento normal con estados recta/curva
            if (this.estado === 'recta') {
                this.cuentaRegresiva--;
                if (this.cuentaRegresiva <= 0) {
                    this.estado = 'curva';
                    this.anguloGiro = radians(3) * (random(1) < 0.5 ? 1 : -1);
                    this.reiniciarTiempo();
                }
            } else {
                this.dir += this.anguloGiro;
                this.cuentaRegresiva--;
                if (this.cuentaRegresiva <= 0) {
                    this.estado = 'recta';
                    this.reiniciarTiempo();
                }
            }
 
            // atracción suave al centro: nudge de dirección
            let angCentro = atan2(cy - this.y, cx - this.x);
            // distancia normalizada al centro
            let distCentro = dist(this.x, this.y, cx, cy);
            let maxDist = dist(0, 0, width / 2, (b.yMax - b.yMin) / 2);
            let peso = map(distCentro, 0, maxDist, 0, this.fuerzaCentro);
            this.dir = lerpAngle(this.dir, angCentro, peso);
 
            this.x += this.vel * cos(this.dir);
            this.y += this.vel * sin(this.dir);
 
            // detectar colisión con borde → activar seguimiento
            let tocaBorde = false;
            if (this.x <= margen) {
                this.x = margen;
                tocaBorde = true;
                // dirección paralela al borde vertical: arriba o abajo según hacia dónde iba
                this.dirBorde = (sin(this.dir) < 0) ? -HALF_PI : HALF_PI;
            } else if (this.x >= width - margen) {
                this.x = width - margen;
                tocaBorde = true;
                this.dirBorde = (sin(this.dir) < 0) ? -HALF_PI : HALF_PI;
            } else if (this.y <= b.yMin + margen) {
                this.y = b.yMin + margen;
                tocaBorde = true;
                // dirección paralela al borde horizontal
                this.dirBorde = (cos(this.dir) < 0) ? PI : 0;
            } else if (this.y >= b.yMax - margen) {
                this.y = b.yMax - margen;
                tocaBorde = true;
                this.dirBorde = (cos(this.dir) < 0) ? PI : 0;
            }
 
            if (tocaBorde) {
                this.estadoBorde = 'siguiendo';
                this.tiempoBorde = int(random(15, 50)); // frames siguiendo el borde
            }
        }
 
        // acumular recorrido
        let dx = this.x - this.px;
        let dy = this.y - this.py;
        let paso = sqrt(dx * dx + dy * dy);
        this.recorrido += paso;
        this.distAcum  += paso;
 
        if (this.recorrido >= this.vida) this.muerto = true;
    }
 
    dibujar() {
       // Solo sellar cuando se acumuló suficiente distancia
      
        if (this.distAcum < this.stampSep) return;
        this.distAcum = 0;
 
        // Tamaño del stamp: varía levemente con la velocidad
        let avgVel    = this.vel;
        let sw        = this.stampW * this.grosor * random(0.9, 1.1);
        let sh        = sw * (this.brushImg.height / this.brushImg.width);
 
        push();
        tint(255, this.alpha);     // controlar opacidad del stamp
        translate(this.x, this.y);
        rotate(this.dir);
        imageMode(CENTER);
        image(this.brushImg, 0, 0, sw, sh);
        pop();
    }
 
    reiniciarTiempo() {
        this.cuentaRegresiva = int(random(10, 80));
    }
}
 
// helper: interpolar ángulos por el camino más corto
function lerpAngle(a, b, t) {
    let diff = b - a;
    while (diff > PI)  diff -= TWO_PI;
    while (diff < -PI) diff += TWO_PI;
    return a + diff * t;
}