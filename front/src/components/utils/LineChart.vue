<script>
// Documentation : https://www.chartjs.org/docs/latest/charts/line.html
import { Line } from "vue-chartjs";
export default {
	name: "LineChart",
	extends: Line,
	props: {
		chartData: {
			type: Object,
			required: true,
		},
	},
	watch: {
		chartData: {
			deep: true,
			handler() {
				this.$data._chart.update();
			},
		},
	},
	mounted() {
		this.renderChart(
			{
				labels: this.chartData.labels,
				datasets: [
					{
						label: this.chartData.title,
						borderColor: this.chartData.color,
						backgroundColor: "rgba(0, 0, 0, 0)",
						data: this.chartData.data,
					},
				],
			},
			{
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					xAxes: [
						{
							type: this.chartData.type,
						},
					],
				},
			}
		);
	},
};
</script>