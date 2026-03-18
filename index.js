const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const player = new Player(client);

(async () => {
    await player.extractors.loadDefault();
})();

client.once('ready', () => {
    console.log(`✅ Ready: ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'play') {
        const query = interaction.options.getString('song');

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

client.login(process.env.TOKEN);
