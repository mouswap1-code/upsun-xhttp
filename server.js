const http = require('http');

// === CONFIGURATION ===
const VPS_HOST = '188.213.28.174';
const VPS_PORT = 80;
const UUID = 'f09a960a-4f1b-495f-9962-f1a14e5a7791';
const VPS_IP = '188.213.28.174';
const PORT = process.env.PORT || 8080;

const XHTTP_PATH = '/';
const XHTTP_MODE = 'auto';
const XHTTP_PADDING = '100-1000';
const HOST_HEADER = 'moust-x.benbilal237free.xyz';
const SNI = 'main-bvxea6i-drgozoylycqca.fr-3.platformsh.site';
const ALPN = ['h2', 'http/1.1', 'h3'];
const FP = 'chrome';

// === PARAMÈTRES XMUX (MULTIPLEXAGE) ===
const XMUX_SETTINGS = {
    maxConcurrency: "16-32",
    maxConnections: 0,
    cMaxReuseTimes: "1-5",
    hMaxRequestTimes: "600-900",
    hMaxReusableSecs: "1800-3000",
    hKeepAlivePeriod: 0
};

const DOMAIN = process.env.DOMAIN || 'main-bvxea6i-drgozoylycqca.fr-3.platformsh.site';

console.log('==========================================');
console.log('🚀 Bridge XHTTP - Upsun → VPS');
console.log(`📡 VPS cible: ${VPS_HOST}:${VPS_PORT}`);
console.log(`🔑 UUID: ${UUID}`);
console.log(`🌐 Domaine Upsun: ${DOMAIN}`);
console.log(`📦 XMUX: Activé (concurrency ${XMUX_SETTINGS.maxConcurrency})`);
console.log('==========================================');

const server = http.createServer((req, res) => {
    const url = req.url;
    const domain = req.headers.host || DOMAIN;

    // === ROUTE PRINCIPALE (message personnalisé) ===
    if (url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Serveur Opérationnel\nMode Multiplexé Actif.\n');
        console.log(`📄 Page d'accueil affichée`);
        return;
    }

    // === ROUTE /CONFIG (lien VLESS avec XMUX) ===
    if (url === '/config' || url === `/${UUID}` || url === `/${VPS_IP}`) {
        const extraObj = {
            mode: XHTTP_MODE,
            scMaxEachPostBytes: "1000000",
            xPaddingBytes: XHTTP_PADDING,
            xmux: XMUX_SETTINGS
        };
        const extraEncoded = encodeURIComponent(JSON.stringify(extraObj));
        
        const vlessLink = `vless://${UUID}@${VPS_HOST}:${VPS_PORT}?type=xhttp&encryption=none&path=${XHTTP_PATH}&host=${HOST_HEADER}&mode=${XHTTP_MODE}&x_padding_bytes=${XHTTP_PADDING}&extra=${extraEncoded}&fp=${FP}&alpn=${ALPN.join('%2C')}&sni=${SNI}#XHTTP-Upsun-Bridge`;
        
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(vlessLink + '\n');
        console.log(`🔗 Lien VLESS généré avec XMUX (${url})`);
        return;
    }

    // === PROXY XHTTP VERS LE VPS ===
    const options = {
        hostname: VPS_HOST,
        port: VPS_PORT,
        path: url,
        method: req.method,
        headers: {
            ...req.headers,
            'host': HOST_HEADER,
            'user-agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'accept-encoding': 'gzip, deflate',
            'connection': 'keep-alive',
            'x-padding-bytes': XHTTP_PADDING,
            'x-mux-concurrency': XMUX_SETTINGS.maxConcurrency,
            'x-mux-reuse': XMUX_SETTINGS.cMaxReuseTimes
        },
        rejectUnauthorized: false
    };

    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
        console.log(`✅ Proxy: ${req.method} ${url} → ${proxyRes.statusCode}`);
    });

    proxyReq.on('error', (err) => {
        console.error(`❌ Erreur proxy VPS: ${err.message}`);
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end(`Bad Gateway: Cannot reach VPS ${VPS_HOST}:${VPS_PORT}\n`);
    });

    req.pipe(proxyReq);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Bridge XHTTP actif sur le port ${PORT}`);
    console.log(`🔗 LIENS VLESS DISPONIBLES :`);
    console.log(`   https://${DOMAIN}/config`);
    console.log(`   https://${DOMAIN}/${UUID}`);
    console.log(`   https://${DOMAIN}/${VPS_IP}`);
    console.log('');
});

server.on('error', (err) => {
    console.error(`❌ Erreur serveur: ${err.message}`);
});

process.on('SIGTERM', () => {
    console.log('🛑 Arrêt du serveur...');
    server.close(() => process.exit(0));
});
