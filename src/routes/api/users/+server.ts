import { db } from '$lib/server/db';

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { User } from '$lib/Game/game.svelte';
import { users } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	const userConfig = (await request.json()) as User;
	const insertResponse = await db.insert(users).values(userConfig).returning({ id: users.id });
	console.debug('insertResponse', insertResponse);
	return json(insertResponse);
};

export const GET: RequestHandler = async () => {
	const allUsers = await db.query.users.findMany();
	return json(allUsers);
};

export const DELETE: RequestHandler = async ({ request }) => {
	const uuids = (await request.json()) as string[];
	console.debug('user uuids', uuids);

	const deleteResponse = await db.delete(users).where(inArray(users.uuid, uuids));
	console.debug('deleteResponse', deleteResponse);

	return json(deleteResponse);
};

export const PUT: RequestHandler = async ({ request }) => {
	const { uuid, ready } = (await request.json()) as {
		uuid: string;
		ready: boolean;
		name: string;
	};

	const response = await db
		.update(users)
		.set({ ready: ready })
		.where(eq(users.uuid, uuid))
		.returning({ uuid: users.uuid, ready: users.ready });

	console.debug('PUT response', response);
	return json(response[0]);
};
