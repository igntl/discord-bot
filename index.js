const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const play = require('play-dl');
const ffmpeg = require('ffmpeg-static');

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
        return message.reply('❌ اكتب اسم الأغنية');
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

        // 🔥 الحل النهائي (بدون undefined)
        const stream = await play.stream(`ytsearch:${query}`);

        const resource = createAudioResource(stream.stream, {
            inputType: stream.type,
            inlineVolume: true
        });

        resource.volume.setVolume(1);

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
