<script lang="ts">
	import { savedCurves } from '$lib/spinner/curves';
	let curve = $state(savedCurves[0].paths[0]);
	let curves = $state(savedCurves[0].paths);
	let copies = $state(3);
	let fill = $state(true);
	let reverse = $state(false);
	let fillColor = 'rgba(50,0,0,.9)';
	let fillColor2 = 'rgba(0,50,0,.9)';
	let centralRadius = $state(30);
	let firstOnly = $state(true);

	let styleObj = $state({
		col: 'green',
		lin: 'none',
		period: '100s'
	});

	const extractPathString = (text: string) => {
		const dValues: string[] = [];
		const regex = /<path\b[^>]*\sd="([^"]*)"/gi;
		let match;
		while ((match = regex.exec(text)) !== null) {
			dValues.push(match[1]);
		}
		return dValues;
	};

	const onLoadFile = (e: Event) => {
		const textContent = (e.target as FileReader)?.result as string;
		const extracted = extractPathString(textContent);
		console.debug('extracted', extracted);
		curve = extracted[0];
		curves = extracted;
	};

	const handleDrop = (ev: DragEvent) => {
		ev.preventDefault();
		const files = ev.dataTransfer?.files;
		if (files && files.length > 0) {
			const file = files[0];
			const reader = new FileReader();
			reader.onload = onLoadFile;
			reader.readAsText(file);
		}
	};

	let styleVariables = $derived.by(() => {
		const result = Object.entries(styleObj)
			.map(([k, v]) => `--${k}: ${v}`)
			.join('; ');

		return result;
	});
</script>

<main style={`${styleVariables}`}>
	<svg class="canvas" viewBox="-500 -500 1000 1000">
		<circle cx={0} cy={0} r={centralRadius} fill={fillColor} />
		<g class={`${reverse ? 'counter-clockwise' : 'clockwise'} spinner`}>
			{#each { length: copies }, i}
				<g transform={`rotate(${(i * 360) / copies})`}>
					{#if firstOnly}
						<path
							d={curve}
							fill={fill ? fillColor : 'none'}
							stroke={fill ? 'none' : 'black'}
							stroke-width={3}
							transform={`scale(-1 1), translate(-500 -500)`}
						/>
					{:else}
						{#each curves as c}
							<path
								d={c}
								fill={fill ? fillColor2 : 'none'}
								stroke={fill ? 'none' : 'black'}
								stroke-width={3}
								transform={`scale(-1 1), translate(-500 -500)`}
							/>
						{/each}
					{/if}
				</g>
			{/each}
		</g>
		<g class={`${reverse ? 'clockwise' : 'counter-clockwise'} spinner`}>
			{#each { length: copies }, i}
				<g transform={`rotate(${(i * 360) / copies})`}>
					{#if firstOnly}
						<path
							d={curve}
							fill={fill ? fillColor2 : 'none'}
							stroke={fill ? 'none' : 'black'}
							stroke-width={3}
							transform={` translate(-500 -500)`}
						/>
					{:else}
						{#each curves as c}
							<path
								d={c}
								fill={fill ? fillColor : 'none'}
								stroke={fill ? 'none' : 'black'}
								stroke-width={3}
								transform={` translate(-500 -500)`}
							/>
						{/each}
					{/if}
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
		<div><span>Fill?</span><input type="checkbox" bind:checked={fill} /></div>
		<div><span>Reverse?</span><input type="checkbox" bind:checked={reverse} /></div>
		<div><span>First Only?</span><input type="checkbox" bind:checked={firstOnly} /></div>
		<textarea bind:value={curve}></textarea>
		<button
			id="dropzone"
			ondrop={handleDrop}
			ondragover={(e) => {
				e.preventDefault();
			}}
		>
			<div>Drop SVG file here</div>
			<div></div>
		</button>
	</div>
</main>

<style>
	#dropzone {
		width: 150px;
		height: 150px;
		background-color: gray;
		border: 1px solid black;
		border-radius: 20px;
		color: white;
		display: flex;
		place-items: center;
		text-align: center;
	}
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
		stroke-width: 0;
		stroke: var(--lin);
	}
	.clockwise {
		animation: spin_clockwise 20s linear infinite;
		animation-duration: var(--period);
	}
	.counter-clockwise {
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
