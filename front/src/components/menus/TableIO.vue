<template>
	<div class="col">
		<h4 class="text-center">{{title}}</h4>
		<table class="table">
			<thead>
				<tr>
					<th scope="col">{{ $t('name') }}</th>
					<th scope="col">{{ $t('pin') }}</th>
					<th scope="col">#</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(sen, index) in IO" :key="index">
					<td>{{ sen.name }}</td>
					<td>{{ sen.pin }}</td>
					<td>
						<ui-icon-button type="secondary" icon="delete" size="small" @click="callback(sen)" />
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
export default {
	name: "TableIO",
	props: {
		IO: {
			type: Array,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		callback: {
			type: Function,
			required: true,
		},
	},
};
</script>