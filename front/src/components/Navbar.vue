<template>
	<nav class="navbar navbar-dark p-0 bg-dark">
		<a class="brandlogo navbar-brand px-3" href="#">
			<img src="@/assets/logo.png" width="50" height="35" />
			Esp32Manager
		</a>
		<ul class="navbar-nav" v-if="authenticated">
			<li class="nav-item px-4">
				<router-link class="nav-link" to="/login">
					<a @click="logout">{{ $t('logout') }}</a>
				</router-link>
			</li>
		</ul>
	</nav>
</template>

<script>
import auth from "./mixins/Authentification.js";
export default {
	name: "Navbar",
	props: {
		authenticated: {
			type: Boolean,
			required: true,
		},
	},
	methods: {
		logout() {
			if (auth.logout()) this.$emit("update:authenticated", false);
		},
	},
};
</script>

<style scoped>
.brandlogo {
	padding: 0.5em 0;
	margin-left: 1em;
}
</style>