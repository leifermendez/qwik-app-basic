import {
  component$,
  mutable,
  useContext,
  useStore,
  useStyles$,
  useStylesScoped$,
  useWatch$,
} from "@builder.io/qwik";
import { globalContext } from "~/context/global";
import { Card } from "../card/card";

export default component$(() => {
  const state = useContext(globalContext);

  useStylesScoped$(SectionStyle);

  const listItem = state.items.map((item) => (
    <a href={item.link}>
      <Card item={mutable(item)} />
    </a>
  ));

  return <div className="section-card">{listItem}</div>;
});

export const SectionStyle = `
    .section-card{
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        padding: 2rem 20rem;
        gap:1rem
    }
`;
