import { Atom, Result } from "@effect-atom/atom-react";
import { Effect, Schedule, Stream } from "effect";

export const countAtom = Atom.make(0);

export const doubleCountAtom = Atom.map(countAtom, (count) => count * 2);

export const tripleCountAtom: Atom.Atom<Result.Result<number>> = Atom.make(
  Effect.fn(function*(get) {
    const count = get(countAtom);
    yield* Effect.sleep(50);
    return count * 3;
  }),
);

export const combinedCountAtom: Atom.Atom<Result.Result<number>> = Atom.make(
  Effect.fn(function*(get) {
    const count = get(countAtom);
    const double = get(doubleCountAtom);
    const triple = yield* get.result(tripleCountAtom);
    return count + double + triple;
  }),
);

export const liveCounterAtom: Atom.Atom<Result.Result<number>> = Atom.make(
  Stream.fromSchedule(Schedule.spaced(1000)),
);
