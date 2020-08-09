<template>
	<ul class="nav flex-column bg-secondary">
		<div v-if="authenticated">
			<li class="nav-item">
				<router-link class="nav-link text-nowrap font-weight-bold" to="/graphs">{{ $t("graphs") }}</router-link>
			</li>
			<li class="nav-item">
				<router-link class="nav-link text-nowrap font-weight-bold" to="/config">{{ $t("config") }}</router-link>
			</li>
		</div>
		<li class="nav-item" v-else>
			<router-link class="nav-link text-nowrap font-weight-bold" to="/login">{{ $t("login") }}</router-link>
		</li>
		<div>
			<ui-button
				class="mr-2"
				size="small"
				v-for="(lang, index) in langs"
				:key="index"
				@click="changeLocale(lang.locale)"
				:color="selected(lang.locale)"
			>{{lang.name}}</ui-button>
		</div>
	</ul>
</template>

<script>
import i18n from "@/plugins/i18n";

export default {
	name: "Sidebar",
	data: () => ({
		langs: [
			{ name: "Français", locale: "fr" },
			{ name: "English", locale: "en" },
		],
	}),
	props: {
		authenticated: {
			type: Boolean,
			required: true,
		},
	},
	methods: {
		changeLocale(locale) {
			i18n.locale = locale;
		},
		selected(locale) {
			return i18n.locale == locale ? "primary" : "default";
		},
	},
};
</script>

<style lang="scss" scoped>
a {
	color: rgb(196, 195, 195);

	&:hover {
		color: rgba(255, 255, 255, 0.75);
	}
}

ul {
	box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.1);
}
</style>