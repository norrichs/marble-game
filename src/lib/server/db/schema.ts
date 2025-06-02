import type { BoardLayout } from '$lib/Game/game.svelte';
import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: integer().primaryKey(),
	name: text(),
	wins: integer(),
	losses: integer(),
	ready: integer({ mode: 'boolean' }),
	uuid: text().notNull(),
	activeGame: text()
});

// export const userRelations = relations(users, ({ many }) => ({
// 	games: many(games)
// }));

export const games = sqliteTable('games', {
	id: integer().primaryKey(),
	created_at: integer({ mode: 'timestamp_ms' }).default(sql`(unixepoch() * 1000)`),
	updated_at: integer({ mode: 'timestamp_ms' }).default(sql`(unixepoch() * 1000)`),
	player1: integer(),
	player2: integer(),
	captured: text({ mode: 'json' }).$type<{ [key: string]: number[]; }>(),
	activePlayerUuid: text(),
	status: text(),
	turn: integer(),
	boardLayout: text({ mode: 'json' }).$type<BoardLayout>(),
	uuid: text().unique()
});
