import { component$, useStyles$ } from "@builder.io/qwik";

export default component$(() => {
  useStyles$(logoStyle);
  return (
    <div className="logo">
      <span>LM</span>
    </div>
  );
});

export const logoStyle = `
  .logo{
    width:50px;
    height:50px;
    background-color:#F7DF1E;
    border-radius: 10px;
    display: flex;
    align-items: end;
    justify-content: end;
  }

  .logo span{
    font-weight: 600;
    margin: 0 5px;
    font-size: 1.25rem;
  }
`;
