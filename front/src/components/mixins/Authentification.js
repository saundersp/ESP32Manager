import network from './Network.js';

const loggedUsers = [];
const itemName = "token";

export default {
	async login(usr, pwd) {
		try {
			const jsn = await (
				await network.post("login", `{ "user": "${usr}", "pwd": "${pwd}" }`)
			).json();
			if (jsn.statusCode == 200) {
				loggedUsers.push(jsn.token);
				localStorage.setItem(itemName, jsn.token);
				return true;
			}
		} catch (error) {
			console.error("login error", error);
		}
		return false;
	},
	isLogged() {
		const token = localStorage.getItem(itemName);
		if (!token)
			return false;
		return loggedUsers.indexOf(token) != -1;
	},
	logout() {
		const token = localStorage.getItem(itemName);
		if (token == null)
			return false;
		loggedUsers.splice(loggedUsers.indexOf(token), 1);
		localStorage.removeItem(itemName);
		return true;
	},
	getUserFromToken() {
		const token = localStorage.getItem(itemName);
		if (token == null)
			return false;
		console.info("getUserFromToken to be implemented !");
		loggedUsers.push(token);
		return true;
	}
};