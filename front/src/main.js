import Vue from 'vue';
import VueRouter from 'vue-router';
import i18n from '@/plugins/i18n';
import App from './App.vue';
import KeenUI from 'keen-ui';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'keen-ui/dist/keen-ui.css';

import Configuration from "./components/menus/Configuration.vue";
import Login from "./components/menus/Login.vue";
import Graphs from "./components/menus/Graphs.vue";
import NotFound from "./components/menus/NotFound.vue";
import auth from "./components/mixins/Authentification.js";

Vue.use(KeenUI);
Vue.use(VueRouter);
//Vue.config.productionTip = false;

const router = new VueRouter({
	routes: [{
			alias: "/",
			path: "/login",
			name: "Login",
			component: Login
		}, {
			path: "/config",
			name: "Config",
			component: Configuration,
			meta: {
				requiresAuth: true
			}
		}, {
			path: "/graphs",
			name: "Graphs",
			component: Graphs,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: "*",
			name: "NotFound",
			component: NotFound
		}
	],
	mode: "history"
});

router.beforeEach((to, _, next) => {
	if (to.name == 'Login' || to.name == 'NotFound' ||
		to.meta.requiresAuth && auth.isLogged()) {
		next();
	} else {
		next({
			name: "Login"
		});
	}
});

new Vue({
	router,
	i18n,
	render: h => h(App)
}).$mount('#app');