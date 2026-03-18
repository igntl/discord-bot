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

// تسجيل أمر /play
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

// تسجيل الأوامر في ديسكورد
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('⏳ تسجيل الأوامر...');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log('✅ تم تسجيل الأوامر');
    } catch (error) {
        console.error(error);
    }
})();

// عند تشغيل البوت
client.once('ready', () => {
    console.log(`✅ Ready: ${client.user.tag}`);
});

// استقبال الأوامر
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'play') {
        const query = interaction.options.get('song')?.value;

        if (!query) {
            return interaction.reply('❌ اكتب اسم الأغنية');
        }

        if (!interaction.member.voice.channel) {
            return interaction.reply('❌ لازم تدخل روم صوتي');
        }

        await interaction.deferReply();

        try {
            const { track } = await player.play(interaction.member.voice.channel, query, {
                nodeOptions: {
                    metadata: interaction
                }
            });

            return interaction.followUp(`🎶 شغلت: ${track.title}`);
        } catch (err) {
            console.log(err);
            return interaction.followUp('❌ صار خطأ');
        }
    }
});

// تشغيل البوت
client.login(process.env.TOKEN);
