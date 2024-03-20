let userModel = {
	id: "",
	login: "",
	display_name: "",
	type: "",
	broadcaster_type: "",
	description: "",
	profile_image_url: "",
	offline_image_url: "",
	email: "",
	created_at: ""
};

export default class User {
	#axiosInstance;
	constructor(axiosInstance) {
		this.#axiosInstance = axiosInstance;
	}

	// You can use with app access token or user access token
	async getUser({ username }) {
		if (!username) throw new Error("Username is required");
		try {
			const response = await this.#axiosInstance.get(
				`/users?login=${username}`
			);
			if (!response.data?.length)
				throw new Error(
					`There is no user with the username: ${username}`
				);
			userModel = Object.assign(userModel, response.data[0]);
			return userModel;
		} catch (error) {
			throw new Error(`Error while fetching user: ${error.message}`);
		}
	}

	// You can use with user access token
	async updateUser({ description }) {
		if (!description) throw new Error("Description is required");
		try {
			await this.#axiosInstance.put("/users", {
				description
			});
			console.log("User updated successfully");
		} catch (error) {
			throw new Error(`Error while updating user: ${error.message}`);
		}
	}

	// You can use with user access token
	async getUserBlockList({ broadcaster_id, first = 20, after = "" }) {
		if (!broadcaster_id) throw new Error("Broadcaster id is required");
		try {
			const response = await this.#axiosInstance.get(
				`/users/blocks?broadcaster_id=${broadcaster_id}&first=${first}&after=${after}`
			);
			return response.data;
		} catch (error) {
			throw new Error(
				`Error while fetching user block list: ${error.message}`
			);
		}
	}

	// You can use with user access token
	async blockUser({ target_user_id, source_context, reason }) {
		if (!target_user_id) throw new Error("Target user id is required");
		try {
			const response = await this.#axiosInstance.put("/users/blocks", {
				target_user_id,
				source_context,
				reason
			});
			console.log("User blocked successfully");
			return response.data;
		} catch (error) {
			throw new Error(`Error while blocking user: ${error.message}`);
		}
	}

	// You can use with user access token
	async unblockUser({ target_user_id }) {
		if (!target_user_id) throw new Error("Target user id is required");
		try {
			await this.#axiosInstance.delete(
				`/users/blocks?target_user_id=${target_user_id}`
			);
			console.log("User unblocked successfully");
		} catch (error) {
			throw new Error(`Error while unblocking user: ${error.message}`);
		}
	}

	// You can use with user access token
	async getUserExtensions() {
		try {
			const response = await this.#axiosInstance.get(
				`/users/extensions/list`
			);
			return response.data;
		} catch (error) {
			throw new Error(
				`Error while fetching user extensions: ${error.message}`
			);
		}
	}

	// You can use with app access token or user access token
	async getUserActiveExtensions({ user_id }) {
		try {
			const response = await this.#axiosInstance.get(
				`/users/extensions?user_id=${user_id}`
			);
			return response.data;
		} catch (error) {
			throw new Error(
				`Error while fetching user active extensions: ${error.message}`
			);
		}
	}
}
