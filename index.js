const { Client, GatewayIntentBits, SlashCommandBuilder, Routes } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { REST } = require('@discordjs/rest');
const play = require('play-dl');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.VOICE_CHANNEL_ID;

let player = createAudioPlayer();
let connection;

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

// 🚀 عند تشغيل البوت
client.once('ready', async () => {
  console.log(`🚀 Bot Ready: ${client.user.tag}`);

  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Commands Registered");
  } catch (err) {
    console.log("❌ Error registering commands:", err);
  }

  // 🔊 دخول الروم تلقائي
  const guild = client.guilds.cache.get(GUILD_ID);
  const channel = guild.channels.cache.get(CHANNEL_ID);

  connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
  });

  connection.subscribe(player);
});

// 🎵 الأوامر
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'play') {
    const query = interaction.options.getString('query');

    await interaction.reply('🔎 جاري البحث...');

    try {
      const result = await play.search(query, { limit: 1 });
      if (!result.length) return interaction.followUp('❌ ما لقيت شيء');

      const stream = await play.stream(result[0].url);

      const resource = createAudioResource(stream.stream, {
        inputType: stream.type
      });

      player.play(resource);

      interaction.followUp(`🎶 شغّلت: ${result[0].title}`);
    } catch (err) {
      console.log(err);
      interaction.followUp('❌ صار خطأ');
    }
  }

  if (interaction.commandName === 'stop') {
    player.stop();
    await interaction.reply('⏹️ تم الإيقاف');
  }

  if (interaction.commandName === 'skip') {
    player.stop();
    await interaction.reply('⏭️ تم التخطي');
  }
});

client.login(TOKEN);
