const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const play = require('play-dl');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = process.env.TOKEN;

client.once('ready', () => {
    console.log(`✅ Ready: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('!play')) return;

    const query = message.content.split(' ').slice(1).join(' ');

    if (!query) {
        return message.reply('❌ حط رابط أو اسم');
    }

    const channel = message.member.voice.channel;

    if (!channel) {
        return message.reply('❌ ادخل روم صوتي');
    }

    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const stream = await play.stream(query);

        const resource = createAudioResource(stream.stream, {
            inputType: stream.type
        });

        const player = createAudioPlayer();
        player.play(resource);
        connection.subscribe(player);

        message.reply('🎶 شغلت');

    } catch (err) {
        console.log(err);
        message.reply('❌ صار خطأ');
    }
});

client.login(TOKEN);
