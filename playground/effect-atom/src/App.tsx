import { Fragment } from "react";

import { Counter } from "./components/Counter";
import { ScrollY } from "./components/Scroll";
import { UserCarousel, Users } from "./components/Users";

export default function App() {
  return (
    <Fragment>
      <Counter />
      <Users />
      <ScrollY />
      <UserCarousel />
    </Fragment>
  );
}
