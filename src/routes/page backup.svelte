<script lang="ts">
	import { goto } from '$app/navigation';
	import type { User } from '$lib/Game/game.svelte';
	import {
		clearLocalUsers,
		createLocalUser,
		deleteLocalUser,
		getLocalUser
	} from '$lib/data/local';
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

	const deleteUsers = async (uuids: string[]) => {
		const response = await fetch('/api/users', {
			method: 'DELETE',
			body: JSON.stringify(uuids),
			headers: { 'content-type': 'application/json' }
		});
		const result = await response.json();
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

	const getOpponents = async () => {
		const localUser = getLocalUser();
		const localUserUuids = localUser.uuid;
		const response = await fetch('/api/users', {
			method: 'GET',
			headers: { 'content-type': 'application/json' }
		});
		console.debug({ response });
		if (!response.ok) return [];
		
		const allUsers = (await response.json()) as User[];

		console.debug({ allUsers, localUserUuids });

		return allUsers ? allUsers.filter((user) => !localUserUuids.includes(user.uuid)) : [];
	};

	const togglePlayerReady = async () => {
		const localUser = getLocalUser();
		const response = await fetch(`/api/users`, {
			method: 'PUT',
			body: JSON.stringify({ ready: !localUser.ready, uuid: localUser.uuid }),
			headers: { 'content-type': 'application/json' }
		});
		const result = await response.json();
		console.debug('toggle response', result);
		return result.ready as boolean;
	};

	const startGame = async (player: User | undefined, opponent: User | undefined) => {
		if (!player || !opponent) return;
		waitingForOpponent = true;
		const response = await fetch('/api/game/start', {
			method: 'POST',
			body: JSON.stringify({ player, opponent }),
			headers: { 'content-type': 'application/json' }
		});
		const result = await response.json();
	};

	// const choosePlayer = (user: User) => (player = user);
	// const chooseOpponent = (user: User) => (opponent = user);

	let opponents = $state(getOpponents());
	let player = $state(getLocalUser());
	$inspect(player).with(console.debug);
	let opponent = $state<User>();
	let waitingForOpponent = $state<boolean>(false);
	console.debug('opp', opponents);
</script>

<button onclick={() => goto('/board')}> Start Game </button>
<button
	onclick={async () => {
		const localUser = getLocalUser();
		const confirmed = !localUser || window.confirm(`Delete existing users? ${localUser.name}`);

		if (confirmed) {
			const newLocalUser = createLocalUser(`${Math.floor(Math.random() * 1000)}`);
			console.debug({ newLocalUser });
			const newUser = await createUser(newLocalUser);
			if (!newUser) {
				deleteLocalUser(newLocalUser.uuid);
			} else {
				console.debug({ newUser });
				const res = await deleteUsers([localUser.uuid]);

				if (localUser.uuid !== newUser.uuid) {
					deleteLocalUser(localUser.uuid);
				}
				console.debug('create new player', { res });
			}
		}
		const newPlayer = await getPlayer();
		if (newPlayer) {
			player = newPlayer;
		}
	}}
	>Create New Player
</button>
<!-- <button
	onclick={async () => {
		await deleteUsers(getLocalUsers().map((u) => u.uuid));
		clearLocalUsers();
		users = getLocalUsers();
	}}>Clear All Users</button
> -->
<button onclick={() => fetch('/api/polling')}> Poll </button>

<h2>Player</h2>
{#await player}
	<div>WAITING</div>
{:then p}
	{#if p}
		<header class="user-table">
			<div>Name</div>
			<div>Wins</div>
			<div>Losses</div>
		</header>
		<div class="user-table">
			<div>{p.name}</div>
			<div>{p.wins}</div>
			<div>{p.losses}</div>
			<div>
				<button
					onclick={async () => {
						const newReady = await togglePlayerReady();
						console.debug({ newReady });
						const updatedPlayer = { ...p, ready: newReady };
						console.debug('updated player', updatedPlayer);
						player = updatedPlayer;
					}}>{p.ready ? 'Release' : 'Ready'}</button
				>
			</div>
		</div>
	{:else}
		<div>???</div>
	{/if}
{/await}

<h2>Opponents</h2>
{#await opponents then opponents}
	<header class="user-table">
		<div>Name</div>
		<div>Wins</div>
		<div>Losses</div>
		<div>READY</div>
	</header>
	<div class="user-table">
		{#each opponents as user}
			<div>{user.name}</div>
			<div>{user.wins}</div>
			<div>{user.losses}</div>
			<div>
				{#if user.ready && !player.ready}
					<div>Opponent Ready</div>
				{:else if user.ready && player.ready}
					<button
						onclick={() => {
							opponent = user;
							startGame(player, opponent);
						}}>Choose Opponent</button
					>
				{:else}
					<div>Opponent not Ready</div>
				{/if}
			</div>
		{/each}
	</div>
{/await}

<style>
	.user-table {
		width: 500px;
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr;
	}
</style>
