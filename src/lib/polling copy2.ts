let interval: NodeJS.Timeout | undefined;
let pollCount = 0;

const getDelay = (easing: 'constant' | 'linear', delay: number, count = 1) => {
	if (easing === 'constant') return delay;
	if (easing === 'linear') return delay * count * 0.25;
};

type Props = { callback: () => void; delay: number; easing: 'constant' | 'linear' };
const stop = () => {
	if (interval) {
		clearInterval(interval);
		interval = undefined;
	}
	pollCount = 0;
};

const reset = () => {
	pollCount = 0;
};

const start = ({ callback, delay, easing }: Props) => {
	console.debug('poll.start', callback);
	if (interval) {
		clearInterval(interval);
		interval = undefined;
	}
	interval = setTimeout(
		async () => {
			console.debug('setTimeout run', pollCount);
			pollCount += 1;
			callback();
			start({ callback, delay, easing });
		},
		getDelay(easing, delay, pollCount)
	);
};

export const poll = {
	reset,
	start,
	stop
};

// export const poll = (params: Props) => {
// 	if (interval) {
// 		clearInterval(interval);
// 		interval = undefined;
// 	}
// 	if (params.action === 'stop') {
// 		pollCount = 0;
// 		return;
// 	}

// 	const { callback, delay, easing } = params;
// 	interval = setTimeout(
// 		async () => {
// 			pollCount += 1;
// 			callback();
// 			poll(params);
// 		},
// 		getDelay(easing, delay, pollCount)
// 	);
// };
