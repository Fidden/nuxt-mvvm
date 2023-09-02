export function sending<TKey extends string>(key: TKey) {
	return function (target: any, propertyKey: string, descriptor: any) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			if (!this.sending) {
				throw new Error('Inject "sending.service" first.');
			}

			if (!this.error) {
				throw new Error('Inject "error.service" first.');
			}

			if (!this.sending.keys[key]) {
				this.sending.keys[key] = 0;
			}

			try {
				this.sending.keys[key]++;
				return await originalMethod.apply(this, args);
			} catch (e: any) {
				this.error.setup(e);
			} finally {
				this.sending.keys[key]--;
			}
		};

		return descriptor;
	};
}
