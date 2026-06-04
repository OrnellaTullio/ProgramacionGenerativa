class Caminante {

    constructor() {
        this.zona = 'full';
        this.biasY = null; // null | 'top' | 'bottom'

        this.x = random(width * 0.2, width * 0.8);
        this.y = random(height * 0.2, height * 0.8);
        this.vel = 3 + random(2);
        this.velBase = this.vel;
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

        // fuerza de atracción al centro — suave pero suficiente para alejar de bordes
        this.fuerzaCentro = 0.04;

        this.brushImg = brushImages[int(random(brushImages.length))];
        this.stampW = 30;
        this.stampSep = 3;
        this.distAcum = 0;
        this.tiempoCambioBrush = int(random(30, 120));
    }

    zonaBounds() {
        if (this.zona === 'top')    return { yMin: 0,            yMax: height * 0.5 };
        if (this.zona === 'bottom') return { yMin: height * 0.5, yMax: height };
        return { yMin: 0, yMax: height };
    }

    actualizar(velBoost) {
        if (velBoost === undefined) velBoost = 1;

        this.px = this.x;
        this.py = this.y;

        this.vel = this.velBase * velBoost;

        this.tiempoCambioBrush--;
        if (this.tiempoCambioBrush <= 0) {
            this.brushImg = brushImages[int(random(brushImages.length))];
            this.tiempoCambioBrush = int(random(15, 60));
        }

        const b = this.zonaBounds();
        const margen = 2;

        // punto de atracción según bias
        const cx = width / 2;
        let cy;
        if (this.biasY === 'top')         cy = height * 0.25;
        else if (this.biasY === 'bottom') cy = height * 0.75;
        else                              cy = (b.yMin + b.yMax) / 2;

        let fuerzaActual = (this.biasY !== null) ? 0.06 : this.fuerzaCentro;

        if (this.estadoBorde === 'siguiendo') {
            this.x += this.vel * cos(this.dirBorde);
            this.y += this.vel * sin(this.dirBorde);
            this.dir = this.dirBorde;
            this.tiempoBorde--;

            this.x = constrain(this.x, margen, width - margen);
            this.y = constrain(this.y, b.yMin + margen, b.yMax - margen);

            if (this.tiempoBorde <= 0) {
                this.estadoBorde = null;
                // al salir del borde girar hacia el centro
                let angCentro = atan2(cy - this.y, cx - this.x);
                this.dir = lerpAngle(this.dir, angCentro, 0.5);
            }

        } else {
            // estados recta / curva — igual que el original
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

            // atracción al punto objetivo: peso crece con la distancia al centro
            let angCentro = atan2(cy - this.y, cx - this.x);
            let distCentro = dist(this.x, this.y, cx, cy);
            let maxDist = dist(0, 0, width / 2, (b.yMax - b.yMin) / 2);
            let peso = map(distCentro, 0, maxDist, 0, fuerzaActual);
            this.dir = lerpAngle(this.dir, angCentro, peso);

            // repulsión de bordes: suave, solo en la franja de 60px, máximo 0.12
            // — fija, no escala con la velocidad —
            let fr = 60;
            if (this.x < fr)              this.dir = lerpAngle(this.dir, 0,        map(this.x, 0, fr, 0.12, 0));
            if (this.x > width - fr)      this.dir = lerpAngle(this.dir, PI,       map(this.x, width - fr, width, 0, 0.12));
            if (this.y < b.yMin + fr)     this.dir = lerpAngle(this.dir, HALF_PI,  map(this.y, b.yMin, b.yMin + fr, 0.12, 0));
            if (this.y > b.yMax - fr)     this.dir = lerpAngle(this.dir, -HALF_PI, map(this.y, b.yMax - fr, b.yMax, 0, 0.12));

            this.x += this.vel * cos(this.dir);
            this.y += this.vel * sin(this.dir);

            // detección de borde — igual que el original
            let tocaBorde = false;
            if (this.x <= margen) {
                this.x = margen; tocaBorde = true;
                this.dirBorde = (sin(this.dir) < 0) ? -HALF_PI : HALF_PI;
            } else if (this.x >= width - margen) {
                this.x = width - margen; tocaBorde = true;
                this.dirBorde = (sin(this.dir) < 0) ? -HALF_PI : HALF_PI;
            } else if (this.y <= b.yMin + margen) {
                this.y = b.yMin + margen; tocaBorde = true;
                this.dirBorde = (cos(this.dir) < 0) ? PI : 0;
            } else if (this.y >= b.yMax - margen) {
                this.y = b.yMax - margen; tocaBorde = true;
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
