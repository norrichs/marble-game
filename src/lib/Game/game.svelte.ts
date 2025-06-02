import { v4 as uuidv4 } from 'uuid';
import type { PostRequest } from '../../routes/api/game/+server';
import type { GamePutRequest } from '../../routes/api/game/[id]/+server';
import type { Poll } from '$lib/polling.svelte';

export type MarbleValue = 0 | 1 | 2 | 3 | 4 | 5;
export type DivotValue = MarbleValue | undefined;
type PlayerType = 'player' | 'opponent';

export type BoardLayout = [
	[Divot, Divot, Divot, Divot, Divot, Divot],
	[Divot, Divot, Divot, Divot, Divot, Divot],
	[Divot, Divot, Divot, Divot, Divot, Divot],
	[Divot, Divot, Divot, Divot, Divot, Divot],
	[Divot, Divot, Divot, Divot, Divot, Divot],
	[Divot, Divot, Divot, Divot, Divot, Divot]
];

export type BoardValueLayout = [
	[DivotValue, DivotValue, DivotValue, DivotValue, DivotValue, DivotValue],
	[DivotValue, DivotValue, DivotValue, DivotValue, DivotValue, DivotValue],
	[DivotValue, DivotValue, DivotValue, DivotValue, DivotValue, DivotValue],
	[DivotValue, DivotValue, DivotValue, DivotValue, DivotValue, DivotValue],
	[DivotValue, DivotValue, DivotValue, DivotValue, DivotValue, DivotValue],
	[DivotValue, DivotValue, DivotValue, DivotValue, DivotValue, DivotValue]
];

export type GameStatus = 'won' | 'playing' | 'init' | 'forfeit';
export type FetchedGame = {
	uuid: string;
	created_at: string;
	updated_at: string;
	status: GameStatus;
	turn: number;
	boardLayout: BoardLayout;
};
type Neighbors = [0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1];
export class Game {
	layout: BoardLayout = $state(this.initializeLayout());
	player: Player;
	opponent: Player;
	turn: number;
	status: GameStatus = $state('init');
	uuid: string;
	updatedAt: Date = $state(new Date());
	createdAt: Date = $state(new Date());
	hasSelection: boolean = $state(false);
	interval: NodeJS.Timeout | undefined = undefined;
	poll: Poll;

	#neighbors: Neighbors = [1, 1, 1, 1, 1, 1, 1, 1];
	private _activePlayer: Player | undefined;

	constructor({
		player,
		opponent,
		fetchedGame,
		activePlayerUuid,
		poll
	}: {
		player: Player;
		opponent: Player;
		fetchedGame?: FetchedGame;
		activePlayerUuid?: string;
		poll: Poll;
	}) {
		if (fetchedGame) {
			this.uuid = fetchedGame.uuid;
			this.createdAt = new Date(fetchedGame.created_at);
			this.updatedAt = new Date(fetchedGame.updated_at);
			this.status = fetchedGame.status;
			this.layout = window.structuredClone(fetchedGame.boardLayout);
		} else {
			this.uuid = uuidv4();
		}
		this.poll = poll;
		this.player = player;
		this.opponent = opponent;
		this.turn = 1;
		this.activePlayer = activePlayerUuid || this.player.uuid;
	}

	get selectedValue(): MarbleValue | undefined {
		const board = $state.snapshot(this.layout);
		for (const row of board) {
			for (const divot of row) {
				if (divot.marble && divot.isSelected) {
					return divot.marble.value;
				}
			}
		}
		return undefined;
	}

	checkSelectedValue(): MarbleValue | undefined {
		console.debug('CHECK SELECTED VALUE');
		const board = $state.snapshot(this.layout);
		for (const row of board) {
			for (const divot of row) {
				if (divot.marble?.isSelected) {
					// this._selectedValue = divot.marble.value
					// return this._selectedValue
					console.debug('FOUND SELECTED VALUE');
					return divot.marble.value;
				}
			}
		}
		// this._selectedValue = undefined
		// return this._selectedValue
		console.debug('NO SELECTED VALUE');
		return undefined;
	}

