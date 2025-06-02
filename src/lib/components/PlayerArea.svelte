<script lang="ts">
	import type { Game, Player } from '$lib/Game/game.svelte';
	import Marble from './Marble.svelte';

	type Props = {
		player: Player;
		game: Game;
		canCapture?: boolean;
	};
	const { player, game, canCapture }: Props = $props();
</script>

<div class="player-area" class:active={player.active} class:opponent={player.isOpponent}>
	<div class="captured-area">
		{#each player.captured as marble}
			<div class="position">
				<Marble value={marble.value} />
			</div>
		{/each}
	</div>
	<div>
		{#if canCapture}
			<button onclick={async () => await game.capture()}>Capture!</button>
		{/if}
	</div>
</div>

<style>
	.position {
		background-color: transparent;
		width: calc(100% / 18);
		aspect-ratio: 1;
		transition: 300ms;
		padding: 4px;
		overflow: visible;
	}
	.player-area {
		display: flex;
		flex-direction: column;
		background-color: rgba(100, 149, 237, 0.3);
		border-radius: 20px;

		margin: 10px;

		
		outline-offset: 3px;
		transition: 400ms;
		outline: 5px solid rgb(100, 148, 237, 0);
		/* border: 3px solid black; */
	}
	.opponent {
		justify-content: flex-end;
		background-color: rgba(255, 99, 71, 0.3);
	}
	.active {
		outline-offset: 3px;
		transition: 400ms;
		outline: 5px solid rgb(100, 148, 237, 1);
	}

	.captured-area {
		display: flex;
		flex-direction: row;
		justify-content: center;
		flex-wrap: wrap-reverse;
		/* height: 100% */
	}
</style>
