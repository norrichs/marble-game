<script lang="ts">
	import { Game, Player, type BoardLayout, type User } from '$lib/Game/game.svelte';
	import GameArea from '$lib/components/GameArea.svelte';
	import Lobby from '$lib/components/Lobby.svelte';
	import { createUser, fetchGame, fetchUsers } from '$lib/data/communicate';
	import { createLocalUser, getLocalUser } from '$lib/data/local';
	import { Poll } from '$lib/polling.svelte';
	import { onDestroy } from 'svelte';

	const getUsers = async () => {
		users = await fetchUsers();
		console.debug('fetchedUsers', $state.snapshot(users));
		const localUser = getLocalUser() || createLocalUser(`${Math.floor(Math.random() * 1000)}`);
		const playerIndex = users.findIndex((user) => user.uuid === localUser.uuid);
		player = playerIndex === -1 ? await createUser(localUser) : users.splice(playerIndex, 1)[0];

		const p1ActiveGame = $state.snapshot(player)?.activeGame;
		console.debug('player', p1ActiveGame);
		if (p1ActiveGame) {
			joinGame(p1ActiveGame);
		}
		opponents = users;
	};

	const joinGame = async (gameUuid: string) => {
		if (!player) return;

		const thisOpponent = opponents.find((user) => user.activeGame === gameUuid);
		if (!thisOpponent) return;

		const fetchedGame = await fetchGame(gameUuid);
		opponent = thisOpponent;
		poll.stop();

		game = new Game({
			player: new Player(player.name, player.uuid, 2),
			opponent: new Player(opponent.name, opponent.uuid, 1, true),
			fetchedGame: fetchedGame,
			activePlayerUuid: fetchedGame.activePlayerUuid,
			poll
		});
		console.debug('joingame', { activePlayer: game.activePlayer.uuid });
		await game.pull();
		mode = 'game';
		poll.start({
			callback: () => {
				console.debug('jG');
				game?.pull();
			},
			delay: 1000,
			easing: 'linear'
		});
	};

	const startGame = async () => {
		poll.stop();
		console.debug('startGame', player, opponent);
		if (!player || !opponent) return;
		game = new Game({
			player: new Player(player.name, player.uuid, 1),
			opponent: new Player(opponent.name, opponent.uuid, 2, true),
			poll
		});
		await game.create();
		console.debug('created', game);
		mode = 'game';
		poll.start({
			callback: () => {
				console.debug('sG');
				game?.pull();
			},
			delay: 1000,
			easing: 'linear'
		});
	};

	const setPlayer = (playerNumber: 1 | 2, player: User) => {
		if (playerNumber === 1) {
			player = player;
		} else {
			opponent = player;
		}
	};

	let users: User[] = $state([]);
	let player: User | undefined = $state();
	let opponent: User | undefined = $state();
	let opponents: User[] = $state([]);
	let mode: 'game' | 'lobby' = $state('lobby');
	// svelte-ignore non_reactive_update
	let game: Game | undefined = undefined;
	let poll = new Poll();
	poll.start({ callback: getUsers, delay: 1000, easing: 'linear' });

	$effect(() => {
		getUsers();
		console.debug('effect');
	});

	onDestroy(() => {
		poll.stop();
	});
</script>

{#if mode === 'lobby'}
	<Lobby {player} {opponent} {opponents} {startGame} {setPlayer} />
{:else if game}
	<GameArea {game} gotoLobby={() => (mode = 'lobby')} {poll} />
{/if}
