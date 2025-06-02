import { db } from '$lib/server/db';

import { json, type RequestHandler } from '@sveltejs/kit';
import { games, users } from '$lib/server/db/schema';
import { eq, or } from 'drizzle-orm';

export async function DELETE({ params }) {
	db.delete(users).where(eq(users.uuid, params.id));
	return new Response(null, { status: 204 });
}

export const GET: RequestHandler = async ({ params }) => {
	console.debug('Get user', params);
	// const response = db.select().from(user).where(eq(user.uuid, params.id));
	const response = await db
		.select()
		.from(users)
		.where(eq(users.uuid, `${params.id}`));
	console.debug('response', response);
	return json(response[0]);
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const userUuid = params.id;
	if (!userUuid) return new Response(null, { status: 500 });
	const req = await request.json();
	console.debug('req', req);

	const { player1, player2 } = (
		await db
			.delete(games)
			.where(eq(games.uuid, req.activeGame))
			.returning({ player1: games.player1, player2: games.player2 })
	)[0];

	if (!player1 || !player2) return new Response(null, { status: 500 });

	const result = await db
		.update(users)
		.set({ activeGame: null })
		.where(or(eq(users.id, player1), eq(users.id, player2)));

	const body: XMLHttpRequestBodyInit = JSON.stringify({ msg: 'test', ...result });
	return new Response(body);
};
