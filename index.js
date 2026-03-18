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
});

// 🎵 الأوامر
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'play') {
    const query = interaction.options.getString('query');

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

    await interaction.reply('🔎 جاري البحث...');

    try {
      const result = await play.search(query, { limit: 1 });

      if (!result.length) {
        return interaction.followUp('❌ ما لقيت شيء');
      }

      const stream = await play.stream(result[0].url, {
        discordPlayerCompatibility: true,
        quality: 2
      });

      const resource = createAudioResource(stream.stream);

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
