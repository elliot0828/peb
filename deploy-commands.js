const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
require("dotenv").config();

const clientId = "1302962718017454171"; // Discord 애플리케이션 ID
const token = process.env.DISCORD_TOKEN;

// Slash 명령어 정의
const commands = [
  new SlashCommandBuilder()
    .setName("링크")
    .setDescription("펍지 이스포츠 공식 SNS & 라이브 채널 링크"),
  new SlashCommandBuilder()
    .setName("tp")
    .setDescription("PUBG Players Tour TP 조회 기능"),
  new SlashCommandBuilder()
    .setName("부가서비스")
    .setDescription("펍지 이스포츠를 더욱 즐기기 위한 부가서비스"),
  new SlashCommandBuilder()
    .setName("토너먼트일정")
    .setDescription("최근 30일 내에 진행된 펍지 이스포츠 토너먼트 일정"),
  new SlashCommandBuilder()
    .setName("일반전전적")
    .setDescription("일반전 전적 검색 기능")
    .addStringOption((option) =>
      option
        .setName("닉네임")
        .setDescription("PUBG 닉네임 (대소문자 구분)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("플랫폼")
        .setDescription("PUBG를 플레이하는 플랫폼을 선택해 주세요")
        .addChoices(
          { name: "스팀", value: "steam" },
          { name: "카카오", value: "kakao" },
          { name: "에픽게임즈", value: "steam" },
          { name: "엑스박스", value: "xbox" },
          { name: "플레이스테이션", value: "psn" }
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("모드")
        .setDescription("PUBG 일반전 전적을 검색할 게임 모드를 선택해 주세요")
        .addChoices(
          { name: "솔로", value: "solo" },
          { name: "듀오", value: "duo" },
          { name: "스쿼드", value: "squad" },
          { name: "1인칭솔로", value: "solo-fpp" },
          { name: "1인칭듀오", value: "duo-fpp" },
          { name: "1인칭스쿼드", value: "squad-fpp" }
        )
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("시즌")
        .setDescription("검색할 시즌을 골라주세요")
        .addChoices()
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("경쟁전전적")
    .setDescription("경쟁전 전적 검색 기능")
    .addStringOption((option) =>
      option
        .setName("플랫폼")
        .setDescription("PUBG를 플레이하는 플랫폼을 선택해 주세요")
        .addChoices(
          { name: "스팀", value: "steam" },
          { name: "카카오", value: "kakao" },
          { name: "에픽게임즈", value: "steam" },
          { name: "엑스박스", value: "xbox" },
          { name: "플레이스테이션", value: "psn" }
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("닉네임")
        .setDescription("PUBG 닉네임 (대소문자 구분)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("모드")
        .setDescription("PUBG 일반전 전적을 검색할 게임 모드를 선택해 주세요")
        .addChoices(
          { name: "솔로", value: "solo" },

          { name: "스쿼드", value: "squad" },
          { name: "1인칭솔로", value: "solo-fpp" },

          { name: "1인칭스쿼드", value: "squad-fpp" }
        )
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("시즌")
        .setDescription("검색할 시즌을 골라주세요")
        .addChoices()
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("계정제재내역")
    .setDescription("계정 제재 내역 확인")
    .addStringOption((option) =>
      option
        .setName("닉네임")
        .setDescription("PUBG 닉네임 (대소문자 구분)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("플랫폼")
        .setDescription("PUBG를 플레이하는 플랫폼을 선택해 주세요")
        .addChoices(
          { name: "스팀", value: "steam" },
          { name: "카카오", value: "kakao" },
          { name: "에픽게임즈", value: "steam" },
          { name: "엑스박스", value: "xbox" },
          { name: "플레이스테이션", value: "psn" }
        )
        .setRequired(true)
    ),
].map((command) => command.toJSON()); // Discord API에 적합한 JSON 형태로 변환

let seasonnum = null;
get_season();
function get_season() {
  let seasons = fetch(`https://api.pubg.com/shards/steam/seasons`, {
    headers: {
      accept: "application/vnd.api+json",
      Authorization: `Bearer ${process.env.APIKEY}`,
    },
  });
  seasons
    .then((response) => response.json())
    .then((data) => find_seasonid(data))
    .catch((err) => console.log(err));
}
function find_seasonid(seasons) {
  let seasonid = null;
  for (let j = 0; j < seasons["data"].length; j++) {
    if (seasons["data"][j]["attributes"]["isCurrentSeason"] == true) {
      seasonid = seasons["data"][j]["id"];
    }
  }
  seasonnum = `${seasonid[seasonid.length - 2]}${
    seasonid[seasonid.length - 1]
  }`;
  for (let i = Number(seasonnum); i >= 10; i--) {
    let options = {
      name: `시즌 ${i}`,
      value: i,
    };
    commands[4]["options"][3]["choices"].push(options);
    commands[5]["options"][3]["choices"].push(options);
  }

  // console.log(commands[0]["options"][3]["choices"]);
  console.log(seasonnum);
  deploy();
}
function deploy() {
  // Discord REST API 초기화
  const rest = new REST({ version: "9" }).setToken(token);

  (async () => {
    try {
      console.log("Started refreshing global application (/) commands.");

      // 글로벌 명령어 등록
      await rest.put(Routes.applicationCommands(clientId), { body: commands });

      console.log("Successfully registered global application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  })();
}
