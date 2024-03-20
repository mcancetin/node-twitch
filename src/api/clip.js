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
	#axiosInstance;
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
			return response.data;
		} catch (error) {
			throw new Error(`Error while fetching clip: ${error.message}`);
		}
	}
}
