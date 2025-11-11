// utils/move.ts (8 lines)
export function move<T>(list: T[], from: number, to: number) {
  const copy = list.slice();
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}
