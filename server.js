const http = require('http');
const https = require('https');

const VPS_HOST = '188.213.28.174';
const VPS_PORT = 80;
const UUID = 'cf4cbdae-91f7-4e55-abbe-40ae5391d833';
const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
    const url = req.url;
    
    if (url === `/${UUID}`) {
        const domain = process.env.DOMAIN || 'main-bvxea6i-jjxw6l5yj6f7q.fr-3.platformsh.site';
        const vless = `vless://${UUID}@${domain}:443?type=xhttp&encryption=none&path=/xhttp&host=${domain}&mode=packet-up&security=tls#XHTTP-Upsun`;
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(vless + '\n');
        return;
    }
    
    // Gestion du lien avec IP
    if (url === `/${UUID}/ip`) {
        const ipVless = `vless://${UUID}@${VPS_HOST}:443?type=xhttp&encryption=none&path=/xhttp&host=${VPS_HOST}&mode=packet-up&security=tls#XHTTP-IP`;
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(ipVless + '\n');
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
    console.log(`Lien IP disponible sur: /${UUID}/ip`);
});
