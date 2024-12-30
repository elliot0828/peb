const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { EmbedBuilder } = require("discord.js"); // EmbedBuilder를 discord.js에서 가져오기
const { google } = require("googleapis");
const statsEmbed = new EmbedBuilder().setColor("#ffa200"); // Embed 색
const fs = require("fs").promises; // fs 모듈의 Promise API 사용
const Discord = require("discord.js");
const Canvas = require("canvas");
const { registerFont } = require("canvas");
const { AttachmentBuilder } = require("discord.js");
require("dotenv").config();
registerFont("./ui/font/tour.otf", { family: "tour" });
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const internal = require("stream");
const { kill } = require("process");
const { type } = require("os");
const APIKEY =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJlYTU4NzE5MC0xYmZlLTAxM2MtOGM0Mi0wNmEwODIyNTEzYWQiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNjkxOTI4MDI2LCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6Ii0yOTEyNDU0OC03OTVmLTQzYmItYmRlMi1mYjkxYjM3NWNhMmUifQ.Z8v6NPvr7ee_coJvrxJ6oIUsmD0GVCiOU-NIavOWCG8";
client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  if (interaction !== undefined) {
    await interaction.deferReply();

    if (commandName === "링크") {
      interaction.editReply(
        `**펍지 이스포츠 SNS & 라이브 채널 링크**\n\n🌐 **펍지 이스포츠 공식 웹사이트** - <https://pubgesports.com>\n📺 **펍지 이스포츠 공식 유튜브 채널** - <https://www.youtube.com/@pubgesportskr>\n⚡️ **펍지 이스포츠 공식 치지직** - <https://chzzk.naver.com/2d8731009f2bdf883e4826ac413f5502> \n🖥️ **펍지 이스포츠 공식 아프리카 TV** - <https://ch.sooplive.co.kr/pubg>\n🎥 **펍지 이스포츠 공식 틱톡** - <https://www.tiktok.com/@pubg.kr.official>\n📷 **펍지 이스포츠 공식 인스타그램** - <https://www.instagram.com/pubgesports_kr/>\n🆇 **펍지 이스포츠 공식 트위터** - <https://x.com/pubgesports_kr>\n\n🛒 **펍지 이스포츠 공식 스토어** - <https://pubg-esportsstore.com>`
      );
    } else if (commandName === "tp") {
      interaction.editReply(
        "**PUBG Players Tour TP 조회 기능은 추후 업데이트될 예정입니다.**"
      );
    } else if (commandName === "부가서비스") {
      interaction.editReply(`
        🔫 **PUBG : BATTLEGROUNDS 공식 웹사이트** - <https://pubg.com>\n🖥️ **PUBG Overlay** - <https://pubgoverlay.com>\n 📈 **전적 검색** - <https://pubg.op.gg/>
        `);
    } else if (commandName == "토너먼트일정") {
      tournament_API(interaction);
    } else if (commandName == "일반전전적") {
      let info = {
        ign: interaction.options.getString("닉네임"),
        season: calculate_season(interaction.options.getNumber("시즌")),
        mode: interaction.options.getString("모드"),
        platform: interaction.options.getString("플랫폼"),
        seasonNum: interaction.options.getNumber("시즌"),
        type: "normal",
      };
      player_API(interaction, info);
    } else if (commandName == "경쟁전전적") {
      let info = {
        ign: interaction.options.getString("닉네임"),
        season: calculate_season(interaction.options.getNumber("시즌")),
        mode: interaction.options.getString("모드"),
        seasonNum: interaction.options.getNumber("시즌"),
        platform: interaction.options.getString("플랫폼"),
        type: "ranked",
      };
      player_API(interaction, info);
    } else if (commandName == "계정제재내역") {
      let info = {
        ign: interaction.options.getString("닉네임"),
        platform: interaction.options.getString("플랫폼"),
        type: "account",
      };
      player_API(interaction, info);
    }
  }
});
function calculate_season(num) {
  let id = `division.bro.official.pc-2018-${num}`;
  return id;
}
function player_API(interaction, obj) {
  let data = fetch(
    `https://api.pubg.com/shards/${obj["platform"]}/players?filter[playerNames]=${obj["ign"]}`,
    {
      headers: {
        accept: "application/vnd.api+json",
        Authorization: `Bearer ${APIKEY}`,
      },
    }
  );
  data
    .then((response) => response.json())
    .then((data) => check_response_accid(data, interaction, obj));
  // .catch((err) =>
  //   interaction.editReply({
  //     ephemeral: true,
  //     content: "오류가 발생했습니다. 잠시 후에 다시 시도해 보세요.",
  //   })
  //  );
}
function check_response_accid(data, interaction, obj) {
  let key = Object.keys(data);
  if (key[0] == "errors") {
    let err = data["errors"][0]["title"];
    if (err == "Not Found") {
      interaction.editReply("닉네임을 확인해 주세요. (대소문자 확인)");
    }
  } else if (key[0] == "data") {
    let accid = data["data"][0]["id"];
    obj["accid"] = accid;
    if (obj["type"] == "normal") {
      get_normal(interaction, obj);
    } else if (obj["type"] == "ranked") {
      get_ranked(interaction, obj);
    } else if (obj["type"] == "account") {
      get_account(interaction, obj, data);
    }
  }
}
function get_account(interaction, obj, data) {
  let acc = {
    Innocent: "제재 내역 없음",
    TemporaryBan: "임시정지",
    PermanentBan: "영구정지",
  };
  let statsEmbed = new EmbedBuilder()
    .setColor("#ffa200")
    .setTitle(`${obj["ign"]} 계정 제재 내역`) // 제목

    .addFields({
      name: "계정 확인",
      value: String(acc[data["data"][0]["attributes"]["banType"]]),
      inline: true,
    })
    .addFields({
      name: "플랫폼",
      value: String(obj["platform"]),
      inline: true,
    });
  interaction.editReply({ embeds: [statsEmbed] });
  console.log(data["data"][0]["attributes"]["banType"]);
}
function get_normal(interaction, obj) {
  let normaldata = fetch(
    `https://api.pubg.com/shards/${obj["platform"]}/players/${obj["accid"]}/seasons/${obj["season"]}`,
    {
      headers: {
        accept: "application/vnd.api+json",
        Authorization: `Bearer ${APIKEY}`,
      },
    }
  );
  normaldata
    .then((response) => response.json())
    .then((data) =>
      normal_data(interaction, data["data"]["attributes"]["gameModeStats"], obj)
    )
    .catch((err) =>
      interaction.editReply(
        "오류가 발생했습니다. 잠시 후에 다시 시도해 보세요."
      )
    );
}
function get_ranked(interaction, obj) {
  let rankeddata = fetch(
    `https://api.pubg.com/shards/${obj["platform"]}/players/${obj["accid"]}/seasons/${obj["season"]}/ranked`,
    {
      headers: {
        accept: "application/vnd.api+json",
        Authorization: `Bearer ${APIKEY}`,
      },
    }
  );
  rankeddata
    .then((response) => response.json())
    .then((data) =>
      ranked_data(
        interaction,
        data["data"]["attributes"]["rankedGameModeStats"],
        obj
      )
    )
    .catch((err) =>
      interaction.editReply(
        "오류가 발생했습니다. 잠시 후에 다시 시도해 보세요."
      )
    );
}
function ranked_data(interaction, data, obj) {
  let type = ["solo", "squad", "solo-fpp", "squad-fpp"];
  let modes = {
    solo: "솔로",
    duo: "듀오",
    squad: "스쿼드",
    "solo-fpp": "1인칭 솔로",
    "duo-fpp": "1인칭 듀오",
    "squad-fpp": "1인칭 스쿼드",
  };
  // console.log(data, obj);
  let Varray = {
    kills: null,
    damageDealt: null,
    assists: null,
    kda: null,
    wins: null,
    roundsPlayed: null,
    tier: null,
    rp: null,
  };
  let keys = Object.keys(Varray);
  for (let i = 0; i < keys.length; i++) {
    Varray[keys[i]] = data[obj["mode"]][keys[i]];
  }
  Varray["damageDealt"] = Varray["damageDealt"].toFixed(2);
  Varray["kda"] = Varray["kda"].toFixed(2);
  Varray["tier"] =
    data[obj["mode"]]["currentTier"]["tier"] +
    " " +
    data[obj["mode"]]["currentTier"]["subTier"];
  Varray["rp"] = data[obj["mode"]]["currentRankPoint"];

  let statsEmbed = new EmbedBuilder()
    .setColor("#ffa200")
    .setTitle(
      `${obj["ign"]}의 시즌 ${obj["seasonNum"]} 경쟁전 ${
        modes[obj["mode"]]
      } 모드 전적`
    ) // 제목

    .addFields(
      { name: "티어", value: String(Varray["tier"]), inline: true },
      { name: "RP", value: String(Varray["rp"]), inline: true },
      { name: "킬", value: String(Varray["kills"]), inline: true },
      { name: "데미지", value: String(Varray["damageDealt"]), inline: true },
      { name: "어시스트", value: String(Varray["assists"]), inline: true },
      { name: "KDA", value: String(Varray["kda"]), inline: true },
      { name: "치킨", value: String(Varray["wins"]), inline: true },
      { name: "총 매치", value: String(Varray["roundsPlayed"]), inline: true }
    );
  interaction.editReply({ embeds: [statsEmbed] });
  console.log(Varray);
}
function normal_data(interaction, data, obj) {
  console.log(obj);
  let type = ["solo", "duo", "squad", "solo-fpp", "duo-fpp", "squad-fpp"];
  let Varray = {
    kills: null,
    damageDealt: null,
    assists: null,
    losses: null,
    roundsPlayed: null,
    top10s: null,
    wins: null,
  };
  let modes = {
    solo: "솔로",
    duo: "듀오",
    squad: "스쿼드",
    "solo-fpp": "1인칭 솔로",
    "duo-fpp": "1인칭 듀오",
    "squad-fpp": "1인칭 스쿼드",
  };
  let keys = Object.keys(Varray);

  for (let j = 0; j < keys.length; j++) {
    console.log(data[obj["mode"]][keys[j]]);
    Varray[keys[j]] = Number(data[obj["mode"]][keys[j]]);
  }

  Varray["damageDealt"] = Number(Varray["damageDealt"].toFixed(2));
  Varray["kda"] = Number(
    (Varray["kills"] + Varray["assists"]) /
      (Varray["roundsPlayed"] - Varray["wins"])
  ).toFixed(1);
  Varray["wins"] = `${Varray["wins"]}(${(
    (Varray["wins"] / Varray["roundsPlayed"]) *
    100
  ).toFixed(0)}%)`;
  Varray["top10s"] = `${Varray["top10s"]}(${(
    (Varray["top10s"] / Varray["roundsPlayed"]) *
    100
  ).toFixed(0)}%)`;
  Varray["losses"] = `${Varray["losses"]}(${(
    (Varray["losses"] / Varray["roundsPlayed"]) *
    100
  ).toFixed(0)}%)`;

  let statsEmbed = new EmbedBuilder()
    .setColor("#ffa200")
    .setTitle(
      `${obj["ign"]}의 시즌 ${obj["seasonNum"]} 일반전 ${
        modes[obj["mode"]]
      } 모드 전적`
    ) // 제목

    .addFields(
      { name: "킬", value: String(Varray["kills"]), inline: true },
      { name: "데미지", value: String(Varray["damageDealt"]), inline: true },
      { name: "어시스트", value: String(Varray["assists"]), inline: true },
      { name: "KDA", value: String(Varray["kda"]), inline: true },
      { name: "치킨", value: String(Varray["wins"]), inline: true },
      { name: "탑10", value: String(Varray["top10s"]), inline: true },
      { name: "패배", value: String(Varray["losses"]), inline: true },
      { name: "총 매치", value: String(Varray["roundsPlayed"]), inline: true }
    );

  interaction.editReply({ embeds: [statsEmbed] });
}

