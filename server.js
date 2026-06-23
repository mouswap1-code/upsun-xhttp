const http = require('http');
const https = require('https');

// === Configuration basée sur ton lien VLESS ===
const VPS_HOST = 'ultrategateworld.benbilal237free.xyz';  // Domaine du VPS
const VPS_PORT = 80;                                       // Port du VPS
const UUID = 'cf4cbdae-91f7-4e55-abbe-40ae5391d833';
const PORT = process.env.PORT  8080;

// Paramètres XHTTP (depuis ton lien)
const XHTTP_PATH = '/';
const XHTTP_MODE = 'auto';
const XHTTP_PADDING = '100-1000';
const HOST_HEADER = 'main-bvxea6i-jjxw6l5yj6f7q.fr-3.platformsh.site';
const SNI = 'main-bvxea6i-jjxw6l5yj6f7q.fr-3.platformsh.site';
const ALPN = ['h2', 'http/1.1', 'h3'];
const FP = 'chrome';

// Domaine Upsun pour générer le lien
const DOMAIN = process.env.DOMAIN  'main-bvxea6i-jjxw6l5yj6f7q.fr-3.platformsh.site';

console.log('==========================================');
console.log('🚀 Bridge XHTTP - Upsun → VPS');
console.log(📡 VPS cible: ${VPS_HOST}:${VPS_PORT});
console.log(🔑 UUID: ${UUID});
console.log(🌐 Domaine Upsun: ${DOMAIN});
console.log(⚙️  Host Header: ${HOST_HEADER});
console.log(🔒 SNI: ${SNI});
console.log(📦 ALPN: ${ALPN.join(', ')});
console.log(🖨️  Fingerprint: ${FP});
console.log('==========================================');

const server = http.createServer((req, res) => {
    const url = req.url;
    
    // === 1. Générer le lien VLESS (exactement comme ton lien) ===
    if (url === /${UUID}  url === '/config'  url === '/188.213.28.174') {
        // Construction du lien VLESS avec tous les paramètres
        const vlessLink = vless://${UUID}@${VPS_HOST}:${VPS_PORT}?type=xhttp&encryption=none&path=${encodeURIComponent(XHTTP_PATH)}&host=${HOST_HEADER}&mode=${XHTTP_MODE}&x_padding_bytes=${XHTTP_PADDING}&extra=%7B%22xPaddingBytes%22%3A%22${XHTTP_PADDING}%22%7D&security=tls&fp=${FP}&alpn=${ALPN.join('%2C')}&sni=${SNI}#XHTTP-Upsun-Bridge;
        
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(vlessLink + '\n');
        console.log(🔗 Lien VLESS généré (${req.url}));
        return;
    }
    
    // === 2. Proxy XHTTP vers le VPS ===
    const options = {
        hostname: VPS_HOST,
        port: VPS_PORT,
        path: url,
        method: req.method,
        headers: {
            ...req.headers,
            'host': HOST_HEADER,  // Important : utiliser le host du lien
            'user-agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'accept-encoding': 'gzip, deflate',
            'connection': 'keep-alive',
            'x-padding-bytes': XHTTP_PADDING
        },
        rejectUnauthorized: false
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
        console.log(✅ Proxy: ${req.method} ${url} → ${proxyRes.statusCode});
    });
    
    proxyReq.on('error', (err) => {
        console.error(❌ Erreur proxy VPS: ${err.message});
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end(Bad Gateway: Cannot reach VPS ${VPS_HOST}:${VPS_PORT}\n);
    });
    
    req.pipe(proxyReq);
});

// Démarrer le serveur
server.listen(PORT, '0.0.0.0', () => {
    console.log(✅ Bridge XHTTP actif sur le port ${PORT});
    console.log('');
    console.log(🔗 LIEN VLESS À PARTAGER :);
    console.log(   https://${DOMAIN}/${UUID});
    console.log(   ou https://${DOMAIN}/config);
    console.log(   ou https://${DOMAIN}/188.213.28.174);
    console.log('');
});

// Gestion des erreurs serveur
server.on('error', (err) => {
    console.error(❌ Erreur serveur: ${err.message});
});

process.on('SIGTERM', () => {
    console.log('🛑 Arrêt du serveur...');
    server.close(() => process.exit(0));
});
