import axios from "axios";
import open from "open";
import http from "http";
import url from "url";

const TWITCH_AUTH_URL = "https://id.twitch.tv/oauth2/token";

export default class Auth {
	constructor(clientId, clientSecret) {
		this.clientId = clientId;
		this.clientSecret = clientSecret;
	}

	async clientCredentials() {
		try {
			const response = await axios.post(TWITCH_AUTH_URL, {
				client_id: this.clientId,
				client_secret: this.clientSecret,
				grant_type: "client_credentials"
			});
			return {
				accessToken: response.data.access_token,
				refreshToken: null
			};
		} catch (error) {
			throw new Error("Login failed:", error);
		}
	}

	async authorizationCode({ scope = "" }) {
		if (!scope) throw new Error("Scope is required");
		const code = new Promise(async (resolve, reject) => {
			try {
				const server = http.createServer((request, response) => {
					const queryObject = url.parse(request.url, true).query;

					resolve(queryObject.code);
					server.close();
					response.end("You can now close this tab!");
				});

				server.listen(80);

				const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${this.clientId}&redirect_uri=http://localhost&response_type=code&scope=${scope}`;
				await open(authUrl);
			} catch (error) {
				reject(error);
			}
		});

		const response = await axios.post(TWITCH_AUTH_URL, {
			client_id: this.clientId,
			client_secret: this.clientSecret,
			grant_type: "authorization_code",
			code: await code,
			redirect_uri: "http://localhost"
		});

		return {
			accessToken: response.data.access_token,
			refreshToken: response.data.refresh_token
		};
	}

	async refreshToken() {
		// ... (refresh token logic)
	}
}
