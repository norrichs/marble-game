import type { BoardLayout, GameStatus } from '$lib/Game/game.svelte';
import { games, users } from '$lib/server/db/schema';
import type { RequestHandler } from '@sveltejs/kit';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';

export type GamePutRequest = {
	playerUuid: string;
	board: BoardLayout;
	status: GameStatus;
	turn: number;
	updatedAt: string | Date;
	// timestamp: number;
	activePlayerUuid: string;
	captured: { [key: string]: number[] };
};

const remoteIsMostRecent = (localUpdatedAt: Date, remote: { updated_at: Date | null }) => {
	return remote.updated_at && remote.updated_at >= localUpdatedAt;
};

const updateGame = async (
	board: BoardLayout,
	status: GameStatus,
	turn: number,
	localUpdatedAt: Date,
	gameUuid: string,
	activePlayerUuid: string,
	captured: { [key: string]: number[] }
) => {
	const oldGame = (await db.select().from(games).where(eq(games.uuid, gameUuid)))[0];
	const oldCaptured = oldGame.captured;
	if (!oldCaptured) console.error('missing captured');
	console.debug('oldCaptured', oldCaptured, 'captured', captured);

	console.debug('old captured', oldCaptured);
	const uuid = Object.keys(captured)[0];
	const newCaptured = { ...oldCaptured, [uuid]: [...captured[uuid]] };

	const updateResult = (
		await db
			.update(games)
			.set({
				boardLayout: board,
				turn,
				status,
				updated_at: localUpdatedAt,
				activePlayerUuid,
				captured: newCaptured
			})
			.where(and(eq(games.uuid, gameUuid)))
			.returning({
				turn: games.turn,
				status: games.status,
				board: games.boardLayout,
				updatedAt: games.updated_at,
				activePlayerUuid: games.activePlayerUuid,
				captured: games.captured
			})
	)[0];
	console.debug('updateResult', updateResult);
	// printDiffGame(board, )
	return JSON.stringify(updateResult);
};

const quitGame = async (gameUuid: string, localUpdatedAt: Date) => {
	// quit the game
	const { player1Id, player2Id } = (
		await db
			.update(games)
			.set({ status: 'forfeit', updated_at: localUpdatedAt })
			.where(eq(games.uuid, gameUuid))
			.returning({
				player1Id: games.player1,
				player2Id: games.player2
			})
	)[0];
	// update the users
	if (!player1Id || !player2Id) return;
	const updatedUsers = await db
		.update(users)
		.set({ activeGame: null })
		.where(inArray(users.id, [player1Id, player2Id]))
		.returning();
	return JSON.stringify(updatedUsers);
};

//Sync
export const PUT: RequestHandler = async ({ params, request }) => {
	const req = await request.json();
	const gameUuid = params.id;
	if (!gameUuid) return new Response(null, { status: 500 });
	const { board, status, turn, updatedAt, activePlayerUuid, captured }: GamePutRequest = req; // await request.json();

	const localUpdatedAt = new Date(updatedAt);

	if (status === 'forfeit') {
		const body = await quitGame(gameUuid, localUpdatedAt);
		return new Response(body);
	}

	const remote = (await db.select().from(games).where(eq(games.uuid, gameUuid)))[0];

	if (remoteIsMostRecent(localUpdatedAt, remote)) {
		console.debug('*** *** PULL remote is most recent', remote.activePlayerUuid);
		console.debug('request', req);
		console.debug('remote', remote);
		const body = JSON.stringify({
			...remote,
			board: remote.boardLayout,
			updatedAt: remote.updated_at
		});

		return new Response(body);
	}

	console.debug('*** *** PUSH update from local');
	console.debug('request', req);
	console.debug('remote', remote);
	const body = await updateGame(
		board,
		status,
		turn,
		localUpdatedAt,
		gameUuid,
		activePlayerUuid,
		captured
	);

	return new Response(body);
};

export const GET: RequestHandler = async ({ params }) => {
	console.debug('GET game', params.id);
	const gameUuid = params.id;
	if (!gameUuid) return new Response(null, { status: 500 });

	const [result] = await db.select().from(games).where(eq(games.uuid, gameUuid));

	const body: XMLHttpRequestBodyInit = JSON.stringify(result);

	return new Response(body);
};
