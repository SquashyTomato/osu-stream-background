// Utilities
const queueHelper = require('../helpers/queueHelper');

// Functions
const startConnection = async () => {
    // Connect client
    global.client.connect().catch(err => global.log.error(`Unable to connect to Twitch, make sure your credentials are correct: ${err}`));

    // Client events
    global.client.on('connected', async (host, port) => global.log.info(`Connected to Twitch at ${host}:${port}`));
    global.client.on('disconnected', async (reason) => global.log.error(`Disconnected from Twitch: ${reason}`));
    global.client.on('chat', (channel, userstate, message, self) => handleChatEvent(channel, userstate, message, self));
    global.client.on('whisper', (from, userstate, message, self) => {
        handleWhisper(from, userstate, message, self);
        console.log(from);
        console.log(userstate);
        console.log(message);
        console.log(self);
    });
};

const handleChatEvent = async (channel, userstate, message, self) => {
    if (self) return;
    if (channel != `#${global.cfg.integrations.twitch.channel.toLowerCase()}`) return;

    if (userstate['custom-reward-id'] && userstate['custom-reward-id'] == global.cfg.integrations.twitch.rewardID) handleReward(channel, userstate, message);
    else handleMessage(channel, userstate, message);
};

const handleReward = async (channel, userstate, message) => {
    if (global.cfg.operation.enableQueue == 1) {
        await queueHelper.addRequest(userstate, message);
    } else if (global.cfg.operation.enableQueue == 0) {
        global.current = message;
        global.client.say(channel, `@${userstate['display-name']}, image has updated!`);
    }
};

const handleMessage = async (channel, userstate, message) => {
    var command = message.slice(global.cfg.operation.prefix.length).split(' ')[0];
    var params = message.split(' ').slice(1);

    if (!message.startsWith(global.cfg.operation.prefix)) return;
    var perm = await queueHelper.checkVerifyPermissions(userstate);

    switch (command) {
    case 'ping':
        global.client.say(channel, `@${userstate['display-name']}, pong!`);
        return;
    case 'register':
        if (!perm) return;
        if (userstate['username'] == global.cfg.integrations.twitch.username.toLowerCase()) return global.client.say(channel, `@${userstate['display-name']}, the bot account is unable to register.`);
        console.log(userstate['username']);
        global.registeredMods.push(userstate['username']);
        global.client.whisper(userstate['username'], 'You are now registered to verify requests in whispers!');
        return;
    case 'verify':
        if (!perm) return;
        if (!params[0]) return global.client.say(channel, `@${userstate['display-name']}, please enter a message ID.`);

        try {
            var req = await queueHelper.updateCurrentImageFromQueue(params[0]);
            global.client.say(channel, `@${userstate['display-name']}, now displaying request from @${req.name}`);
        } catch (err) {
            global.log.error(err);
            global.client.say(channel, `@${userstate['display-name']}, unable to verify, the error has been logged.`);
        }
        return;
    }
};

const handleWhisper = async (from, userstate, message, self) => {
    if (self) return;

    var command = message.slice(global.cfg.operation.prefix.length).split(' ')[0];
    var params = message.split(' ').slice(1);

    if (!message.startsWith(global.cfg.operation.prefix)) return;
    if (!global.registeredMods.includes(userstate['username'])) return;

    switch (command) {
    case 'verify':
        if (!params[0]) return global.client.whisper(userstate['username'], 'Please enter a message ID.');

        try {
            var req = await queueHelper.updateCurrentImageFromQueue(params[0]);
            global.client.whisper(userstate['username'], `Now displaying request from @${req.name}`);
        } catch (err) {
            global.log.error(err);
            global.client.whisper(userstate['username'], 'Unable to verify, the error has been logged.');
        }
        return;
    }
};

// Exports
module.exports = {startConnection, handleChatEvent, handleReward, handleMessage};