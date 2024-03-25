import moment from "moment";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const defaultStartDate = moment().set({
	hour: 0,
	minute: 0,
	second: 0,
	millisecond: 0
});

export const dateRangeGenerator = ({
	startDate = defaultStartDate,
	range = 1
}) => {
	return [
		startDate.toISOString(),
		startDate.clone().subtract(range, "days").toISOString()
	];
};

export const createSearchParams = (params) => {
	const searchParams = new URLSearchParams();
	for (const key of Object.keys(params)) {
		if (params[key] !== undefined) {
			searchParams.append(key, params[key]);
		}
	}
	return searchParams;
};

function execShellCommand(cmd) {
	return new Promise((resolve, reject) => {
		exec(cmd, (error, stdout, stderr) => {
			if (error) {
				reject(error);
			} else {
				resolve(stdout ? stdout : stderr);
			}
		});
	});
}

async function concatClips(clipsFolderPath, inputFileName, outputFileName) {
	const command = `ffmpeg -f concat -safe 0 -i ${clipsFolderPath}/${inputFileName} -c copy ${clipsFolderPath}/${outputFileName}`;

	exec(command, (error, stdout, stderr) => {
		if (error) {
			console.log(error);
			return;
		}
	});
}

export async function formatClips(inputs, clipsFolderPath) {
	const inputPaths = inputs.map((file) => `${clipsFolderPath}/${file}`);
	const formattedFiles = [];
	for (const input of inputPaths) {
		const output = input.replace(/\.[^.]+$/, "_formatted.mp4"); // Dönüştürülmüş dosya adı
		try {
			await execShellCommand(
				`ffmpeg -i ${input} -vf "scale=1920:1080" -r 30 -af "aformat=sample_rates=44100:channel_layouts=stereo" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k ${output}`
			);
			fs.unlinkSync(input);
			formattedFiles.push(output);
		} catch (error) {
			console.log(error);
		}
	}

	fs.writeFileSync(
		path.join(clipsFolderPath, "formatted.txt"),
		formattedFiles.map((file) => `file '${file}'`).join("\n")
	);

	concatClips(clipsFolderPath, "formatted.txt", "output.mp4");
}
