const fs = require("fs");
const path = require("path");

// JSON 파일 경로 수정
const channelsFilePath = path.join(__dirname, "../database/channels.json");

// 채널 설정 함수
module.exports = {
  name: "setchannel",
  description: "알림을 받을 채널을 설정합니다.",
  execute: async (message, args) => {
    const channel = message.mentions.channels.first();

    if (!channel) {
      return message.reply("채널을 지정해주세요. 예: `!setchannel #채널명`");
    }

    // channels.json 파일 로드
    let channelsData = {};
    if (fs.existsSync(channelsFilePath)) {
      channelsData = JSON.parse(fs.readFileSync(channelsFilePath, "utf-8"));
    }

    // 서버 ID로 데이터 저장
    channelsData[message.guild.id] = { channelId: channel.id };

    // JSON 파일 업데이트
    fs.writeFileSync(
      channelsFilePath,
      JSON.stringify(channelsData, null, 2),
      "utf-8"
    );
    message.reply(`알림 채널이 ${channel.name}으로 설정되었습니다.`);
  },
};
