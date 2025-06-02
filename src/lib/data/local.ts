import type { User } from '$lib/Game/game.svelte';
import { v4 as uuidv4 } from 'uuid';

const USER_PREFIX = 'marble_game_user';

export const createLocalUser = (name: string) => {
	const uuid = uuidv4();
	const userKey = `${USER_PREFIX}_${uuid}`;
	const user: User = {
		name,
		wins: 0,
		losses: 0,
		uuid,
		ready: false
	};
	window.localStorage.setItem(userKey, JSON.stringify(user));
	return user;
};

// export const getLocalUser = (key: string) => {
// 	const localUser = window.localStorage.getItem(key);
// 	if (!localUser) {
// 		console.error(`no local user ${key}`);
// 		return;
// 	}

// 	return JSON.parse(localUser);
// };

export const deleteLocalUser = (uuid: string) => {
	window.localStorage.removeItem(`${USER_PREFIX}_${uuid}`);
};

export const getLocalUser = (): User | null => {
	const local = Object.entries(window.localStorage);
	const users = local
		.filter(([key]) => key.startsWith(USER_PREFIX))
		.map((entry) => JSON.parse(entry[1]) as User);
	if (!users[0]) return null;
	return users[0];
};

export const clearLocalUsers = () => {
	const userKeys = Object.keys(window.localStorage).filter((key) => key.startsWith(USER_PREFIX));
	userKeys.forEach((key) => {
		window.localStorage.removeItem(key);
	});
};