	set activePlayer(arg: PlayerType | string | Player) {
		if (arg === 'opponent' || arg === 'player') {
			this._activePlayer = this[arg];
		} else {
			const uuid = arg instanceof Player ? arg.uuid : arg;

			if (uuid === this.player.uuid) {
				this._activePlayer = this.player;
			} else if (uuid === this.opponent.uuid) {
				this._activePlayer = this.opponent;
			}
		}
		this.activePlayer.active = true;
	}

	get activePlayer(): Player {
		if (!this._activePlayer) this._activePlayer = this.player;
		return this._activePlayer;
	}

	get player1(): Player {
		return this.player.playerNumber === 1 ? this.player : this.opponent;
	}

	get player2(): Player {
		return this.player.playerNumber === 2 ? this.player : this.opponent;
	}

	toggleActivePlayer() {
		console.debug('toggleActivePlayer', {
			activePlayer: this.activePlayer.uuid,
			player: this.player.uuid,
			opponent: this.opponent.uuid
		});
		this.activePlayer.active = false;
		this.activePlayer = this.activePlayer.uuid === this.player.uuid ? this.opponent : this.player;

		console.debug('player active status', {
			active: this.activePlayer.uuid,
			isActive: this.activePlayer.active,
			player: this.player.active,
			opponent: this.opponent.active
		});
	}

	updateTimestamp() {
		this.updatedAt = new Date();
	}

	initializeLayout(): BoardLayout {
		const newLayout = [];
		for (let i = 0; i < 6; i++) {
			newLayout[i] = new Array(6);
			for (let j = 0; j < 6; j++) {
				newLayout[i][j] = { marble: undefined, isEmpty: true, isSelected: false };
			}
		}
		return newLayout as BoardLayout;
	}

	printBoard() {
		return console.debug(
			this.boardValues()
				.map((row) => row.map((divot) => divot || 'X').join(' '))
				.join('\n')
		);
	}

	boardValues() {
		return $state
			.snapshot(this.layout)
			.map((row) =>
				row.map((divot) => (divot.marble ? divot.marble.value : undefined))
			) as BoardValueLayout;
	}

	get isOpen() {
		for (let i = 0; i < 8; i += 2) {
			const seq = [this.neighbors[i], this.neighbors[(i + 1) % 8], this.neighbors[(i + 2) % 8]];
			console.debug(seq[0], seq[1], seq[2]);
			if (seq[0] + seq[1] + seq[2] === 3) {
				console.debug('capturable');
				return true;
			}
		}
		return false;
	}

