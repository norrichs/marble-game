<script lang="ts">
	import { deleteUsers } from '$lib/data/communicate';
	import { clearLocalUsers } from '$lib/data/local';
	import { Game, Player, type BoardLayout, type User } from '$lib/Game/game.svelte';
	import { usersSync } from 'drizzle-orm/neon';

	type Props = {
		player: User | undefined;
		opponent: User | undefined;
		opponents: User[];
		startGame: () => void;
		setPlayer: (playerNumber: 1 | 2, player: User) => void;
	};

	let { player, opponent, opponents, startGame, setPlayer }: Props = $props();
	// console.debug('Lobby', player, opponent, opponents);

	const quitGames = async (user?: User) => {
		if (!user) return;
		if (user.activeGame) {
			const resp = await fetch(`/api/users/${user.uuid}`, {
				method: 'PUT',
				body: JSON.stringify({ activeGame: user.activeGame }),
				headers: { 'content-type': 'application/json' }
			});
			const response = await resp.json();
			console.debug({ response });
		}
	};

	export const togglePlayerReady = async () => {
		if (!player) return false;
		const response = await fetch(`/api/users`, {
			method: 'PUT',
			body: JSON.stringify({ ready: !player.ready, uuid: player.uuid }),
			headers: { 'content-type': 'application/json' }
		});
		const result = await response.json();
		console.debug('toggle response', result);
		return result.ready as boolean;
	};
</script>

<main>
	<header>
		{#if player && opponent}<button onclick={startGame}>Start Game</button>{/if}
		<button onclick={clearLocalUsers}>Clear Local Users</button>
		<button onclick={() => deleteUsers(opponents.map((o) => o.uuid))}>Delete all opponents</button>
	</header>

	<h2>Me</h2>
	{#if player}
		<header class="user-table">
			<div>Name</div>
			<div>Games</div>
			<div>Wins</div>
			<div>Losses</div>
		</header>
		<div class="user-table">
			<div>{player.name}</div>
			<div>
				{#if player.activeGame}
					<button onclick={() => quitGames(player)}>Quit {player.activeGame.slice(0, 5)}</button>
				{:else}{/if}
			</div>
			<div>{player.wins}</div>
			<div>{player.losses}</div>
			<div>
				<button
					onclick={async () => {
						if (!player) return;
						const newReady = await togglePlayerReady();
						console.debug({ newReady });
						const updatedPlayer: User = { ...player, ready: newReady };
						console.debug('updated player', updatedPlayer);
						player = updatedPlayer;
					}}>{player.ready ? 'Release' : 'Ready'}</button
				>
			</div>
		</div>
	{:else}
		<div>???</div>
	{/if}

	<h2>opponents</h2>
	<header class="user-table">
		<div>Name</div>
		<div>Games</div>
		<div>Wins</div>
		<div>Losses</div>
	</header>
	<div class="user-table">
		{#each opponents as user}
			<div>{user.name}</div>
			<div>
				{#if user.activeGame}
					<button onclick={() => quitGames(user)}>Quit {user.activeGame.slice(0, 5)}</button>
				{:else}{/if}
			</div>
			<div>{user.wins}</div>
			<div>{user.losses}</div>

			<div>
				{#if user.ready && !player?.ready}
					<div>Opponent Ready</div>
				{:else if user.ready && player?.ready}
					<button
						onclick={() => {
							setPlayer(2, user);
						}}>Choose Opponent</button
					>
				{:else}
					<div>Not Ready</div>
				{/if}
			</div>
		{/each}
	</div>
</main>

<style>
	main {
		padding: 20px;
	}
	.user-table {
		width: 500px;
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
	}
	header.user-table {
		background-color: black;
		color: white;
	}
</style>
