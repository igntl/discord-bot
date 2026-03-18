const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
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

    const args = message.content.split(' ').slice(1);
    const query = args.join(' ');

    if (!query) {
        return message.reply('❌ اكتب اسم الأغنية');
    }

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.reply('❌ ادخل روم صوتي أول');
    }

    try {
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        // 🔥 الحل النهائي المستقر
        const search = await play.search(query, { limit: 1 });

        if (!search.length) {
            return message.reply('❌ ما لقيت شيء');
        }

        const url = search[0].url;

        if (!url) {
            return message.reply('❌ فشل الحصول على الرابط');
        }

        const stream = await play.stream(url);

        const resource = createAudioResource(stream.stream, {
            inputType: stream.type,
            inlineVolume: true
        });

        resource.volume.setVolume(1); // 🔊 رفع الصوت

        const player = createAudioPlayer();

        player.on(AudioPlayerStatus.Playing, () => {
            console.log('🎶 Playing...');
        });

        player.on('error', (err) => {
            console.log('❌ Player Error:', err.message);
        });

        player.play(resource);
        connection.subscribe(player);

        message.reply(`🎶 شغلت: ${search[0].title}`);

    } catch (err) {
        console.log('❌ Error:', err);
        message.reply('❌ صار خطأ');
    }
});

client.login(TOKEN);
