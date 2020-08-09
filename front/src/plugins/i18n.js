import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

export default new VueI18n({
	locale: 'fr',
	fallbackLocale: 'en',
	messages: {
		en: {
			graphs: "Graphs",
			config: "Configuration",
			login: "Login",
			logout: "Logout",
			footer: "IOT Project 2020 - MIAGE M1",
			notfound: "Page not found",
			// Login.vue
			user: "User",
			invalidUser: "Invalid user",
			password: "Password",
			invalidPassword: "Invalid password",
			invalidInfos: "Invalid informations !",
			// Graphs.vue
			nographs: "No data saved in the database",
			card: "Card",
			anomaly: "Anomaly",
			// Configuration.vue
			esp32list: "List of saved ESP32",
			printDebugMessage: "Print debug message",
			lookAtSerial: "Look at the serial monitors of your ESP32",
			// ESP32Adder.vue
			addESP32: "Add",
			addESP32Title: "Add ESP",
			lastActivity: "Last activity",
			addToFleet: "Add to the fleet",
			// TableESP32.vue
			configESP: "Configure the ESP",
			// TableIO.vue
			name: "Name",
			pin: "Pin",
			// ConfigESP.vue
			leds: "Leds",
			sensors: "Sensors",
			mother: "Mother",
			updateTime: "Update time",
			save: "Save",
			saved: "Saved !",
			noNameLedError: "A led must have a name !",
			noNameSensError: "A sensor must have a name !",
		},
		fr: {
			graphs: "Graphiques",
			config: "Configuration",
			login: "Connexion",
			logout: "Déconnexion",
			footer: "Projet IOT 2020 - MIAGE M1",
			notfound: "Page non trouvée",
			// Login.vue
			user: "Utilisateur",
			invalidUser: "Utilisateur invalide",
			password: "Mot de passe",
			invalidPassword: "Mot de passe invalide",
			invalidInfos: "Informations invalide !",
			// Graphs.vue
			nographs: "Aucune données enregistrée dans la base",
			card: "Carte",
			anomaly: "Panne",
			// Configuration.vue
			esp32list: "Liste des ESP32 enregistrées",
			printDebugMessage: "Afficher message debug",
			lookAtSerial: "Regardez les serial monitor de vos ESP32",
			// ESP32Adder.vue
			addESP32: "Ajouter",
			addESP32Title: "Ajouter ESP",
			lastActivity: "Dernière activitée",
			addToFleet: "Ajouter à la flotte",
			// TableESP32.vue
			configESP: "Configurer l'ESP",
			// TableIO.vue
			name: "Nom",
			pin: "Pin",
			// ConfigESP.vue
			leds: "Leds",
			sensors: "Capteurs",
			mother: "Mère",
			updateTime: "Mise à jour",
			save: "Sauvegarder",
			saved: "Sauvegardée !",
			noNameLedError: "Une led doit avoir un nom !",
			noNameSensError: "Un capteur doit avoir un nom !",
		}
	}
});