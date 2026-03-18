const { Client, GatewayIntentBits, SlashCommandBuilder, Routes } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { REST } = require('@discordjs/rest');
const { spawn } = require('child_process');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

let player = createAudioPlayer();
let connection;

// 🎮 الأوامر
const commands = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('تشغيل رابط')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('رابط يوتيوب')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('stop')
    .setDescription('إيقاف'),

  new SlashCommandBuilder()
    .setName('skip')
    .setDescription('تخطي')
].map(cmd => cmd.toJSON());

// تسجيل الأوامر
const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
  console.log(`🚀 Bot Ready: ${client.user.tag}`);

  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Commands Registered");
  } catch (err) {
    console.log(err);
  }
});

// 🎵 التشغيل
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'play') {
    const url = interaction.options.getString('url');
    const channel = interaction.member.voice.channel;

    if (!channel) {
      return interaction.reply('❌ ادخل روم صوتي أول');
    }

    connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    connection.subscribe(player);

    await interaction.reply('🔎 جاري التشغيل...');

    try {
      const stream = spawn('yt-dlp', [
        '-f', 'bestaudio',
        '-o', '-',
        url
      ]);

      const resource = createAudioResource(stream.stdout);

      player.play(resource);

      interaction.followUp(`🎶 شغّلت الرابط`);
    } catch (err) {
      console.log(err);
      interaction.followUp('❌ صار خطأ');
    }
  }

  if (interaction.commandName === 'stop') {
    player.stop();
    interaction.reply('⏹️ تم الإيقاف');
  }

  if (interaction.commandName === 'skip') {
    player.stop();
    interaction.reply('⏭️ تم التخطي');
  }
});

client.login(TOKEN);
