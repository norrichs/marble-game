import { db } from '$lib/server/db';

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { BoardLayout, GameStatus } from '$lib/Game/game.svelte';
import { games, users } from '$lib/server/db/schema';
import { inArray } from 'drizzle-orm';

export type PostRequest = {
	p1Uuid: string;
	p2Uuid: string;
	activePlayerUuid: string;
	gameUuid: string;
	board: BoardLayout;
	status: GameStatus;
	turn: number;
};

// START GAME
export const POST: RequestHandler = async ({ request }) => {
	const { p1Uuid, p2Uuid, activePlayerUuid, board, gameUuid, status, turn }: PostRequest =
		await request.json();

	// const player1 = (await db.select().from(users).where(eq(users.uuid, p1Uuid)))[0];
	// const player2 = (await db.select().from(users).where(eq(users.uuid, p2Uuid)))[0];

	const [player1, player2] = await db
		.update(users)
		.set({ activeGame: gameUuid })
		.where(inArray(users.uuid, [p1Uuid, p2Uuid]))
		.returning({ id: users.id, uuid: users.uuid });

	const gameValues = {
		boardLayout: board,
		player1: player1.id,
		player2: player2.id,
		captured: { [player1.uuid]: [], [player2.uuid]: [] },
		activePlayerUuid:
			[player1, player2].find((p) => p.uuid === activePlayerUuid)?.uuid || player1.uuid,
		uuid: gameUuid,
		status,
		turn
	};

	board.forEach((row) => row.forEach((divot) => console.debug(divot)));
	console.debug('game values', gameValues);
	const resp = (
		await db.insert(games).values(gameValues).returning({
			id: games.uuid,
			board: games.boardLayout,
			status: games.status,
			turn: games.turn,
			createdAt: games.created_at,
			updatedAt: games.updated_at,
			activePlayerUuid: games.activePlayerUuid,
			captured: games.captured
		})
	)[0];
	console.debug('POST start game', resp);
	return json(resp);
};
