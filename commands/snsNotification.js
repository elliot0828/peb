const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

const channelsPath = path.join(__dirname, "../data/channels.json");

// SNS 업데이트 알림 전송 함수
async function checkSNSUpdates(client, snsApiUrl) {
  try {
    const response = await axios.get(snsApiUrl);
    const postData = response.data[0]; // 최신 게시물 데이터

    if (postData) {
      const { title, url, thumbnail } = postData;

      // Embed 생성
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setImage(thumbnail)
        .setColor(0x00acee)
        .setURL(url);

      // JSON에서 알림 채널 불러오기
      const channels = JSON.parse(fs.readFileSync(channelsPath, "utf8"));

      Object.entries(channels).forEach(([serverId, { snsChannel }]) => {
        const channel = client.channels.cache.get(snsChannel);
        if (channel) {
          channel.send({
            content: `📢 **새로운 SNS 업데이트가 있습니다!**`,
            embeds: [embed],
          });
        }
      });
    }
  } catch (error) {
    console.error("SNS 업데이트 확인 중 오류 발생:", error.message);
  }
}

module.exports = { checkSNSUpdates };
