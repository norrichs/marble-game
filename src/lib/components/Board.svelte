<script lang="ts">
	import type { Divot, Game } from '$lib/Game/game.svelte';
	import Marble from './Marble.svelte';

	let { game }: { game: Game } = $props();
</script>

<main class="board">
	{#each game.layout as row, rowIndex}
		{#each row as divot, columnIndex}
			<div
				class="position"
				class:empty={!divot.marble}
				class:selected={divot.isSelected}
				class:selectable={game.player.active}
			>
				{#if divot.isEmpty || divot.marble === undefined}
					<div class="empty-divot"></div>
				{:else}
					<Marble value={divot.marble.value} onClick={() => game.select(rowIndex, columnIndex)} />
				{/if}
			</div>
		{/each}
	{/each}
</main>

<style>
	.board {
		--board-padding: 20px;
		--position-padding: 10%;
		background-color: beige;
		padding: var(--board-padding);
		display: grid;
		/* height: 100%;
		width: 100%; */
		/* max-height: calc(100vh - 2 * var(--board-padding));
		max-width: calc(100vw - 2 * var(--board-padding)); */
		aspect-ratio: 1;
		grid-template-columns: repeat(6, 1fr);
		grid-template-rows: repeat(6, 1fr);
		border-radius: 20px;
		margin: 10px;
	}
	.position {
		border-radius: 50%;
		background-color: transparent;
		/* transition: 300ms; */
		outline: 3px solid rgba(0, 0, 255, 0);
		padding: var(--position-padding);
		overflow: visible;
		outline-offset: 0px;
		transition:
			outline 400ms,
			padding 400ms;
	}
	.position.selected {
		outline: 3px solid rgba(0, 0, 255, 0.4);
		transition:
			outline 400ms,
			padding 400ms;
		padding: 1%;
	}
	.position:hover{
		padding: calc(var(--position-padding) * 1.2)
	}

	.position.selectable:hover {
		/* transition: 300ms; */
		padding: 0%;
	}
	.position.empty:hover {
		padding: var(--position-padding);
	}
	.empty-divot {
		width: 100%;
		height: 100%;
		border: none;
		border-radius: 50%;
		box-shadow: -5px -10px 20px 0px black inset;

		background-color: transparent;
		box-shadow: 5px 10px 20px 0px rgba(0, 0, 0, 0.8) inset;
	}
</style>