	set neighbors({ r, c }: { r: number; c: number }) {
		this.#neighbors = [
			r === 0 || !this.layout[r - 1][c]?.marble ? 1 : 0, // n
			r === 0 || c === 0 || !this.layout[r - 1][c - 1]?.marble ? 1 : 0, // nw
			c === 0 || !this.layout[r][c - 1]?.marble ? 1 : 0, // w
			r === 5 || c === 0 || !this.layout[r + 1][c - 1]?.marble ? 1 : 0, // sw
			r === 5 || !this.layout[r + 1][c]?.marble ? 1 : 0, // s
			r === 5 || c === 5 || !this.layout[r + 1][c + 1]?.marble ? 1 : 0, // se
			c === 5 || !this.layout[r][c + 1]?.marble ? 1 : 0, // e
			r === 0 || c === 5 || !this.layout[r - 1][c + 1]?.marble ? 1 : 0 // ne
		];
	}
	get neighbors(): Neighbors {
		return this.#neighbors;
	}

	get isBridge() {
		// has non-contiguous stretchs of filled neignbor
		console.debug('neighbors', this.neighbors.join(','));
		const gaps = [];
		let inGap = false;
		let preGap = false;
		let counter = 0;
		let offset = 0;

		for (let i = 0; i < 8; i++) {
			counter += 1;
			if (counter > 20) return false;

			const neighbor = this.neighbors[(offset + i) % 8];
			console.debug(i, counter, { gaps, neighbor, preGap, inGap });
			// Stepping through space to find pregap
			if (gaps.length === 0 && neighbor === 1 && !preGap) {
				console.debug('reset');
				i = -1;
				offset += 1;
				continue;
			}
			// Stepping throug pregap
			if (gaps.length === 0 && neighbor === 0) {
				preGap = true;
				continue;
			}
			// Stepping into first gap
			if (gaps.length === 0 && neighbor === 1 && preGap) {
				preGap = false;
				inGap = true;
				gaps.push(1);
				continue;
			}
			// Stepping through gap
			if (inGap && neighbor === 1) {
				gaps[gaps.length - 1] += 1;
				continue;
			}
			// Stepping out of any gap
			if (inGap && neighbor === 0) {
				inGap = false;
				continue;
			}
			// Stepping into any other gap
			if (!inGap && neighbor === 1) {
				inGap = true;
				gaps.push(1);
				continue;
			}
		}
		// return false
		console.debug('gaps', gaps);
		return gaps.length > 1 && Math.min(...gaps) > 1;
	}

	isCapturable(r: number, c: number) {
		console.debug('IS CAPTURABLE', { r, c });

		this.neighbors = { r, c };
		return this.isOpen && !this.isBridge;
	}

	rejectCapture(row: number, column: number) {
		console.log(`Rejected capture of ${row} ${column}`);
	}

	evaluateGame() {
		console.debug('eval -------------------------------');
		console.debug('eval player captured', $state.snapshot(this.player.captured));
		if (this.isEmpty()) {
			this.status = 'won';
		}
		const groups = new Array(6).fill(0);
		this.activePlayer.captured.forEach((marble) => {
			groups[marble.value] += 1;
		});
		if (Math.max(...groups) === 6) {
			this.status = 'won';
		}
		console.debug('eval game', { status: this.status, groups: groups.join(', ') });
	}

	isEmpty() {
		return this.layout.every((row) => row.every((divot) => divot.marble === undefined));
	}

	hasSelections() {
		return this.layout.some((row) => row.some((divot) => divot.isSelected));
	}

	// Pushable
	setBoard() {
		console.debug('setBoard0', this.printBoard());
		const marbles: MarbleValue[] = [
			0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5,
			5, 5, 5, 5, 5
		];
		const positions = [
			0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
			26, 27, 28, 29, 30, 31, 32, 33, 34, 35
		];

		for (let i = 0; i < 36; i++) {
			const randM = Math.floor(Math.random() * marbles.length);
			const randP = Math.floor(Math.random() * positions.length);
			const marble: MarbleValue = marbles.splice(randM, 1)[0] as MarbleValue;
			const position = positions.splice(randP, 1)[0];
			const positionX = position % 6;
			const positionY = Math.floor(position / 6);
			this.layout[positionY][positionX].marble = { value: marble, isSelected: false };
			this.layout[positionY][positionX].isEmpty = false;
		}
		this.activePlayer = 'player';
		this.player.active = true;
		this.status = 'playing';
		console.debug('setBoard1', this.printBoard(), this.uuid);
		// this.push();
	}

	select(row: number, column: number) {
		const divot = this.layout[row][column];
		// console.debug('select', this.isCapturable(row, column), { divot: $state.snapshot(divot) });
		if (divot.marble === undefined || !this.isCapturable(row, column)) return;

		const selectedValue = this.selectedValue;

		const isSelectable =
			this.player.active &&
			(selectedValue === undefined || (selectedValue === divot.marble?.value && !divot.isSelected));
		const isSelected = selectedValue !== undefined && divot.isSelected;

		console.debug({ isSelectable, isSelected, selectedValue });

		if (isSelectable) {
			divot.isSelected = !divot.isSelected;
			this.hasSelection = true;
		} else if (isSelected) {
			console.debug('isSelected');
			divot.isSelected = false;
			if (!this.hasSelections()) {
				this.hasSelection = false;
			}
		}
		this.push();
	}

	async capture() {
		for (let i = 0; i < 6; i++) {
			for (let j = 0; j < 6; j++) {
				const divot = this.layout[i][j];
				// console.debug('divot', divot);
				if (divot.isSelected && divot.marble) {
					this.activePlayer.captured.push(divot.marble);
					divot.marble = undefined;
					divot.isEmpty = true;
					divot.isSelected = false;
				}
			}
		}

		this.evaluateGame();
		// if (this.status === 'playing') {
		this.toggleActivePlayer();
		this.turn += 1;
		await this.push();
		this.poll.resume();
		// }
	}

	quit() {
		this.status = 'forfeit';
		this.push();
	}

	shouldStartTurn(uuid: string) {
		console.debug('SHOULD START TURN', {
			should: this.activePlayer.uuid !== uuid && this.player.uuid === uuid,
			activePlayer: this.activePlayer.uuid,
			incoming: uuid,
			player: this.player.uuid
		});
		return this.activePlayer.uuid !== uuid && this.player.uuid === uuid;
	}

	startTurn() {
		console.debug('START TURN', { turn: this.turn });
		this.poll.pause();
		if (this.turn > 1) {
			console.debug('toggling', { activePlayer: this.activePlayer.uuid });
			this.toggleActivePlayer();
			// this.poll.pause();
			console.debug('turn started', { activePlayer: this.activePlayer.uuid });
		}
	}

	// Sync
	async push() {
		console.debug('game state before push', this, $state.snapshot(this.hasSelection));
		this.updateTimestamp();
		const response = await fetch(`/api/game/${this.uuid}`, {
			method: 'PUT',
			body: JSON.stringify({
				board: this.layout,
				status: this.status,
				turn: this.turn,
				updatedAt: this.updatedAt,
				activePlayerUuid: this.activePlayer.uuid,
				playerUuid: this.player.uuid,
				captured: Object.fromEntries([[this.player.uuid, this.player.captured.map((m) => m.value)]])
			} as GamePutRequest),
			headers: { 'content-type': 'application/json' }
		});
		const result = await response.json();
		const { turn, status, board, updatedAt } = result;
		console.debug('PUSH result		', result);
		this.turn = turn;
		console.debug('this turn', this.turn);
		this.status = status;
		this.layout = board;
		this.updatedAt = updatedAt;

		console.debug('game state', this, $state.snapshot(this.hasSelection));
	}

	async pull() {
		console.debug('PULL', this.player);
		if (this.player.active) {
			console.debug('game.pull short circuit');
			this.poll.pause();
			return;
		}
		console.debug('sync', this.uuid);
		const response = await fetch(`/api/game/${this.uuid}`, {
			method: 'PUT',
			body: JSON.stringify({ updatedAt: this.updatedAt }),
			headers: { 'content-type': 'application/json' }
		});
		const { turn, status, board, updatedAt, activePlayerUuid, captured } = await response.json();
		if (board) console.debug('-------------------\nBoard Update\n-------------------', board);
		console.debug('Game.pull result', {
			turn,
			status,
			board,
			updatedAt,
			activePlayerUuid,
			captured
		});

		this.turn = turn || this.turn;
		if (this.shouldStartTurn(activePlayerUuid)) this.startTurn();

		this.status = status;
		this.layout = board || this.layout;
		this.updatedAt = updatedAt || this.updatedAt;
		this.player1.captured = captured[this.player1.uuid].map(
			(value: MarbleValue): Marble => ({ value, isSelected: false })
		);
		this.player2.captured = captured[this.player2.uuid].map(
			(value: MarbleValue): Marble => ({ value, isSelected: false })
		);
	}

	async create() {
		this.setBoard();
		const gameParams: PostRequest = {
			p1Uuid: this.player.uuid,
			p2Uuid: this.opponent.uuid,
			activePlayerUuid: this.player.uuid,
			gameUuid: this.uuid,
			board: $state.snapshot(this.layout) as BoardLayout,
			status: 'playing',
			turn: this.turn
		};

		const response = await fetch('/api/game', {
			method: 'POST',
			body: JSON.stringify(gameParams),
			headers: { 'content-type': 'application/json' }
		});
		const result = await response.json();
		console.debug('POST result', result);
		this.createdAt = new Date(result.createdAt);
		this.updatedAt = new Date(result.updatedAt);
		this.startTurn();

		console.debug('createGame result', result);
		return result;
	}
}

export class Player {
	score = 0;
	captured: Marble[] = $state([]);
	active = $state(false);
	isOpponent = false;
	playerNumber: 1 | 2;

	constructor(name: string, uuid: string, playerNumber: 1 | 2, isOpponent?: boolean) {
		this.name = name;
		this.uuid = uuid;
		this.isOpponent = isOpponent ? true : false;
		this.playerNumber = playerNumber;
	}

	name: string;
	uuid: string;
}

export type Marble = {
	value: MarbleValue;
	isSelected: boolean;
};

export type Divot = {
	marble: Marble | undefined;
	isSelected: boolean;
	isEmpty: boolean;
};

export type User = {
	name: string;
	wins: number;
	losses: number;
	ready: boolean;
	uuid: string;
	activeGame: string;
};
