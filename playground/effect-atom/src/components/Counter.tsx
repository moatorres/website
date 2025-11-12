import { Result, useAtom, useAtomValue } from "@effect-atom/atom-react";

import { combinedCountAtom, countAtom, doubleCountAtom, liveCounterAtom } from "../atoms/counter";

export function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const double = useAtomValue(doubleCountAtom);
  const combined = useAtomValue(combinedCountAtom);
  const live = useAtomValue(liveCounterAtom);

  return (
    <div>
      <h2>Count: {count}</h2>
      <h3>Double: {double}</h3>
      <h3>
        Sum (count + double + triple): {Result.getOrElse(combined, () => 0)}
      </h3>
      <h3>Live stream tick: {Result.getOrElse(live, () => 0)}</h3>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      <button onClick={() => setCount((c) => c - 1)}>Decrement</button>
    </div>
  );
}
