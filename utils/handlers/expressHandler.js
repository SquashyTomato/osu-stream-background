// Node Packages
const express = require('express');

// Utilities
const {submitRequest} = require('../handlers/configHandler');
const {wipeImage, updateCurrentImageFromQueue} = require('../helpers/queueHelper');

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

    router.get('/', async (req, res) => res.render('index', {image: global.current, mods: global.registeredMods, queueLength: global.queue.size}));
    router.get('/output', async (req, res) => res.render('output', {image: global.current}));

    router.get('/queue', async (req, res) => res.render('queue', {queue: global.queue, mods: global.registeredMods, image: global.current}));
    router.get('/config', async (req, res) => res.render('config', {cfg: global.cfg}));

    router.get('/submit', async (req, res) => {
        switch (req.query.type) {
        case 'config':
            submitRequest(req.query);
            return res.redirect('/config');
        case 'queue':
            if (req.query.action == 'verify') updateCurrentImageFromQueue(req.query.id);
            return res.redirect('/queue');
        case 'panic':
            await wipeImage();
            return res.redirect('/');
        case 'exit':
            global.log.info('Closing in 5 seconds...');
            setInterval(() => {
                return process.exit(1);
            }, 5000);
        }
    });

    global.app.use('/', router);
};

// Exports
module.exports = {startServer, initRoutes};