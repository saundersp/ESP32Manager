<template>
	<table class="table">
		<thead>
			<tr>
				<th>MAC</th>
				<th>#</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="esp in esps" :key="esp.mac" :class="{'bg-secondary-light': esp == selectedESP}">
				<td :class="{'font-weight-bold text-primary' : esp.isMother}">{{esp.mac}}</td>
				<td>
					<ui-icon-button
						type="secondary"
						icon="settings"
						tooltip-position="right"
						:tooltip="$t('configESP')"
						size="small"
						@click="showESP(esp)"
					/>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<script>
export default {
	name: "TableESP32",
	props: {
		esps: {
			type: Array,
			required: true,
		},
		showESP: {
			type: Function,
			required: true,
		},
		selectedESP: {
			type: Object,
		},
	},
};
</script>

<style scoped>
.bg-secondary-light {
	background: rgb(192, 192, 192);
}
</style>