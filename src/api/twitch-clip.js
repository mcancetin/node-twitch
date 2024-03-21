import { createSearchParams } from "../utils/createSearchParams.js";

import puppeteer from "puppeteer";

const searchParams = {
	broadcaster_id: "",
	game_id: "",
	first: "",
	after: "",
	before: "",
	started_at: "",
	ended_at: "",
	is_featured: ""
};

export default class Clip {
	#axiosInstance;
	clips = [];
	constructor(axiosInstance) {
		this.#axiosInstance = axiosInstance;
	}

	async getClips(params = searchParams) {
		const searchParams = createSearchParams(params);
		try {
			const response = await this.#axiosInstance.get(
				`/clips?${searchParams}`
			);

			if (response.data.length === 0) {
				throw new Error("There is no clip with the given parameters");
			}
			this.clips = response.data;
			return this.clips;
		} catch (error) {
			throw new Error(`Error while fetching clip: ${error.message}`);
		}
	}

	async getClipsUrl() {
		const urls = [];

		for (const clip of this.clips) {
			console.log("Getting clip url for", clip.title);
			const src = await puppeteer.launch().then(async (browser) => {
				const page = await browser.newPage();
				await page.goto(clip.url);
				const src = await page.evaluate(
					() => document.querySelector("video").src
				);
				await browser.close();
				return src;
			});
			urls.push({ ...clip, url: src });
		}

		return urls;
	}
}
