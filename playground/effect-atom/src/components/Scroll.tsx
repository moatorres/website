import { useAtomValue } from "@effect-atom/atom-react";

import { scrollYAtom } from "../atoms/scroll";

export function ScrollY() {
  const y = useAtomValue(scrollYAtom);
  return <h4>ScrollY: {y.toFixed(0)}</h4>;
}
