import type { User } from '$lib/Game/game.svelte';

export const fetchUsers = async () => {
	const response = await fetch('/api/users', {
		method: 'GET',
		headers: { 'content-type': 'application/json' }
	});
	if (!response.ok) return [];

	const allUsers = (await response.json()) as User[];
	console.debug({ allUsers });
	return allUsers;
};

export const createUser = async (user: User) => {
	const response = await fetch('/api/users', {
		method: 'POST',
		body: JSON.stringify(user),
		headers: { 'content-type': 'application/json' }
	});
	const result = await response.json();
	console.debug('createUser', result);
	return result;
};

export const deleteUsers = async (uuids: string[]) => {
	const response = await fetch('/api/users', {
		method: 'DELETE',
		body: JSON.stringify(uuids),
		headers: { 'content-type': 'application/json' }
	});
	const result = await response.json();
	return result;
};

export const fetchGame = async (uuid: string) => {
	const response = await fetch(`/api/game/${uuid}`, {
		method: 'GET',
		headers: { 'content-type': 'application/json' }
	});
	const result = await response.json();

	console.debug('fetchGame', result);
	return result;
};
