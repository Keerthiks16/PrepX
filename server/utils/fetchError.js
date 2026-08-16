export class FetchError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
  }
}

export const isFatalFetcherError = (err) => {
  if (!(err instanceof FetchError)) return false;
  // 403 = not subscribed / forbidden; 429 = rate limited — don't hammer remaining queries
  return err.status === 403 || err.status === 429;
};
