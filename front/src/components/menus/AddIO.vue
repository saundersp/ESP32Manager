<template>
	<div class="row adding-pin">
		<div class="col-2">
			<p class="mt-2">{{name}}</p>
		</div>
		<div class="col">
			<ui-textbox v-model="bind.name" :minlength="1" :maxlength="10" :enforceMaxLength="true" />
		</div>
		<div class="col-2">
			<ui-select :options="options" v-model="bind.pin" />
		</div>
		<div class="col-2">
			<ui-icon-button type="secondary" icon="add" size="small" @click="callback()" />
		</div>
	</div>
</template>

<script>
export default {
	name: "AddIO",
	props: {
		name: {
			type: String,
			required: true,
		},
		bind: {
			type: Object,
			required: true,
		},
		options: {
			type: Array,
			required: true,
		},
		callback: {
			type: Function,
			required: true,
		},
	},
};
</script>

<style scoped>
.adding-pin {
	background-color: rgb(226, 213, 213, 0.6);
	margin-top: 2px;
	border: 0px white solid;
	border-radius: 7px;
}
</style>