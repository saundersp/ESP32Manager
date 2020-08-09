<template>
	<div id="app" class="bg-light">
		<Navbar :authenticated.sync="authenticated" />
		<div class="container-fluid">
			<div class="row" style="min-height:600px">
				<Sidebar :authenticated="authenticated" class="col-2" />
				<router-view :authenticated.sync="authenticated" class="col-10" />
			</div>
		</div>
		<Footer />
	</div>
</template>

<script>
import Sidebar from "./components/Sidebar.vue";
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
import auth from "./components/mixins/Authentification.js";

export default {
	name: "App",
	components: { Navbar, Footer, Sidebar },
	data: () => ({ authenticated: false }),
	beforeMount() {
		if (auth.getUserFromToken() || auth.isLogged()) this.authenticated = true;
	},
};
</script>

<style>
div#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	font-size: 100%;
	width: 100%;
	height: 100%;
	position: absolute;
	padding: 0;
	margin: 0;
}

/* For Keen UI */
*,
*::before,
*::after {
	box-sizing: border-box;
}
</style>