function tournament_API(interaction) {
  console.log(APIKEY);
  let data = fetch(`https://api.pubg.com/tournaments/`, {
    headers: {
      accept: "application/vnd.api+json",
      Authorization: `Bearer ${APIKEY}`,
    },
  });
  data
    .then((response) => response.json())
    .then((data) => get_tournaments(data, interaction))

    .catch((err) => console.log(err));
}
function get_tournaments(data, interaction) {
  let today = new Date();
  let recent_tournaments = [];
  for (let i = 0; i < 10; i++) {
    let isoString = new Date(data["data"][i]["attributes"]["createdAt"]);
    const year = isoString.getFullYear();
    const month = isoString.getMonth() + 1;
    const day = isoString.getDate();
    const differenceInMilliseconds = today - isoString;
    const differenceInDays = Math.floor(
      differenceInMilliseconds / (1000 * 60 * 60 * 24)
    );
    data["data"][i]["attributes"]["createdAt"] = `${year}/${month}/${day}`;
    // if (differenceInDays <= 30) {
    recent_tournaments.push(data["data"][i]);
    // }
  }
  render_tournaments(interaction, recent_tournaments);
}
async function render_tournaments(interaction, data) {
  const canvas = Canvas.createCanvas(1920, 1080);
  const ctx = canvas.getContext("2d");
  // ctx.textAlign = "center";
  const backgroundFile = await fs.readFile("./ui/tournament.png");
  const background = new Canvas.Image();
  background.src = backgroundFile;
  ctx.fillStyle = "#FFA200";
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  ctx.font = "60px tour";
  for (let i = 0; i < 10; i++) {
    if (i < 5) {
      ctx.fillText(
        `${i + 1}. ${data[i]["id"].toUpperCase()} (${
          data[i]["attributes"]["createdAt"]
        })`,
        canvas.width / 30,
        150 * i + 250
      );
    } else {
      ctx.fillText(
        `${i + 1}. ${data[i]["id"].toUpperCase()} (${
          data[i]["attributes"]["createdAt"]
        })`,
        canvas.width / 2,
        150 * (i % 5) + 250
      );
    }
  }

  const attachment = new AttachmentBuilder(canvas.toBuffer(), {
    name: "1.png",
  });
  await interaction.editReply({
    content: `**펍지 이스포츠 토너먼트 일정**`,
    files: [attachment],
  });
}

client.login(process.env.DISCORD_TOKEN);
