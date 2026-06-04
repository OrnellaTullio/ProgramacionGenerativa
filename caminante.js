class Caminante {
 
    constructor() {
        this.zona = 'full';
 
        // biasY: null = centro, 'top' = atracción hacia arriba, 'bottom' = hacia abajo
        this.biasY = null;
 
        this.x = random(width * 0.2, width * 0.8);
        this.y = random(height * 0.2, height * 0.8);
        this.velBase = 3 + random(2);
        this.vel = this.velBase;
        this.dir = random(TWO_PI);
 
        this.estado = 'recta';
        this.anguloGiro = radians(3) * (random(1) < 0.5 ? 1 : -1);
        this.cuentaRegresiva = int(random(10, 80));
 
        this.px = this.x;
        this.py = this.y;
 
        push();
        colorMode(HSB, 360, 100, 100);
        this.elColor = color(random(30), 15, 15);
        pop();
 
        this.alpha = random(140, 220);
        this.grosor = random(0.8, 2.8);
 
        this.vida = random(12000, 18000);
        this.recorrido = 0;
        this.muerto = false;
 
        this.estadoBorde = null;
        this.tiempoBorde = 0;
        this.dirBorde = 0;
 
        // fuerza de atracción al centro horizontal (x)
        this.fuerzaCentroX = 0.018;
        // fuerza de atracción vertical: se incrementa con biasY
        this.fuerzaCentroY = 0.018;
 
        // ── BRUSH STAMP ──────────────────────────────────────────────
        this.brushImg = brushImages[int(random(brushImages.length))];
        this.stampW   = 30;
        this.stampSep = 3;
        this.distAcum = 0;
        this.tiempoCambioBrush = int(random(30, 120));
    }
 
    // Devuelve el punto de atracción según biasY
    // Sin bias → centro de la pantalla
    // 'top'    → cuarto superior
    // 'bottom' → cuarto inferior
    puntoAtraccion() {
        let cx = width / 2;
        let cy;
        if (this.biasY === 'top')    cy = height * 0.18;
        else if (this.biasY === 'bottom') cy = height * 0.82;
        else                         cy = height / 2;
        return { cx, cy };
    }
 
    actualizar(velBoost = 1) {
 
        this.px = this.x;
        this.py = this.y;
 
        this.vel = this.velBase * velBoost;
 
        this.tiempoCambioBrush--;
        if (this.tiempoCambioBrush <= 0) {
            this.brushImg = brushImages[int(random(brushImages.length))];
            this.tiempoCambioBrush = int(random(15, 60));
        }
 
        const margen = 2;
        const { cx, cy } = this.puntoAtraccion();
 
        // Fuerza de atracción: más intensa cuando hay bias
        let fuerzaBase = (this.biasY !== null) ? 0.055 : 0.018;
 
        if (this.estadoBorde === 'siguiendo') {
            this.x += this.vel * cos(this.dirBorde);
            this.y += this.vel * sin(this.dirBorde);
            this.dir = this.dirBorde;
            this.tiempoBorde--;
 
            this.x = constrain(this.x, margen, width - margen);
            this.y = constrain(this.y, margen, height - margen);
 
            if (this.tiempoBorde <= 0) {
                this.estadoBorde = null;
                let angAtrac = atan2(cy - this.y, cx - this.x);
                this.dir = lerpAngle(this.dir, angAtrac, 0.35);
            }
 
        } else {
            // estados recta / curva
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
 
            // Atracción hacia el punto objetivo (suave, distancia-proporcional)
            let angAtrac  = atan2(cy - this.y, cx - this.x);
            let distAtrac = dist(this.x, this.y, cx, cy);
            let maxDist   = dist(0, 0, width / 2, height / 2);
            let peso      = map(distAtrac, 0, maxDist, 0, fuerzaBase);
            this.dir      = lerpAngle(this.dir, angAtrac, peso);
 
            this.x += this.vel * cos(this.dir);
            this.y += this.vel * sin(this.dir);
 
            // rebotar en los 4 bordes del canvas (sin restricción de zona)
            let tocaBorde = false;
            if (this.x <= margen) {
                this.x = margen;
                tocaBorde = true;
                this.dirBorde = (sin(this.dir) < 0) ? -HALF_PI : HALF_PI;
            } else if (this.x >= width - margen) {
                this.x = width - margen;
                tocaBorde = true;
                this.dirBorde = (sin(this.dir) < 0) ? -HALF_PI : HALF_PI;
            } else if (this.y <= margen) {
                this.y = margen;
                tocaBorde = true;
                this.dirBorde = (cos(this.dir) < 0) ? PI : 0;
            } else if (this.y >= height - margen) {
                this.y = height - margen;
                tocaBorde = true;
                this.dirBorde = (cos(this.dir) < 0) ? PI : 0;
            }
 
            if (tocaBorde) {
                this.estadoBorde = 'siguiendo';
                this.tiempoBorde = int(random(15, 50));
            }
        }
 
        let dx = this.x - this.px;
        let dy = this.y - this.py;
        let paso = sqrt(dx * dx + dy * dy);
        this.recorrido += paso;
        this.distAcum  += paso;
 
        if (this.recorrido >= this.vida) this.muerto = true;
    }
 
    dibujar() {
        if (this.distAcum < this.stampSep) return;
        this.distAcum = 0;
 
        let sw = this.stampW * this.grosor * random(0.9, 1.1);
        let sh = sw * (this.brushImg.height / this.brushImg.width);
 
        push();
        tint(255, this.alpha);
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
 
function lerpAngle(a, b, t) {
    let diff = b - a;
    while (diff > PI)  diff -= TWO_PI;
    while (diff < -PI) diff += TWO_PI;
    return a + diff * t;
}

}
 
// helper: interpolar ángulos por el camino más corto
function lerpAngle(a, b, t) {
    let diff = b - a;
    while (diff > PI)  diff -= TWO_PI;
    while (diff < -PI) diff += TWO_PI;
    return a + diff * t;
}
