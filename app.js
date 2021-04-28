// Node Packages
const express = require('express');
const tmi = require('tmi.js');
const discord = require('discord.js');

// Utilities
const log = global.log = require('./utils/helpers/consoleHelper');
const queueHelper = require('./utils/helpers/queueHelper');
const configHandler = require('./utils/handlers/configHandler');
const expressHandler = require('./utils/handlers/expressHandler');
const twitchHandler = require('./utils/handlers/twitchHandler');

// Main script
(async () => {
    // Display welcome text
    log.welcome();

    // Load app config
    await configHandler.loadConfig();

    // Package properties
    global.app = express();
    global.client = new tmi.Client({
        connection: {
            reconnect: true,
            secure: true
        },
        identity: {
            username: global.cfg.integrations.twitch.username,
            password: global.cfg.integrations.twitch.token
        },
        channels: [global.cfg.integrations.twitch.channel]
    });
    global.webhook = new discord.WebhookClient(global.cfg.integrations.discord.webhookID, global.cfg.integrations.discord.webhookToken);

    // Catch any uncaught errors
    process.on('unhandledRejection', async (err, stack) => {
        global.log.error(`Oh no, an error occured: ${err}`);
        console.log(stack);
        process.exit(1);
    });

    // Define global variables
    global.current = '';
    global.queue = new Map();
    global.registeredMods = new Array();

    // Run request timeout
    queueHelper.requestTimeout(global.cfg.operation.requestTimeout || 300);

    // Start the Twitch chatbot
    await twitchHandler.startConnection();

    // Start web server
    await expressHandler.startServer();
})();