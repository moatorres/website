import { Atom } from "@effect-atom/atom-react";

export const scrollYAtom = Atom.make((get) => {
  const onScroll = () => get.setSelf(window.scrollY);
  window.addEventListener("scroll", onScroll);
  get.addFinalizer(() => window.removeEventListener("scroll", onScroll));
  return window.scrollY;
});
