import { component$, useStore, useStyles$ } from "@builder.io/qwik";

export default component$(() => {
  useStyles$(menuStyle);
  const state = useStore<{ item: { link: string; name: string }[] }>({
    item: [
      {
        name: "Técnologia",
        link: "/vectores",
      },
      {
        name: "Programación",
        link: "/photos",
      },
      {
        name: "Qwik",
        link: "/psd",
      },
      {
        name: "Angular",
        link: "/video",
      },
      {
        name: "React",
        link: "/video",
      },
      {
        name: "Node",
        link: "/video",
      },
    ],
  });

  return (
    <div className="menu">
      <ul>
        {state.item.map((menu) => (
          <li>{menu.name}</li>
        ))}
      </ul>
    </div>
  );
});

export const menuStyle = `
    .menu ul{
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        gap: 2rem;
    }

    .menu ul li{
        color:var(--color-2)
    }
`;
