export function asset(path: string) {
  const base = process.env.PUBLIC_URL ?? "";
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
