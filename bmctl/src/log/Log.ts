const label = "[bmctl]";

export function info(v: unknown): void {
  console.info(`${label} ${v}`);
}

export function warn(v: unknown): void {
  console.warn(`${label} ${v}`);
}

export function error(v: unknown): void {
  console.error(`${label} ${v}`);
}
