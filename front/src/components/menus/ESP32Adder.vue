<template>
	<div class="row mt-3">
		<div class="col">
			<ui-button @click="$refs.ESPAdder.open()" :loading="saving">{{ $t("addESP32") }}</ui-button>
		</div>
		<ui-modal :title="$('addESP32Title')" ref="ESPAdder">
			<table class="table">
				<thead>
					<tr>
						<th>MAC</th>
						<th>{{ $t("lastActivity") }}</th>
						<th>#</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="esp in unconfiguredEsp" :key="esp.mac">
						<td>{{ esp.mac }}</td>
						<td>{{ new Date(esp.lastLogin).toLocaleString() }}</td>
						<td>
							<ui-icon-button
								type="secondary"
								icon="add"
								tooltip-position="right"
								:tooltip="$t('addToFleet')"
								@click="addESPHandler(esp)"
							/>
						</td>
					</tr>
				</tbody>
			</table>
		</ui-modal>
	</div>
</template>

<script>
import network from "./../mixins/Network.js";

export default {
	name: "ESP32Adder",
	data: () => ({
		unconfiguredEsp: [],
		saving: false,
	}),
	props: {
		addESP: {
			type: Function,
			required: true,
		},
	},
	methods: {
		addESPHandler(esp) {
			this.$refs.ESPAdder.close();
			this.addESP(esp);
		},
	},
	async mounted() {
		this.unconfiguredEsp = await (
			await network.get("getUnconfiguredESPS")
		).json();
	},
};
</script>