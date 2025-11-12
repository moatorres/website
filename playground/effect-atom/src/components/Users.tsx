import { Atom, Result, useAtomValue } from "@effect-atom/atom-react";
import { Cause, Option, Schedule, Stream } from "effect";
import { findUserByIdAtom, usersAtom } from "../atoms/users";

export function Users() {
  const users = useAtomValue(usersAtom);
  // const result = Result.getOrElse(users, () => [])
  // const result = Result.value(users).pipe(Option.getOrNull)

  return (
    <div>
      <h2 style={{ color: "#cbff10" }}>Users</h2>
      {Result.match(users, {
        onInitial: () => <p>Loading...</p>,
        onFailure: (error) => <p>Error: {Cause.pretty(error.cause)}</p>,
        onSuccess: (res) => res.value.map((u) => <p key={u.id}>{u.name}</p>),
      })}
    </div>
  );
}

export function UserProfile({ id }: { id: string }) {
  const user = useAtomValue(findUserByIdAtom(id));
  const result = Result.value(user).pipe(Option.getOrNull);
  return (
    <h4>
      User {result?.id}: {result?.name}
    </h4>
  );
}

const loopId = Atom.make(
  Stream.fromSchedule(Schedule.spaced(1000)).pipe(
    Stream.scan(1, (prev) => (prev % 3) + 1),
  ),
);

export function UserCarousel() {
  const liveValue = useAtomValue(loopId);
  const result = Result.getOrElse(liveValue, () => "1").toString();
  return <UserProfile id={result} />;
}
