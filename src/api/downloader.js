import fs from "fs";
import path from "path";
import axios from "axios";

export default class Downloader {
	async downloadClip(clip, clipsFolderPath) {
		const res = await axios.get(clip.url, { responseType: "stream" });

		const videoName = `${clip.broadcaster_name}-${clip.title
			.replace(/\s+/g, "-")
			.toLowerCase()}`;

		const writeStream = fs.createWriteStream(
			path.join(clipsFolderPath, `${videoName}.mp4`)
		);
		res.data.pipe(writeStream);

		return new Promise((resolve, reject) => {
			writeStream.on("finish", () => {
				console.log(`Video downloaded to clips folder`);
				resolve();
			});

			writeStream.on("error", (error) => {
				console.error("Error writing video to file:", error);
				reject(error);
			});
		});
	}
}
