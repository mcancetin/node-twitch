import { createSearchParams } from "../utils/createSearchParams.js";

const searchParams = {
	broadcaster_id: "",
	first: "",
	after: "",
	before: "",
	started_at: "",
	ended_at: "",
	is_featured: ""
};

export default class Clip {
	constructor(axiosInstance) {
		this.axiosInstance = axiosInstance;
		this.clips = [];
	}

	async getClips(params = searchParams) {
		const searchParams = createSearchParams(params);
		try {
			const response = await this.axiosInstance.get(
				`/clips?${searchParams}`
			);
			if (!response.data?.data.length)
				throw new Error(`There is no clip with the given parameters.`);

			this.clips = response.data.data;
			return this.clips;
		} catch (error) {
			throw new Error(`Error while fetching clip: ${error.message}`);
		}
	}
}
