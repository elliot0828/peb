let tournamentIds = [];
let apikey =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJlYTU4NzE5MC0xYmZlLTAxM2MtOGM0Mi0wNmEwODIyNTEzYWQiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNjkxOTI4MDI2LCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6Ii0yOTEyNDU0OC03OTVmLTQzYmItYmRlMi1mYjkxYjM3NWNhMmUifQ.Z8v6NPvr7ee_coJvrxJ6oIUsmD0GVCiOU-NIavOWCG8";

let data = fetch(`https://api.pubg.com/tournaments/`, {
  headers: {
    accept: "application/vnd.api+json",
    Authorization: `Bearer ${apikey}`,
  },
});
data
  .then((response) => response.json())
  .then((data) => get_tournaments(data))

  .catch((err) => console.log(err));

function get_tournaments(data) {
  let today = new Date();
  let recent_tournaments = [];
  for (let i = 0; i < data["data"].length; i++) {
    let isoString = new Date(data["data"][i]["attributes"]["createdAt"]);
    const year = isoString.getFullYear();
    const month = isoString.getMonth() + 1;
    const day = isoString.getDate();
    const differenceInMilliseconds = today - isoString;
    const differenceInDays = Math.floor(
      differenceInMilliseconds / (1000 * 60 * 60 * 24)
    );
    if (differenceInDays <= 30) {
      recent_tournaments.push(data["data"][i]);
    }
    data["data"][i]["attributes"][
      "createdAt"
    ] = `${year}년 ${month}월 ${day}일`;
  }
  render_tournaments(recent_tournaments);
  console.log(recent_tournaments);
}
