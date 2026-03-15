declare module 'rate-limiter-flexible' {
	export type ConsumeResponse = { remainingPoints?: number };
	export type RejectResponse = { msBeforeNext?: number; remainingPoints?: number };

	export class RateLimiterRedis {
		constructor(opts: { storeClient: unknown; points: number; duration: number; keyPrefix?: string });
		consume(key: string): Promise<ConsumeResponse>;
	}

	const exported: {
		RateLimiterRedis: typeof RateLimiterRedis;
	};

	export default exported;
}

declare module 'ioredis' {
	// Minimal constructor shape used by our code
	class IORedis {
		constructor(url?: string);
		on(event: string, listener: (...args: unknown[]) => void): this;
		disconnect(): void;
	}

	export default IORedis;
}
