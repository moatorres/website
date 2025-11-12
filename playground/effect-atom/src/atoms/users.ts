import { Atom, Result } from '@effect-atom/atom-react'
import { Effect } from 'effect'

const users = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
]

export class Users extends Effect.Service<Users>()('app/Users', {
  effect: Effect.gen(function* () {
    const addUser = (name: string) => {
      const newUser = { id: new Date().toTimeString(), name }
      users.push(newUser)
      return Effect.succeed(newUser)
    }

    const findById = (id: string) => {
      return Effect.fromNullable(users.filter((u) => u.id === id)[0])
    }

    const getAll = () => Effect.succeed(users)

    return { addUser, findById, getAll }
  }),
}) {}

const runtime = Atom.runtime(Users.Default)

export const addUserAtom = Atom.family((name: string) =>
  runtime.atom(
    Effect.fn(function* () {
      const users = yield* Users
      const newUser = yield* users.addUser(name)
      return newUser
    })
  )
)

export const findUserByIdAtom = Atom.family((id: string) =>
  runtime.atom(
    Effect.gen(function* () {
      const users = yield* Users
      return yield* users.findById(id)
    })
  )
)

export const usersAtom: Atom.Atom<
  Result.Result<{ id: string; name: string }[]>
> = runtime.atom(
  Effect.gen(function* () {
    const users = yield* Users
    yield* Effect.sleep('2 seconds')
    return yield* users.getAll()
  })
)
