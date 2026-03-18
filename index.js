const { Client, GatewayIntentBits, SlashCommandBuilder, Routes } = require('discord.js');
const { Player } = require('discord-player');
const { REST } = require('@discordjs/rest');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const player = new Player(client);

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// 🎮 الأوامر
const commands = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('تشغيل أغنية')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('اسم أو رابط')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('stop')
    .setDescription('إيقاف'),

  new SlashCommandBuilder()
    .setName('skip')
    .setDescription('تخطي')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

// 🚀 تشغيل البوت
client.once('ready', async () => {
  console.log(`🚀 Ready: ${client.user.tag}`);

  // تحميل مصادر الصوت (مهم)
  const { DefaultExtractors } = require('@discord-player/extractor');
  await player.extractors.loadMulti(DefaultExtractors);

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );

  console.log("✅ Commands Registered");
});

// 🎵 الأوامر
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const channel = interaction.member.voice.channel;

  if (!channel) {
    return interaction.reply('❌ ادخل روم صوتي أول');
  }

  if (interaction.commandName === 'play') {
    const query = interaction.options.getString('query');

    await interaction.reply('🎶 جاري التشغيل...');

    try {
      await player.play(channel, query, {
        searchEngine: "youtube", // 🔥 هذا حل مشكلتك
        nodeOptions: {
          metadata: interaction
        }
      });
    } catch (err) {
      console.log(err);
      interaction.followUp('❌ صار خطأ');
    }
  }

  if (interaction.commandName === 'stop') {
    player.nodes.get(interaction.guildId)?.node.stop();
    interaction.reply('⏹️ تم الإيقاف');
  }

  if (interaction.commandName === 'skip') {
    player.nodes.get(interaction.guildId)?.node.skip();
    interaction.reply('⏭️ تم التخطي');
  }
});

client.login(TOKEN);
