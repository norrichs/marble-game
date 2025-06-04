<script lang="ts">
	import { parsePath } from '$lib/spinner/spinner';
	let curve = $state(
		`M500,500C500,500 724.67,434.818 509.058,343.808C416.212,304.617 271.482,147.16 500,117.479`
	);
	let copies = $state(3);

	let styleObj = $state({
		col: 'green',
		lin: 'blue',
		period: '100s'
	});

	console.debug($state.snapshot(curve), parsePath($state.snapshot(curve)));

	let styleVariables = $derived.by(() => {
		const result = Object.entries(styleObj)
			.map(([k, v]) => `--${k}: ${v}`)
			.join('; ');

		console.debug(result);
		return result;
	});
</script>

<main style={`${styleVariables}`}>
	<svg class="canvas" viewBox="-500 -500 1000 1000">
		<circle cx={0} cy={0} r="10" />
		<g class="clockwise spinner">
			{#each { length: copies }, i}
				<g transform={`rotate(${(i * 360) / copies})`}>
					<path
						d={curve}
						fill="none"
						stroke-width={3}
						transform={`scale(-1 1), translate(-500 -500)`}
					/>
				</g>
			{/each}
		</g>
		<g class="counter_clockwise spinner">
			{#each { length: copies }, i}
				<g transform={`rotate(${(i * 360) / copies})`}>
					<path d={curve} fill="none" stroke-width={3} transform={` translate(-500 -500)`} />
				</g>
			{/each}
		</g>
	</svg>
	<div class="controls">
		<input
			type="range"
			min={0.5}
			max={50}
			value="25"
			oninput={(ev: Event) => (styleObj.period = `${(ev.target as HTMLInputElement)?.value}s`)}
		/>
		<input type="number" min={1} bind:value={copies} />
		<textarea bind:value={curve}></textarea>
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		justify-content: flex-start;
		height: 90vh;
	}
	.controls {
		display: flex;
		flex-direction: column;
	}
	.canvas {
		height: 100%;
		aspect-ratio: 1;
		display: block;
		background-color: transparent;
	}
	.spinner {
		stroke: var(--lin);
	}
	.clockwise {
		animation: spin_clockwise 20s linear infinite;
		animation-duration: var(--period);
	}
	.counter_clockwise {
		animation: spin_counter_clockwise 20s linear infinite;
		animation-duration: var(--period);
	}
	@keyframes spin_clockwise {
		100% {
			transform: rotate(360deg);
		}
	}
	@keyframes spin_counter_clockwise {
		100% {
			transform: rotate(-360deg);
		}
	}
</style>
