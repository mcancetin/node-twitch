export default class Game {
	#axiosInstance;
	constructor(axiosInstance) {
		this.#axiosInstance = axiosInstance;
	}

	async getTopGames({ first = 20 }) {
		try {
			const response = await this.#axiosInstance.get(
				`/games/top?first=${first}`
			);
			return response.data;
		} catch (error) {
			throw new Error(`Error while fetching top games: ${error.message}`);
		}
	}
}
