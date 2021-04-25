// Node Packages
const discord = require('discord.js');

// Functions
const updateCurrentImageFromQueue = async (url) => {
    var req = await global.queue.get(url);
    global.current = req.link;
    return req;
};

const checkVerifyPermissions = async (userstate) => {
    if (userstate['badges-raw'].includes('broadcaster')) return true;
    else if (userstate.mod) return true;
    else return false;
};

const addRequest = async (userstate, message) => {
    global.queue.set(userstate.id, {id: userstate.id, name: userstate['display-name'], link: message});

    const embed = new discord.MessageEmbed()
        .setTitle(userstate['display-name'])
        .setDescription(`To verify, enter \`${global.cfg.operation.prefix}verify ${userstate.id}\` in Twitch chat\n\n${message}`)
        .setImage(message);

    global.webhook.send(embed);
};

const wipeImage = async () => {
    global.current = '';
    global.log.warn('The current image was wiped.');
};

// Export
module.exports = {updateCurrentImageFromQueue, checkVerifyPermissions, addRequest, wipeImage};