const http = require('http');
const crypto = require('crypto');
const net = require('net');

// === CONFIGURATION ===
const VPS_HOST = 'stuffvh.afrihall.com';        // Domaine du VPS
const VPS_PORT = 22;                             // Port SSH
const VPS_IP = '134.122.51.204';                 // IP du VPS
const PORT = process.env.PORT || 8080;

const DOMAIN = process.env.DOMAIN || 'main-bvxea6i-jjxw6l5yj6f7q.fr-3.platformsh.site';
const USERNAME = 'moust';
const PASSWORD = 'moust';

console.log('==========================================');
console.log('🔐 SSH over WebSocket - Upsun');
console.log(`📡 VPS cible: ${VPS_HOST}:${VPS_PORT}`);
console.log(`🌐 Domaine: ${DOMAIN}`);
console.log(`👤 Login: ${USERNAME} / ${PASSWORD}`);
console.log('==========================================');

const server = http.createServer((req, res) => {
    const url = req.url;
    const domain = req.headers.host || DOMAIN;

    // === Route principale (health check) ===
    if (url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`🔐 SSH WebSocket Tunnel OK\n\nwss://${domain}/ws\n\nLogin: ${USERNAME} / ${PASSWORD}\n`);
        console.log(`📄 Page d'accueil affichée`);
        return;
    }

    // === Configuration client ===
    if (url === '/config') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`wss://${domain}/ws\nLogin: ${USERNAME}\nPassword: ${PASSWORD}\n`);
        console.log(`📋 Configuration client générée`);
        return;
    }

    // === Payload SSH avec IP ===
    if (url === `/${VPS_IP}`) {
        const payload = `GET / HTTP/1.1\r\nHost: ${domain}\r\nConnection: Upgrade\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\r\nUpgrade: websocket\r\n\r\n`;
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(payload);
        console.log(`🔗 Payload SSH généré (IP: ${VPS_IP})`);
        return;
    }

    res.writeHead(404);
    res.end('Not Found\n');
});

// === Gestion WebSocket (tunnel SSH) ===
server.on('upgrade', (req, socket, head) => {
    const url = req.url;
    console.log(`🔌 Nouvelle connexion WebSocket: ${url}`);

    // Vérifier le chemin
    if (url !== '/ws') {
        console.log(`❌ Chemin invalide: ${url}`);
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        socket.destroy();
        return;
    }

    // Authentification (Basic Auth)
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        console.log('❌ Authentification requise');
        socket.write('HTTP/1.1 401 Unauthorized\r\nWWW-Authenticate: Basic realm="WebSocket"\r\n\r\n');
        socket.destroy();
        return;
    }

    // Vérifier login/password
    const base64 = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64, 'base64').toString();
    const [username, password] = credentials.split(':');

    if (username !== USERNAME || password !== PASSWORD) {
        console.log(`❌ Authentification échouée: ${username}`);
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
    }

    console.log(`✅ Authentification réussie: ${username}`);

    // Connexion au VPS (SSH)
    const vpsSocket = net.connect(VPS_PORT, VPS_HOST, () => {
        console.log(`🔗 Connecté au VPS ${VPS_HOST}:${VPS_PORT}`);

        // Réponse WebSocket upgrade
        const acceptKey = req.headers['sec-websocket-key'];
        const acceptValue = crypto
            .createHash('sha1')
            .update(acceptKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
            .digest('base64');

        socket.write([
            'HTTP/1.1 101 Switching Protocols',
            'Upgrade: websocket',
            'Connection: Upgrade',
            `Sec-WebSocket-Accept: ${acceptValue}`,
            '\r\n'
        ].join('\r\n'));

        // Transférer les données
        vpsSocket.pipe(socket);
        socket.pipe(vpsSocket);
    });

    vpsSocket.on('error', (err) => {
        console.error(`❌ Erreur VPS: ${err.message}`);
        socket.destroy();
    });

    socket.on('error', (err) => {
        console.error(`❌ Erreur WebSocket: ${err.message}`);
        vpsSocket.destroy();
    });

    socket.on('close', () => {
        console.log('🔌 WebSocket déconnecté');
        vpsSocket.destroy();
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Tunnel SSH over WebSocket actif sur le port ${PORT}`);
    console.log(`🔗 wss://${DOMAIN}/ws`);
});
