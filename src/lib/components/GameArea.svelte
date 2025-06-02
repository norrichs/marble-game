<script lang="ts">
	import Board from '$lib/components/Board.svelte';
	import Celebrate from '$lib/components/Celebrate.svelte';
	import PlayerArea from '$lib/components/PlayerArea.svelte';
	import { Game, Player } from '$lib/Game/game.svelte';
	import type { Poll } from '$lib/polling.svelte';

	const { game, gotoLobby, poll }: { game: Game; gotoLobby: () => void; poll: Poll } = $props();
	$effect(() => {
		if (game.status === 'forfeit') {
			gotoLobby();
		}
	});
</script>

<main>
	{#if game.status === 'won'}
		<div>WON THE GAME! WHERE'S THE POPOVER</div>
		<Celebrate {game} />
	{/if}
	<div style="display: flex; flex-direction: column">
		<span>Player: {game.player.name}</span>
		<span>Opponent: {game.opponent.name}</span>
		<span>ACTIVE: {game.activePlayer.name}</span>
		<span>{game.hasSelection ? 'sel' : 'no sel'}</span>
		<span>{game.player.active ? 'active' : 'not active'}</span>
		<span>{game.status}</span>
		<span>Turn: {game.turn}</span>
		<span>SelectedValue:{game.selectedValue}</span>

		<button
			onclick={() => {
				gotoLobby();
				game.quit();
			}}>Quit</button
		>
		<button
			onclick={() => {
				console.debug({ game });
			}}>Print</button
		>
		<button
			onclick={() => {
				if (poll.isPaused) {
					poll.resume();
				} else {
					poll.pause();
				}
			}}>Polling {poll.interval ? 'Pause' : 'Resume'}</button
		>
	</div>
	<div class="game-area">
		<PlayerArea player={game.opponent} {game} />
		<Board {game} />
		<PlayerArea player={game.player} {game} canCapture={game.hasSelection && game.player.active} />
	</div>
</main>

<style>
	:global(body) {
		/* background-color: black; */
		padding: 0;
		margin: 0;
	}
	main {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}
	.game-area {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr 4fr 1fr;
		height: 100vh;
		aspect-ratio: 0.75;
	}
</style>
