import { component$, Slot, useStore, useStyles$ } from "@builder.io/qwik";
import Logo from "../logo/logo";
import Menu from "../menu";

export default component$(() => {
  useStyles$(headerStyle);
  return (
    <div className="header">
      <div>
        <Logo />
      </div>
      <div>
        <Menu />
      </div>
    </div>
  );
});

export const headerStyle = `
  .header {
    font-weight:500;
    display: flex;
    gap: 3rem;
    padding: 1rem 5rem;
    align-items:center
`;
