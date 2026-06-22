const http = require('http');
const https = require('https');

const VPS_HOST = '188.213.28.174';
const VPS_PORT = 80;
const UUID = 'f09a960a-4f1b-495f-9962-f1a14e5a7791';
const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
    const url = req.url;
    
    if (url === `/${UUID}`) {
        const domain = process.env.DOMAIN || 'main-xxxxx.fr-3.platformsh.site';
        const vless = `vless://${UUID}@${domain}:443?type=xhttp&encryption=none&path=/xhttp&host=${domain}&mode=packet-up&security=tls#XHTTP-Upsun`;
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(vless + '\n');
        return;
    }
    
    const options = {
        hostname: VPS_HOST,
        port: VPS_PORT,
        path: req.url,
        method: req.method,
        headers: req.headers
    };
    
    const proxy = https.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });
    
    proxy.on('error', () => {
        res.writeHead(502);
        res.end('Bad Gateway');
    });
    
    req.pipe(proxy);
});

server.listen(PORT, () => {
    console.log(`Bridge XHTTP actif sur le port ${PORT}`);
});
