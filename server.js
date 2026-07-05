const http = require('http');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Serveur Opérationnel\nMode Multiplexé Actif.\n');
    } else {
        res.writeHead(404);
        res.end('Not Found\n');
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
