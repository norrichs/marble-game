<script lang="ts">
	import type { MarbleValue } from '$lib/Game/game.svelte';

	type MarbleProps = { value: MarbleValue; onClick?: () => void; onDoubleClick?: () => void };

	let { value, onClick, onDoubleClick }: MarbleProps = $props();
</script>

{#if typeof onClick === 'undefined'}
	<div class={`marble-${value} marble`}></div>
{:else}
	<button
		class={`marble-${value} marble`}
		onclick={onClick}
		aria-label={`Marble ${value}`}
		ondblclick={onDoubleClick}
	></button>
{/if}

<style>
	.marble {
		width: 100%;
		height: 100%;
		border: none;
		border-radius: 50%;
		box-shadow: -0.5vh -1vh 2vh 0vh black inset;
	}
	.marble-x {
		background-color: black;
		box-shadow: 5px 10px 20px 0px rgba(0, 0, 0, 0.8) inset;
	}
	.marble-1 {
		background-color: red;
	}
	.marble-2 {
		background-color: orange;
	}
	.marble-3 {
		background-color: yellow;
	}
	.marble-4 {
		background-color: green;
	}
	.marble-5 {
		background-color: blue;
	}
	.marble-0 {
		background-color: indigo;
	}
</style>
