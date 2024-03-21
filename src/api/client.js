import axios from "axios";

import Auth from "./auth.js";
import User from "./user.js";
import Clip from "./clip.js";
import Game from "./game.js";

const TWITCH_BASE_URL = "https://api.twitch.tv/helix";

export default class Client {
	#authService;
	#axiosInstance;
	#accessToken;
	#refreshToken;
	loginType = Object.freeze({
		CLIENT_CREDENTIALS: "clientCredentials",
		AUTHORIZATION_CODE: "authorizationCode"
	});

	constructor(clientId, clientSecret) {
		this.#authService = new Auth(clientId, clientSecret);
		this.#axiosInstance = axios.create({
			baseURL: TWITCH_BASE_URL,
			headers: {
				"Client-Id": clientId,
				"Content-Type": "application/json"
			}
		});

		this.#axiosInstance.interceptors.response.use(
			(response) => response.data,
			async (error) => {
				if (error.response.status === 401) {
					await this.#authService.refreshToken();
					return this.#axiosInstance(error.config);
				}
				return Promise.reject(error);
			}
		);
	}

	// method can be "clientCredentials" or "authorizationCode". Default method is client credentials. If method is "authorizationCode", scope is required
	async login({ method, scope = "" }) {
		if (method === this.loginType.AUTHORIZATION_CODE && !scope)
			throw new Error("Scope is required");
		const { accessToken, refreshToken } = await this.#authService[method]({
			scope
		});
		this.#setAuthHeaders(accessToken, refreshToken);
		console.log("Logged in");
		this.#initServices();
		console.log("Services initialized");
	}

	#setAuthHeaders(accessToken, refreshToken = null) {
		this.#accessToken = accessToken;
		this.#refreshToken = refreshToken;

		this.#axiosInstance.defaults.headers.common[
			"Authorization"
		] = `Bearer ${accessToken}`;
	}

	#initServices() {
		this.userService = new User(this.#axiosInstance);
		this.clipService = new Clip(this.#axiosInstance);
		this.gameService = new Game(this.#axiosInstance);
	}
}
