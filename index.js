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

// تحميل الاكستراكتورز (مهم)
(async () => {
    await player.extractors.loadDefault();
})();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

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

const rest = new REST({ version: '10' }).setToken(TOKEN);

// تسجيل الأوامر (سريع)
(async () => {
    try {
        console.log('⏳ تسجيل الأوامر...');

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
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

// تشغيل
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'play') {

        const query = interaction.options.getString('song');

        if (!query) {
            return interaction.reply('❌ اكتب اسم الأغنية');
        }

        const channel = interaction.member.voice.channel;

        if (!channel) {
            return interaction.reply('❌ لازم تدخل روم صوتي');
        }

        await interaction.deferReply();

        try {
            const result = await player.play(channel, query, {
                searchEngine: "youtube", // 🔥 هذا أهم سطر
                nodeOptions: {
                    metadata: interaction
                }
            });

            if (!result || !result.track) {
                return interaction.followUp('❌ ما لقيت شيء');
            }

            return interaction.followUp(`🎶 شغلت: ${result.track.title}`);

        } catch (err) {
            console.log(err);
            return interaction.followUp('❌ صار خطأ');
        }
    }
});

client.login(TOKEN);
