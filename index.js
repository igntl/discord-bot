const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`✅ Ready: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('!play')) return;

    const url = message.content.split(' ')[1];

    if (!url) return message.reply('❌ حط رابط');

    const channel = message.member.voice.channel;
    if (!channel) return message.reply('❌ ادخل روم صوتي');

    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const stream = ytdl(url, {
            filter: 'audioonly',
            highWaterMark: 1 << 25
        });

        const resource = createAudioResource(stream);
        const player = createAudioPlayer();

        player.play(resource);
        connection.subscribe(player);

        message.reply('🎶 شغلت');

    } catch (err) {
        console.log(err);
        message.reply('❌ صار خطأ');
    }
});

client.login(process.env.TOKEN);
