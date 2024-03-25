import Client from "./src/api/twicth-client.js";
import Downloader from "./src/api/downloader.js";

import fs from "fs";
import path from "path";

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { dateRangeGenerator, formatClips } from "./src/utils/index.js";
import YoutubeClient from "./src/api/youtube-client.js";

const downloader = new Downloader();

const client = new Client(
	process.env.TWITCH_CLIENT_ID,
	process.env.TWITCH_CLIENT_SECRET
);

await client.login({ method: client.loginType.CLIENT_CREDENTIALS });

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

const [ended_at, started_at] = dateRangeGenerator({ range: 1 });

const lolClips = await clipService.getClips({
	game_id: "21779",
	ended_at: ended_at,
	started_at: started_at,
	is_featured: true,
	first: 5
});

const filteredClips = lolClips.filter((clip) => clip.language);

const clipsFolderPath = path.join(
	new URL(".", import.meta.url).pathname,
	"clips"
);

if (!fs.existsSync(clipsFolderPath)) {
	fs.mkdirSync(clipsFolderPath);
} else {
	fs.readdirSync(clipsFolderPath).forEach((file) => {
		fs.unlinkSync(path.join(clipsFolderPath, file));
	});
}

const clips = await clipService.getClipsUrl(filteredClips);

for (const clip of clips) {
	await downloader.downloadClip(clip, clipsFolderPath);
}

const inputs = fs.readdirSync(clipsFolderPath);

await formatClips(inputs, clipsFolderPath);

const youtubeClient = new YoutubeClient(
	{
		clientId: process.env.YOUTUBE_CLIENT_ID,
		clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
		redirectUri: process.env.YOUTUBE_REDIRECT_URI
	},
	["https://www.googleapis.com/auth/youtube.upload"]
);

await youtubeClient.login();

const mostViewedClip = clips.reduce((prev, current) =>
	prev.views > current.views ? prev : current
);

const title = `${mostViewedClip.title} Best of LoL Highlights`;

const description = clips
	.map((clip) => `https://www.twitch.tv/${clip.broadcaster_name}`)
	.join("\n");

console.log(title, description);

await youtubeClient.uploadVideo({
	filePath: `${clipsFolderPath}/output.mp4`,
	title,
	description
});
