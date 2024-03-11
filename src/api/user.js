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
	constructor(axiosInstance) {
		this.axiosInstance = axiosInstance;
	}

	async getUser(userName = "") {
		try {
			const response = await this.axiosInstance.get(
				`/users?login=${userName}`
			);
			if (!response.data?.data.length)
				throw new Error(
					`There is no user with the username: ${userName}`
				);
			userModel = Object.assign(userModel, response.data.data[0]);
			return userModel;
		} catch (error) {
			throw new Error(`Error while fetching user: ${error.message}`);
		}
	}
}
