import Client from "./src/api/client.js";
import Downloader from "./src/api/downloader.js";

import fs from "fs";
import path from "path";

const downloader = new Downloader();

const client = new Client(
	"dea4e38o9b01z0hxj5fujulh64ehid",
	"zpcizsrdg0qgo50dfsflavkdzzi1vo"
);
console.log("Client created");

await client.login({ method: client.loginType.CLIENT_CREDENTIALS });
console.log("Client logged in");

const { clipService } = client;

const games = [
	{
		id: "32399",
		name: "Counter-Strike",
		box_art_url:
			"https://static-cdn.jtvnw.net/ttv-boxart/32399-{width}x{height}.jpg",
		igdb_id: ""
	},
	{
		id: "32982",
		name: "Grand Theft Auto V",
		box_art_url:
			"https://static-cdn.jtvnw.net/ttv-boxart/32982_IGDB-{width}x{height}.jpg",
		igdb_id: "1020"
	},
	{
		id: "21779",
		name: "League of Legends",
		box_art_url:
			"https://static-cdn.jtvnw.net/ttv-boxart/21779-{width}x{height}.jpg",
		igdb_id: "115"
	},
	{
		id: "516575",
		name: "VALORANT",
		box_art_url:
			"https://static-cdn.jtvnw.net/ttv-boxart/516575-{width}x{height}.jpg",
		igdb_id: "126459"
	},
	{
		id: "29595",
		name: "Dota 2",
		box_art_url:
			"https://static-cdn.jtvnw.net/ttv-boxart/29595-{width}x{height}.jpg",
		igdb_id: ""
	},
	{
		id: "33214",
		name: "Fortnite",
		box_art_url:
			"https://static-cdn.jtvnw.net/ttv-boxart/33214-{width}x{height}.jpg",
		igdb_id: "1905"
	}
];

const today = new Date();
today.setHours(0, 0, 0, 0);

const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const lolClips = await clipService.getClips({
	game_id: "21779",
	ended_at: today.toISOString(),
	started_at: yesterday.toISOString(),
	is_featured: true,
	first: 1
});
console.log("Clips fetched");

const filteredClips = lolClips.filter((clip) => clip.language === "en");
console.log("Clips filtered");
const clipsFolderPath = path.join(
	new URL(".", import.meta.url).pathname,
	"clips"
);
console.log("Clips folder path created");

if (!fs.existsSync(clipsFolderPath)) {
	fs.mkdirSync(clipsFolderPath);
} else {
	fs.readdirSync(clipsFolderPath).forEach((file) => {
		fs.unlinkSync(path.join(clipsFolderPath, file));
	});
}

console.log("Clips folder cleaned");

const clips = await clipService.getClipsUrl(filteredClips);

for (const clip of clips) {
	await downloader.downloadClip(clip, clipsFolderPath);
}
console.log("Clips downloaded successfully");
// mergeVideos(clipsFolderPath, "output.mp4");
