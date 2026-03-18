const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { Player } = require('discord-player');
require('@discord-player/extractor');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const player = new Player(client);

// تحميل الاكستراكتورز
(async () => {
    await player.extractors.loadDefault();
})();

// أمر play
const commands = [
    new SlashCommandBuilder()
        .setName('play')
        .setDescription('تشغيل أغنية')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('اسم الأغنية أو الرابط')
                .setRequired(true)
        )
].map(cmd => cmd.toJSON());

// تسجيل الأوامر (الوضع الطبيعي)
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('⏳ تسجيل الأوامر...');

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands } // ✅ رجعناه طبيعي
        );

        console.log('✅ تم تسجيل الأوامر');
    } catch (error) {
        console.error(error);
    }
})();

// جاهز
client.once('ready', () => {
    console.log(`✅ Ready: ${client.user.tag}`);
});

// تشغيل الأمر
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'play') {
        const query = interaction.options.getString('song');

        if (!interaction.member.voice.channel) {
            return interaction.reply('❌ لازم تدخل روم صوتي');
        }

        await interaction.deferReply();

        try {
            const { track } = await player.play(
                interaction.member.voice.channel,
                query,
                {
                    nodeOptions: {
                        metadata: interaction
                    }
                }
            );

            return interaction.followUp(`🎶 شغلت: ${track.title}`);
        } catch (err) {
            console.log(err);
            return interaction.followUp('❌ صار خطأ');
        }
    }
});

client.login(process.env.TOKEN);
