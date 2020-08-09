<template>
	<div>
		<h1 class="p-3">{{ $t("config") }}</h1>
		<div class="container-fluid bg-light">
			<div class="row p-1">
				<div class="col-3">
					<h5 class="text-center">{{ $t('esp32list') }}</h5>
					<div class="row">
						<TableESP32 :esps="esps" :showESP="showESP" :selectedESP="selectedESP" />
					</div>
					<ESP32Adder :addESP="addESP" />
					<ui-button class="mt-3" @click="showDebugMessage">{{ $t('printDebugMessage') }}</ui-button>
				</div>
				<div v-if="selectedESP != null" class="col-9">
					<ConfigESP :esp="selectedESP" :deleteConfig="deleteConfig" :pins="pins" />
				</div>
			</div>
			<ui-alert v-if="!dismissed" type="info" @dismiss="dismissed = true">{{ $t('lootAtSerial') }}</ui-alert>
			<ui-alert v-if="errorMsg.length>0" type="error" @dismiss="errorMsg = ''">{{errorMsg}}</ui-alert>
		</div>
	</div>
</template>

<script>
import ConfigESP from "./ConfigESP";
import ESP32Adder from "./ESP32Adder";
import TableESP32 from "./TableESP32";
import network from "./../mixins/Network.js";

export default {
	name: "Configuration",
	components: { TableESP32, ESP32Adder, ConfigESP },
	data: () => ({
		esps: [],
		pins: { names: [], values: [] },
		selectedESP: null,
		dismissed: true,
		errorMsg: "",
	}),
	methods: {
		async deleteConfig() {
			try {
				await network.delete(
					"deleteConfig",
					JSON.stringify({ mac: this.selectedESP.mac })
				);
				this.fetchConfigs();
				this.selectedESP = null;
			} catch (error) {
				this.errorMsg = error.message;
			}
		},
		addESP(esp) {
			this.esps.push({
				isMother: false,
				mac: esp.mac,
				sensors: [],
				leds: [],
				update_time: 3000,
			});
			this.selectedESP = this.esps[this.esps.length - 1];
		},
		showESP(esp) {
			this.selectedESP = esp;
		},
		async fetchConfigs() {
			try {
				this.esps = await (await network.get("getConfigs")).json();
				["sensors", "leds"].forEach((name) =>
					this.esps.forEach((esp) =>
						esp[name].forEach(
							(o) => (o.pin = this.pins.names[this.pins.values.indexOf(o.pin)])
						)
					)
				);
			} catch (error) {
				this.errorMsg = error.message;
			}
		},
		async showDebugMessage() {
			try {
				await network.put("printDebugMessage");
				this.dismissed = false;
			} catch (error) {
				this.errorMsg = error.message;
			}
		},
	},
	beforeMount() {
		const range = Array(24)
			.fill(0)
			.map((_, i) => i + 1);
		const format = (n) => (n < 10 ? "0" + n : n);
		this.pins.names = range
			.map((n) => "D" + format(n))
			.concat(
				[0, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(
					(n) => "A" + format(n)
				)
			);

		// Source "pins_arduino.h" of the ESP32
		const pins = [36, 39, 32, 33, 34, 35, 4, 0, 2, 15, 13, 12, 14, 27, 25, 26];
		this.pins.values = range.concat(pins);
	},
	async mounted() {
		this.fetchConfigs();
	},
};
</script>