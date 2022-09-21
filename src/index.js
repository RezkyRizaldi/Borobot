const { SoundCloudPlugin } = require('@distube/soundcloud');
const { SpotifyPlugin } = require('@distube/spotify');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { DiscordTogether } = require('discord-together');
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require('discord.js');
const { DisTube } = require('distube');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const {
  GuildBans,
  GuildInvites,
  GuildMembers,
  GuildMessageReactions,
  GuildMessages,
  GuildPresences,
  Guilds,
  GuildVoiceStates,
  MessageContent,
} = GatewayIntentBits;
const { Channel, GuildMember, Message, Reaction, User } = Partials;

/** @type {{ commands: import('discord.js').Collection, components: import('discord.js').Collection, distube: import('distube').DisTube, discordTogether: import('discord-together').DiscordTogether<{[x: string]: string}>, handleEvents(): Promise<void>, handleComponents(): Promise<void>, handleCommands(): Promise<void> }} */

const client = new Client({
  intents: [
    GuildBans,
    GuildInvites,
    GuildMembers,
    GuildMessageReactions,
    GuildMessages,
    GuildPresences,
    Guilds,
    GuildVoiceStates,
    MessageContent,
  ],
  partials: [Channel, Message, GuildMember, Reaction, User],
});

client.commands = new Collection();
client.components = new Collection();
client.commandArray = [];

client.distube = new DisTube(client, {
  emitNewSongOnly: true,
  leaveOnStop: false,
  leaveOnFinish: true,
  emitAddSongWhenCreatingQueue: false,
  emitAddListWhenCreatingQueue: false,
  plugins: [
    new SpotifyPlugin({ emitEventsAfterFetching: true }),
    new SoundCloudPlugin(),
    new YtDlpPlugin({ update: false }),
  ],
});

client.discordTogether = new DiscordTogether(client);

const funcPath = path.join(__dirname, 'functions');
const funcFolders = fs.readdirSync(funcPath);
for (const folder of funcFolders) {
  const funcSubPath = path.join(funcPath, folder);
  const funcFiles = fs
    .readdirSync(funcSubPath)
    .filter((file) => file.endsWith('.js'));
  for (const file of funcFiles) {
    const filePath = path.join(funcSubPath, file);
    require(filePath)(client);
  }
}

client
  .handleEvents()
  .then(() => client.handleComponents())
  .then(() => client.handleCommands())
  .then(() => client.login(process.env.token))
  .catch((err) => console.error(err));
