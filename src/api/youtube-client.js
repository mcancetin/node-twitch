import { google } from "googleapis";
import http from "http";
import open from "open";
import url from "url";

import fs from "fs";

export default class YoutubeClient {
	#oauth2Client;
	#authorizationUrl;
	constructor({ clientId, clientSecret, redirectUri }, scopes = []) {
		this.#oauth2Client = new google.auth.OAuth2(
			clientId,
			clientSecret,
			redirectUri
		);

		this.#authorizationUrl = this.#oauth2Client.generateAuthUrl({
			// 'online' (default) or 'offline' (gets refresh_token)
			access_type: "offline",
			/** Pass in the scopes array defined above.
			 * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
			scope: scopes,
			// Enable incremental authorization. Recommended as a best practice.
			include_granted_scopes: true
		});
	}

	async login() {
		const code = new Promise(async (resolve, reject) => {
			try {
				const server = http.createServer((request, response) => {
					const queryObject = url.parse(request.url, true).query;

					resolve(queryObject.code);
					server.close();
					response.end("You can now close this tab!");
				});

				server.listen(80);

				await open(this.#authorizationUrl);
			} catch (error) {
				reject(error);
			}
		});

		const { tokens } = await this.#oauth2Client.getToken(await code);
		this.#oauth2Client.setCredentials(tokens);

		return this.#oauth2Client;
	}

	async uploadVideo({ title, description, filePath }) {
		const youtube = google.youtube({
			version: "v3",
			auth: this.#oauth2Client
		});

		const res = await youtube.videos.insert({
			part: "id,snippet,status",
			requestBody: {
				snippet: {
					title,
					description
				},
				status: {
					privacyStatus: "public"
				}
			},
			media: {
				body: fs.createReadStream(filePath)
			}
		});
		console.log("Video uploaded!");
		return res;
	}
}
