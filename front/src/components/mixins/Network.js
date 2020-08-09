const backAddress = "http://192.168.137.1:5332";
export default {
	get: url => fetch(`${backAddress}/${url}`),
	put: url => fetch(`${backAddress}/${url}`, {
		method: "put"
	}),
	post: (url, body) => fetch(`${backAddress}/${url}`, {
		method: "post",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json"
		},
		body
	}),
	delete: (url, body) => fetch(`${backAddress}/${url}`, {
		method: "delete",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json"
		},
		body
	})
};