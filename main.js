import Client from "./src/api/client.js";

const client = new Client(
	"dea4e38o9b01z0hxj5fujulh64ehid",
	"zpcizsrdg0qgo50dfsflavkdzzi1vo"
);
await client.login();

const { userService, clipService } = client;

const user = await userService.getUser("wtcn");
const clips = await clipService.getClips({ broadcaster_id: user.id });
console.log(clips);
