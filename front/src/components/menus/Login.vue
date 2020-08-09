<template>
	<div>
		<h1 class="p-3 mb-5">{{ $t("login") }}</h1>
		<div class="container col-2">
			<div class="row justify-content-center">
				<label for="user" class="col text-center">{{ $t("user") }}</label>
				<ui-textbox
					class="col"
					name="user"
					v-model="user"
					:required="true"
					:minLength="4"
					:maxLength="20"
					:autofocus="true"
					:enforceMaxlength="true"
					:invalid="!isValidUser"
					:error="$t('invalidUser')"
					@keydown-enter="submitForm"
				/>
			</div>
			<div class="row justify-content-center">
				<label for="pwd" class="col text-center">{{ $t("password") }}</label>
				<ui-textbox
					class="col"
					name="pwd"
					v-model="pwd"
					:required="true"
					:minLength="4"
					:maxLength="20"
					type="password"
					:enforceMaxlength="true"
					:invalid="!isValidPwd"
					:error="$t('invalidPassword')"
					@keydown-enter="submitForm"
				/>
			</div>
			<div class="row justify-content-center">
				<ui-button @click="submitForm" :loading="loading">{{ $t("login") }}</ui-button>
			</div>
			<ui-alert
				class="row mt-3"
				v-if="invalidLogins"
				type="error"
				@dismiss="invalidLogins=false"
			>{{ $t('invalidInfos') }}</ui-alert>
		</div>
	</div>
</template>

<script>
import auth from "./../mixins/Authentification.js";

export default {
	name: "Login",
	data: () => ({
		user: "admin", //"",
		pwd: "password", //"",
		isValidUser: true,
		isValidPwd: true,
		invalidLogins: false,
		loading: false,
	}),
	props: {
		authenticated: {
			type: Boolean,
			required: true,
		},
	},
	methods: {
		validateUser() {
			return (this.isValidUser =
				this.user.length >= 4 &&
				this.user.length <= 20 &&
				this.user.match(/[A-Za-z0-9]/g).length == this.user.length);
		},
		validatePwd() {
			return (this.isValidPwd =
				this.pwd.length >= 4 &&
				this.pwd.length <= 20 &&
				this.pwd.match(/[A-Za-z0-9]/g).length == this.pwd.length);
		},
		async submitForm() {
			if (this.validateUser() && this.validatePwd()) {
				this.loading = true;
				if (await auth.login(this.user, this.pwd)) {
					this.logged();
				} else {
					this.invalidLogins = true;
				}
				this.loading = false;
			} else console.warn("Informations invalide !");
		},
		logged() {
			this.$emit("update:authenticated", true);
			this.$router.replace({ name: "Graphs" });
		},
	},
	mounted() {
		if (auth.isLogged()) this.logged();
	},
};
</script>