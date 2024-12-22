// config.js
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

module.exports = {
  client,
  DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID,
  CHANNEL_ID: process.env.YOUTUBE_CHANNEL_ID,
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
};
