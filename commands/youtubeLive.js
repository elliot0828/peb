const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

const channelsPath = path.join(__dirname, "../database/channels.json");

// 유튜브 라이브 알림 전송 함수
async function checkLiveStream(client, apiKey, channelId) {
  const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`;

  try {
    const response = await axios.get(youtubeApiUrl);
    const liveData = response.data.items[0];
    console.log(liveData);
    if (liveData) {
      const { title, description, thumbnails } = liveData.snippet;

      // Embed 생성
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setThumbnail(thumbnails.default.url)
        .setColor(0xff0000)
        .setURL(`https://www.youtube.com/watch?v=${liveData.id.videoId}`);

      // JSON에서 알림 채널 불러오기
      const channels = JSON.parse(fs.readFileSync(channelsPath, "utf8"));
      console.log(channels);
      Object.entries(channels).forEach(([serverId, { youtubeChannel }]) => {
        const channel = client.channels.cache.get(youtubeChannel);
        if (channel) {
          channel.send({
            content: `🎥 **새로운 유튜브 라이브가 시작되었습니다!**`,
            embeds: [embed],
          });
        }
      });
    }
  } catch (error) {
    console.error("유튜브 라이브 확인 중 오류 발생:", error.message);
  }
}

module.exports = { checkLiveStream };
