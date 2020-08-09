<template>
	<div>
		<h2 class="text-center">
			{{esp.mac}}
			<ui-button class="pt-0" size="medium" icon="delete" @click="deleteConfig" />
		</h2>
		<div class="row">
			<TableIO :title="$t('leds')" :IO="esp.leds" :callback="delLed" />
			<TableIO :title="$t('sensors')" :IO="esp.sensors" :callback="delSens" />
			<div class="col">
				<div class="row">
					<div class="col">
						<ui-switch class="mt-4" v-model="esp.isMother">{{ $t('mother') }}</ui-switch>
					</div>
					<div class="col-7">
						<p>{{ $t('updateTime') }} (ms)</p>
						<ui-textbox v-model="esp.update_time" type="number" :required="true" :min="200" />
					</div>
				</div>
				<AddIO name="Led" :bind="newLed" :callback="addLed" :options="pins.names" />
				<AddIO name="Sens" :bind="newSensor" :callback="addSens" :options="pins.names" />
				<div class="row mt-3">
					<div class="col">
						<ui-button @click="saveConfig" :loading="saving">{{ $t('save') }}</ui-button>
					</div>
				</div>
			</div>
		</div>
		<ui-alert v-if="errorMsg.length > 0" type="error" @dismiss="errorMsg = ''">{{ errorMsg }}</ui-alert>
		<ui-alert v-if="!alertHidden" type="success" @dismiss="alertHidden = true">{{ $t('saved') }}</ui-alert>
	</div>
</template>

<script>
import AddIO from "./AddIO";
import TableIO from "./TableIO";
import network from "./../mixins/Network.js";

export default {
	name: "ConfigESP",
	components: { TableIO, AddIO },
	data: () => ({
		newSensor: {
			name: "",
			pin: null,
		},
		newLed: {
			name: "",
			pin: null,
		},
		saving: false,
		alertHidden: true,
		errorMsg: "",
	}),
	props: {
		esp: {
			type: Object,
			required: true,
		},
		deleteConfig: {
			type: Function,
			required: true,
		},
		pins: {
			type: Object,
			required: true,
		},
	},
	methods: {
		addSens() {
			if (this.newSensor.name.length > 0) {
				this.esp.sensors.push(this.newSensor);
				this.newSensor = {
					name: "",
					pin: this.pins.names[0],
				};
			} else this.errorMsg = this.$t("noNameSensError");
		},
		delSens(sensor) {
			this.esp.sensors.splice(this.esp.sensors.indexOf(sensor), 1);
		},
		addLed() {
			if (this.newLed.name.length > 0) {
				this.esp.leds.push(this.newLed);
				this.newLed = {
					name: "",
					pin: this.pins.names[0],
				};
			} else this.errorMsg = this.$t("noNameLedError");
		},
		delLed(led) {
			this.esp.leds.splice(this.esp.leds.indexOf(led), 1);
		},
		async saveConfig() {
			try {
				this.saving = true;
				// Deep copy
				const sentEsp = JSON.parse(JSON.stringify(this.esp));
				["sensors", "leds"].forEach((name) =>
					sentEsp[name].forEach(
						(o) => (o.pin = this.pins.values[this.pins.names.indexOf(o.pin)])
					)
				);
				await network.post("saveConfig", JSON.stringify(sentEsp));
				this.saving = this.alertHidden = false;
			} catch (error) {
				this.errorMsg = error.message;
			}
		},
	},
	beforeMount() {
		this.newLed.pin = this.newSensor.pin = this.pins.names[0];
	},
};
</script>