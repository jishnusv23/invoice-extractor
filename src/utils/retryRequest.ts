export async function retryRequest<T>(
  fn: () => Promise<T>,
  retries: 3,
  delayMs = 5000
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const status = error.response?.data?.error?.code;
      if (status === 429) {
        if (attempt < retries) {
          console.warn(
            `⚠️ Rate limit hit. Retrying in ${
              delayMs / 1000
            } seconds... (attempt ${attempt + 1} of ${retries})`
          );
          await new Promise((r) => setTimeout(r, delayMs));
          continue;
        } else {
          console.error("❌ Max retries reached due to rate limit.");
        }
      }
      throw error;
    }
  }
  throw new Error("Request failed after retries due to rate limit.");
}
