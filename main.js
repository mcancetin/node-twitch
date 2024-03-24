import { exec } from "child_process";
import Client from "./src/api/client.js";
import Downloader from "./src/api/downloader.js";
import humanizeDuration from "humanize-duration";

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
	first: 2
});
console.log("Clips fetched");

console.log(lolClips);

const filteredClips = lolClips.filter((clip) => clip.language === "en");
console.log(
	"Clips filtered",
	filteredClips.reduce((acc, clip) => acc + clip.duration, 0) / 60
);

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
	await downloader.downloadClip(clip, clipsFolderPath, (videoName) => {
		const output = videoName.replace(/\.[^.]+$/, "_formatted.mp4"); // Dönüştürülmüş dosya adı
		exec(
			`ffmpeg -i ${videoName} -vf "scale=1920:1080" -r 30 -af "aformat=sample_rates=44100:channel_layouts=stereo" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k ${output}`,
			(error, stdout, stderr) => {
				if (error) {
					console.error(`exec error: ${error}`);
					return;
				}
				fs.unlinkSync(videoName);
				fs.appendFileSync(
					path.join(clipsFolderPath, "formatted.txt"),
					`file '${output}'\n`
				);
			}
		);
	});
}
console.log("Clips downloaded successfully");

const inputs = fs
	.readdirSync(clipsFolderPath)
	.map((file) => `${clipsFolderPath}/${file}`);

async function formatClips(inputs) {
	const formattedFiles = [];
	for (const input of inputs) {
		const output = input.replace(/\.[^.]+$/, "_formatted.mp4"); // Dönüştürülmüş dosya adı
		try {
			await execShellCommand(
				`ffmpeg -i ${input} -vf "scale=1920:1080" -r 30 -af "aformat=sample_rates=44100:channel_layouts=stereo" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k ${output}`
			);
			fs.unlinkSync(input);
			formattedFiles.push(output);
		} catch (error) {
			console.error(error);
		}
	}

	fs.writeFileSync(
		path.join(clipsFolderPath, "formatted.txt"),
		formattedFiles.map((file) => `file '${file}'`).join("\n")
	);

	// Tüm dosyaların biçimlendirilmesi tamamlandıktan sonra concatClips'i çağır
	concatClips(formattedFiles);
}

async function concatClips(inputs) {
	const command = `ffmpeg -f concat -safe 0 -i ${clipsFolderPath}/formatted.txt -c copy ${clipsFolderPath}/output.mp4`;

	exec(command, (error, stdout, stderr) => {
		if (error) {
			console.error(`exec error: ${error}`);
			return;
		}
	});
}

function execShellCommand(cmd) {
	return new Promise((resolve, reject) => {
		exec(cmd, (error, stdout, stderr) => {
			if (error) {
				console.warn(error);
				reject(error);
			} else {
				resolve(stdout ? stdout : stderr);
			}
		});
	});
}

await formatClips(inputs);
