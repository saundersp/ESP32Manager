<template>
	<div>
		<h2 class="text-center p-3">{{ $t("graphs") }}</h2>
		<ui-alert v-if="errorMsg.length > 0" type="error" @dismiss="errorMsg = ''">{{errorMsg}}</ui-alert>
		<ul class="list-group">
			<li class="list-group-item" v-if="esps.length == 0">{{ $t('nographs') }}</li>
			<li class="list-group-item" v-for="(esp, esp_index) in esps" :key="esp_index">
				<ui-collapsible class="bg-secondary" :open="esp_index==0">
					<template v-slot:header>
						<div class="row">
							<div class="col-7">{{ $t("card") }} ({{ esp.mac }})</div>
							<div class="col">
								<ui-alert type="warning" v-if="esp.panne" :dismissible="false">{{ $t("anomaly") }}</ui-alert>
							</div>
						</div>
					</template>
					<div class="row">
						<div class="col-10 pr-1">
							<ui-tabs type="text" :raised="true">
								<ui-tab
									v-for="(chart, chart_index) in esp.chartData"
									:key="chart_index"
									:title="chart.title"
									:id="String(chart_index)"
									:selected="chart_index==0"
								>
									<LineChart style="min-height: 200px" :chartData="chart" />
								</ui-tab>
							</ui-tabs>
						</div>
						<div class="col pl-0">
							<ul class="list-group" v-for="(led, led_index) in esp.leds" :key="led_index">
								<li class="list-group-item d-flex justify-content-between align-items-center">
									{{led.name}}
									<ui-switch v-model="led.value" @change="switchLed(esp.mac, led)" />
								</li>
							</ul>
						</div>
					</div>
				</ui-collapsible>
			</li>
		</ul>
	</div>
</template>

<script>
import LineChart from "../utils/LineChart.vue";
import network from "./../mixins/Network.js";

export default {
	name: "Graphs",
	components: { LineChart },
	data: () => ({
		esps: [],
		updateTime: 5000,
		updateLoop: null,
		errorMsg: "",
	}),
	methods: {
		async fetchData() {
			try {
				const jsn = await (await network.get("getESPSensors")).json();
				this.esps = jsn.map((e) => {
					const esp = {
						mac: e.mac,
						chartData: [],
						leds: e.readings[0].leds,
						panne: false,
					};
					const readings = this.formatReadings(e.readings);
					Object.keys(readings).forEach((k) => {
						esp.chartData.push({
							title: k,
							color:
								readings[k].type == "leds"
									? "rgba(255, 0, 0, 0.6)"
									: "rgba(0, 0, 255, 0.4)",
							labels: readings[k].x,
							data: readings[k].y,
							type: "time",
						});
					});
					if (esp.chartData.length == 0)
						esp.chartData.push({
							title: "n",
							color: "black",
							labels: [],
							data: [],
						});

					return esp;
				});
			} catch (error) {
				this.errorMsg = error.message;
			}
		},
		formatReadings(readings) {
			return readings.reduce((tab, s) => {
				["sensors", "leds"].forEach((name) => {
					if (s[name])
						s[name].forEach((k) => {
							if (!tab[k.name]) {
								tab[k.name] = { x: [], y: [], type: name };
							}
							tab[k.name].x.push(s.time);
							tab[k.name].y.push(k.value);
						});
				});
				return tab;
			}, {});
		},
		async updateData() {
			try {
				const jsn = await (await network.get("getESPSensors")).json();
				jsn.forEach((e) => {
					const readings = this.formatReadings(e.readings);
					const esp = this.esps.find((esp) => esp.mac == e.mac);
					Object.keys(readings).forEach((k) => {
						const cd = esp.chartData.find((cd) => cd.title == k);
						cd.labels.splice(0, cd.labels.length, ...readings[k].x);
						cd.data.splice(0, cd.data.length, ...readings[k].y);
					});
				});
			} catch (error) {
				this.errorMsg = error.message;
			}
		},
		switchLed(mac, led) {
			network
				.post(
					"toggleLed",
					JSON.stringify({
						mac,
						leds: [led],
					})
				)
				.catch((error) => (this.errorMsg = error.message));
		},
		getPredictions() {
			Promise.all(
				this.esps.map((esp) => {
					new Promise((resolve) => {
						network
							.get("getPredictions/" + esp.mac)
							.then((buf) => buf.json())
							.then((jsn) => {
								esp.panne = jsn.pred > 0.5;
								resolve();
							})
							.catch((error) => (this.errorMsg = error.message));
					});
				})
			);
		},
	},
	async mounted() {
		await this.fetchData();
		this.getPredictions();
		this.updateLoop = setInterval(this.updateData, this.updateTime);
	},
	beforeDestroy() {
		clearInterval(this.updateLoop);
	},
};
</script>

<style scoped>
.ui-collapsible >>> .ui-collapsible__body {
	padding: 0.2rem;
}
.ui-collapsible >>> .-ui-collapsible__header {
	display: flex;
}
</style>