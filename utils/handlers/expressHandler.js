// Node Packages
const express = require('express');

// Utilities
const {submitRequest} = require('../handlers/configHandler');
const {wipeImage} = require('../helpers/queueHelper');

// Functions
const startServer = async () => {
    await initRoutes();
    global.app.set('view engine', 'ejs');
    global.app.set('views', 'utils/views');
    global.app.listen(global.cfg.server.port, global.cfg.server.host, () => {
        global.log.info(`Now listening on http://${global.cfg.server.host}:${global.cfg.server.port}`);
    });
};

const initRoutes = async () => {
    const router = express.Router();

    router.get('/', async (req, res) => res.render('index'));
    router.get('/output', async (req, res) => res.render('output', {image: global.current}));

    router.get('/queue', async (req, res) => res.render('queue', {queue: global.queue}));
    router.get('/config', async (req, res) => res.render('config', {cfg: global.cfg}));

    router.get('/submit', async (req, res) => {
        submitRequest(req.query);
        res.location('/config');
    });
    router.get('/panic', async (req, res) => {
        await wipeImage();
        res.send('Wiped current image!');
    });
    router.get('/exit', async () => {
        global.log.info('Closing...');
        process.exit(1);
    });

    global.app.use('/', router);
};

// Exports
module.exports = {startServer, initRoutes};