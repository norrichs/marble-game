type Props = { callback: () => void; delay: number; easing: 'constant' | 'linear' };

export class Poll {
	interval: NodeJS.Timeout | undefined = $state(undefined);
	pollCount = 0;
	callback: (() => void) | undefined = undefined;
	delay: number = 0;
	easing: 'constant' | 'linear' = 'constant';
	isPaused = false;

	getDelay(easing: 'constant' | 'linear', delay: number, count = 1) {
		if (easing === 'constant') return delay;
		if (easing === 'linear') return delay * count * 0.25;
	}

	stop() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = undefined;
		}
		this.callback = undefined;
		this.delay = 0;
		this.easing = 'linear';
		this.pollCount = 0;
	}

	reset() {
		this.pollCount = 0;
	}

	pause() {
		console.debug('PAUSE', this.interval, this.callback);
		if (!this.interval) {
			console.error('pausing a non-running timeout');
		}
		this.isPaused = true;
		console.debug('begin pause');
		clearInterval(this.interval);
		this.interval = undefined;
	}

	resume() {
		if (!this.callback) {
			console.error('no call back on polling resume');
			return;
		}
		console.debug('resume');
		this.start({ callback: this.callback, delay: this.delay, easing: this.easing });
	}

	start({ callback, delay, easing }: Props) {
		console.debug('START', callback);
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = undefined;
		}

		this.callback = callback;
		this.delay = delay;
		this.easing = easing;
		if (this.isPaused) {
			this.isPaused = false;
			this.reset();
		}

		this.interval = setTimeout(
			async () => {
				console.debug('setTimeout run', this.pollCount);
				this.pollCount += 1;
				callback();
				if (!this.isPaused) {
					this.start({ callback, delay, easing });
				}
			},
			this.getDelay(easing, delay, this.pollCount)
		);
	}
}
