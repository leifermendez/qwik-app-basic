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
        padding: 2rem 15vw;
        gap:1rem
    }
    @media screen and (max-width: 880px) {
      .section-card {
          padding: 2rem;
          grid-template-columns: repeat(2, 1fr);
      }
    }
    @media screen and (max-width: 600px) {
      .section-card {
          padding: 2rem;
          grid-template-columns: repeat(1, 1fr);
      }
    }
`;
