const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
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
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;

// 🔥 حط هنا Client ID حق البوت
const CLIENT_ID = "1483263033881923716";

// 🔥 تسجيل أمر /ping
const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('test command')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log("✅ تم تسجيل /ping");
  } catch (err) {
    console.log(err);
  }
})();

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

// 🔥 الرد على /ping
client.on('interactionCreate', interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    interaction.reply('🏓 Pong!');
  }
});

client.login(TOKEN);
