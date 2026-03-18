const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = process.env.TOKEN;
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID; // حطه في Railway

client.once('ready', async () => {
    console.log(`✅ Ready: ${client.user.tag}`);

    try {
        const guilds = client.guilds.cache;

        guilds.forEach(guild => {
            const channel = guild.channels.cache.get(VOICE_CHANNEL_ID);

            if (!channel) return;

            joinVoiceChannel({
                channelId: channel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
            });

            console.log('🔊 دخل الروم الصوتي');
        });

    } catch (err) {
        console.log(err);
    }
});

client.login(TOKEN);
