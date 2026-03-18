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
        return message.reply('❌ اكتب اسم الأغنية أو الرابط');
    }

    const channel = message.member.voice.channel;

    if (!channel) {
        return message.reply('❌ لازم تدخل روم صوتي');
    }

    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        // 🔥 الحل النهائي (بدون search مشاكل)
        const stream = await play.stream(`ytsearch:${query}`);

        const resource = createAudioResource(stream.stream, {
            inputType: stream.type
        });

        const player = createAudioPlayer();
        player.play(resource);
        connection.subscribe(player);

        message.reply('🎶 تم التشغيل');

    } catch (err) {
        console.log(err);
        message.reply('❌ صار خطأ');
    }
});

client.login(TOKEN);
