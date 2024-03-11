import axios from "axios";
import User from "./user.js";
import Clip from "./clip.js";

const BASE_URL = "https://api.twitch.tv/helix";
const AUTH_URL = "https://id.twitch.tv/oauth2/token";

export default class Client {
	constructor(client_id, client_secret) {
		this.client_id = client_id;
		this.client_secret = client_secret;
		this.instance = axios.create();
	}

	async login() {
		try {
			const res = await axios.post(AUTH_URL, {
				client_id: this.client_id,
				client_secret: this.client_secret,
				grant_type: "client_credentials"
			});

			this.instance.defaults.baseURL = BASE_URL;
			this.instance.defaults.headers.common["Client-Id"] = this.client_id;
			this.instance.defaults.headers.common[
				"Authorization"
			] = `Bearer ${res.data.access_token}`;

			this._initServices();
		} catch (error) {
			console.error("Login failed:", error);
		}
	}

	_initServices() {
		this.userService = new User(this.instance);
		this.clipService = new Clip(this.instance);
	}
}
