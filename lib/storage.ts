class SafeStorage {
	private inMemoryData: Record<string, string> = {};

	getItem(key: string): string | null {
		try {
			if (typeof window !== "undefined" && window.localStorage) {
				return window.localStorage.getItem(key);
			}
		} catch (e) {
			console.warn("[SafeStorage] localStorage.getItem failed, using in-memory fallback:", e);
		}
		return this.inMemoryData[key] || null;
	}

	setItem(key: string, value: string): void {
		try {
			if (typeof window !== "undefined" && window.localStorage) {
				window.localStorage.setItem(key, value);
				return;
			}
		} catch (e) {
			console.warn("[SafeStorage] localStorage.setItem failed, using in-memory fallback:", e);
		}
		this.inMemoryData[key] = value;
	}

	removeItem(key: string): void {
		try {
			if (typeof window !== "undefined" && window.localStorage) {
				window.localStorage.removeItem(key);
				return;
			}
		} catch (e) {
			console.warn("[SafeStorage] localStorage.removeItem failed, using in-memory fallback:", e);
		}
		delete this.inMemoryData[key];
	}
}

export const safeStorage = new SafeStorage();
