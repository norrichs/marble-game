<script lang="ts">
	import { goto } from '$app/navigation';
	import type { User } from '$lib/Game/game.svelte';
	import {
		clearLocalUsers,
		createLocalUser,
		deleteLocalUser,
		getLocalUser
	} from '$lib/data/local';
	import { onDestroy } from 'svelte';
	import { get } from 'svelte/store';

	const createUser = async (user: User) => {
		const response = await fetch('/api/users', {
			method: 'POST',
			body: JSON.stringify(user),
			headers: { 'content-type': 'application/json' }
		});
		const result = await response.json();
		console.debug('createUser', result);
		return result;
	};



	const getPlayer = async () => {
		const localUser = getLocalUser();
		if (!localUser) return;
		const response = await fetch(`/api/users/${localUser.uuid}`, {
			method: 'GET',
			headers: { 'content-type': 'application/json' }
		});
		const result = (await response.json()) as User;
		console.debug('get player', result);
		return result;
	};

	const fetchUsers = async () => {
		const response = await fetch('/api/users', {
			method: 'GET',
			headers: { 'content-type': 'application/json' }
		});
		if (!response.ok) return [];

		const allUsers = (await response.json()) as User[];
		return allUsers;
	};

	const togglePlayerReady = async () => {
		if (!player1) return false;
		const response = await fetch(`/api/users`, {
			method: 'PUT',
			body: JSON.stringify({ ready: !player1.ready, uuid: player1.uuid }),
			headers: { 'content-type': 'application/json' }
		});
		const result = await response.json();
		console.debug('toggle response', result);
		return result.ready as boolean;
	};

	const startGame = async (player: User | undefined, opponent: User | undefined) => {
		if (!player || !opponent) return;
		// waitingForOpponent = true;
		const response = await fetch('/api/game/start', {
			method: 'POST',
			body: JSON.stringify({ player, opponent }),
			headers: { 'content-type': 'application/json' }
		});
		const result = await response.json();
		console.debug('startGameResult', result);
	};

	const getUsers = async () => {
		users = await fetchUsers();
		const localUser = getLocalUser() || createLocalUser(`${Math.floor(Math.random() * 1000)}`);
		const player1Index = users.findIndex((user) => user.uuid === localUser.uuid);
		console.debug({ player1Index, users });
		player1 = player1Index === -1 ? await createUser(localUser) : users.splice(player1Index, 1)[0];
		console.debug({ player1 });
		opponents = users;
	};

	let users: User[] = $state([]);
	let player1: User | undefined = $state();
	let player2: User | undefined = $state();
	let opponents: User[] = $state([]);

	let interval: NodeJS.Timeout | undefined;

	const startPolling = () => {
		if (interval) {
			clearInterval(interval);
		}

		interval = setInterval(async () => {
			getUsers();
		}, 5000);
	};

	const stopPolling = () => {
		if (interval) {
			clearInterval(interval);
		}
		interval = undefined;
	};

	$effect(() => {
		getUsers();
		startPolling();
	});

	onDestroy(() => {
		stopPolling();
	});
</script>

<header>
	{#if player1 && player2}<button
			onclick={() => {
				startGame(player1, player2);
				goto('/game');
			}}>Start Game</button
		>{/if}
	<button onclick={clearLocalUsers}>Clear Local Users</button>
	<button onclick={getUsers}>Refresh users</button>
</header>

<h2>Player1</h2>
{#if player1}
	<header class="user-table">
		<div>Name</div>
		<div>Wins</div>
		<div>Losses</div>
	</header>
	<div class="user-table">
		<div>{player1.name}</div>
		<div>{player1.wins}</div>
		<div>{player1.losses}</div>
		<div>
			<button
				onclick={async () => {
					if (!player1) return;
					const newReady = await togglePlayerReady();
					console.debug({ newReady });
					const updatedPlayer: User = { ...player1, ready: newReady };
					console.debug('updated player', updatedPlayer);
					player1 = updatedPlayer;
				}}>{player1.ready ? 'Release' : 'Ready'}</button
			>
		</div>
	</div>
{:else}
	<div>???</div>
{/if}
<h2>opponents</h2>
<header class="user-table">
	<div>Name</div>
	<div>Wins</div>
	<div>Losses</div>
</header>
<div class="user-table">
	{#each opponents as user}
		<div>{user.name}</div>
		<div>{user.wins}</div>
		<div>{user.losses}</div>
		<div>
			{#if user.ready && !player1?.ready}
				<div>Opponent Ready</div>
			{:else if user.ready && player1?.ready}
				<button
					onclick={() => {
						player2 = user;
					}}>Choose Opponent</button
				>
			{:else}
				<div>Not Ready</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.user-table {
		width: 500px;
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr;
	}
	header.user-table {
		background-color: black;
		color: white;
	}
</style>
