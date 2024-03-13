import axios from "axios";

import Auth from "./auth.js";
import User from "./user.js";
import Clip from "./clip.js";

const TWITCH_BASE_URL = "https://api.twitch.tv/helix";

export default class Client {
	constructor(clientId, clientSecret) {
		this.authService = new Auth(clientId, clientSecret);
		this.axiosInstance = axios.create({
			baseURL: TWITCH_BASE_URL,
			headers: {
				"Client-Id": this.clientId
			}
		});

		this.axiosInstance.interceptors.response.use(
			(response) => response.data,
			async (error) => {
				if (error.response.status === 401) {
					await this.authService.refreshToken();
					return this.axiosInstance(error.config);
				}
				return Promise.reject(error);
			}
		);
	}

	// method can be "clientCredentials" or "authorizationCode". Default method is client credentials. If method is "authorizationCode", scope is required
	async login({
		method = this.authService.loginType.CLIENT_CREDENTIALS,
		scope = ""
	}) {
		if (method === this.authService.loginType.AUTHORIZATION_CODE && !scope)
			throw new Error("Scope is required");
		const { accessToken, refreshToken } = await this.authService[method]({
			scope
		});
		this.#setAuthHeaders(accessToken, refreshToken);
		this.#initServices();
		console.log("Logged in");
	}

	#setAuthHeaders(access_token, refresh_token = null) {
		this.access_token = access_token;
		this.refresh_token = refresh_token;

		this.axiosInstance.defaults.headers.common[
			"Authorization"
		] = `Bearer ${access_token}`;
	}

	#initServices() {
		this.userService = new User(this.axiosInstance);
		this.clipService = new Clip(this.axiosInstance);
	}
}
