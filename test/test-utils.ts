/**
 * Converts requestAnimationFrame to a promise.
 */
export function tick(): Promise<void> {
  return new Promise<void>(resolve => {
    requestAnimationFrame(() => resolve());
  });
}

/**
 * Converts setTimeout to a promise.
 */
export function timer(duration = 0): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), duration);
  });
}
