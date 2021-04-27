// Node Packages
const fs = require('fs');

// Functions
const loadConfig = async (update = false) => {
    try {
        global.cfg = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
        if (!update) global.log.success('Config loaded!');
        await checkEmptyConfig();
    } catch (err) {
        if (err.code == 'ENOENT') {
            await createDefaultConfig();
            global.log.warn('A new config file has been created, if this is the first time you have started the app you may ignore this.');
            global.cfg = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
            await checkEmptyConfig();
            if (!update) global.log.success('Config loaded!');
        }
        else {
            global.log.error(`Unable to load config file, make sure the syntax is correct! You may delete the existing config or modify it manually to resolve this!\n${err}`);
            process.exit(1);
        }
    }
};

const createDefaultConfig = async () => {
    let defaultConfig = {
        server: {
            host: '127.0.0.1',
            port: 727
        },
        integrations: {
            twitch: {
                username: '',
                token: '',
                channel: '',
                rewardID: ''
            },
            discord: {
                webhookID: '',
                webhookToken: ''
            }
        },
        operation: {
            prefix: '!',
            enableQueue: 0,
            requestTimeout: 300,
            webSettings: 1
        }
    };

    fs.writeFileSync('./config.json', JSON.stringify(defaultConfig, null, 4), 'utf-8');
    return true;
};

const checkEmptyConfig = async () => {
    if (!global.cfg.server.host || !global.cfg.server.port) {
        global.log.error('Config is missing host or port information, You may delete the existing config or modify it manually to resolve this!');
        process.exit(1);
    }
    if (!global.cfg.integrations.twitch.username || !global.cfg.integrations.twitch.token || !global.cfg.integrations.twitch.channel) {
        global.log.warn(`Some Twitch credentias are missing, navigate to http://${global.cfg.server.host}:${global.cfg.server.port}/config and fill in the missing information.`);
    }
    if (global.cfg.operation.enableQueue == 1 && (!global.cfg.integrations.discord.webhookID || !global.cfg.integrations.discord.webhookToken)) {
        global.log.warn(`You have enabled the moderation queue however no Webhook was entered, navigate to http://${global.cfg.server.host}:${global.cfg.server.port}/config and fill in the missing information.`);
    }
};

const updateConfig = async (data) => {
    fs.writeFileSync('./config.json', JSON.stringify(data, null, 4), 'utf-8');
    await loadConfig(true);
    global.log.success('Config updated!');
    return true;
};

const submitRequest = async (query) => {
    let data = {
        server: {
            host: query.serverHost,
            port: parseInt(query.serverPort)
        },
        integrations: {
            twitch: {
                username: query.twitchUsername,
                token: query.twitchToken,
                channel: query.twitchChannel,
                rewardID: query.twitchReward
            },
            discord: {
                webhookID: query.webhookID,
                webhookToken: query.webhookToken
            }
        },
        operation: {
            prefix: query.prefix,
            enableQueue: query.queue ? parseInt(query.queue) : 0,
            requestTimeout: query.requestTimeout ? parseInt(query.requestTimeout) : 300,
            webSettings: query.webAccess ? parseInt(query.webAccess) : 0
        }
    };

    await updateConfig(data);
    return true;
};



// Exports
module.exports = {loadConfig, createDefaultConfig, checkEmptyConfig, updateConfig, submitRequest};