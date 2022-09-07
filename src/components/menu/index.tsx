import { component$, useStore, useStyles$ } from "@builder.io/qwik";

export default component$(() => {
  useStyles$(menuStyle);
  const state = useStore<{ item: { link: string; name: string }[] }>({
    item: [
      {
        name: "Técnologia",
        link: "https://www.youtube.com/channel/UCgrIGp5QAnC0J8LfNJxDRDw",
      },
      {
        name: "Programación",
        link: "https://www.youtube.com/channel/UCgrIGp5QAnC0J8LfNJxDRDw",
      },
      {
        name: "Qwik",
        link: "https://www.youtube.com/channel/UCgrIGp5QAnC0J8LfNJxDRDw",
      },
      {
        name: "Angular",
        link: "https://www.youtube.com/channel/UCgrIGp5QAnC0J8LfNJxDRDw",
      },
      {
        name: "React",
        link: "https://www.youtube.com/channel/UCgrIGp5QAnC0J8LfNJxDRDw",
      },
      {
        name: "Node",
        link: "https://www.youtube.com/channel/UCgrIGp5QAnC0J8LfNJxDRDw",
      },
    ],
  });

  return (
    <div className="menu">
      <ul>
        {state.item.map((menu) => (
          <li>
            <a target={"_blank"} href={menu.link}>
              {menu.name}
            </a>
          </li>
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
