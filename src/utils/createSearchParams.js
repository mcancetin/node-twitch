export const createSearchParams = (params) => {
	const searchParams = new URLSearchParams();
	for (const key of Object.keys(params)) {
		if (params[key] !== undefined) {
			searchParams.append(key, params[key]);
		}
	}
	return searchParams;
};
