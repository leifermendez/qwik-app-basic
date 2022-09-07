import {
  component$,
  useContext,
  useStyles$,
  useWatch$,
} from "@builder.io/qwik";
import { globalContext } from "~/context/global";

export default component$(() => {
  useStyles$(SectionStyle);
  const state = useContext(globalContext);

  useWatch$(({ track }) => {
    const searchInput = track(state, "src");
    if (!searchInput) {
      state.items = debouncedGetPeople(undefined);
      state.loading = false;
      return;
    }

    state.items = [...debouncedGetPeople(`${state.src}`)];
  });

  return (
    <div className="section">
      <div className="highlight-one">
        <h1>Mi primera App en Qwik 🙌</h1>
        <h4>
          Esta pagina esta hecha con{" "}
          <a
            style={{ "font-weight": 600 }}
            target="_blank"
            href="https://qwik.builder.io/"
          >
            Qwik
          </a>{" "}
          by{" "}
          <a
            style={{ "font-weight": 600 }}
            target="_blank"
            href="https://github.com/leifermendez"
          >
            Leifer Mendez
          </a>
        </h4>
      </div>
      <div className="input-src">
        <input
          onKeyUp$={(ev) => (state.src = (ev.target as HTMLInputElement).value)}
          placeholder="Buscar por nombre del perro..."
          type="text"
        />
      </div>
    </div>
  );
});

export const getPeople = (searchInput: string | undefined) => {
  const MOCK_DATA = [
    {
      title: "Max",
      description: "Es un perro alegre y juegueton",
      link: "/max",
      image:
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
    },
    {
      title: "Marly",
      description: "Es un perro alegre y juegueton",
      link: "/marly",
      image:
        "https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8ZG9nfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
    },
    {
      title: "Bob",
      description: "Es un perro alegre y juegueton",
      link: "/bob",
      image:
        "https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=735&q=80",
    },
    {
      title: "Shadow",
      description: "Es un perro alegre y juegueton",
      link: "/shadow",
      image:
        "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8ZG9nfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
    },
    {
      title: "Copo",
      description: "Es un perro alegre y juegueton",
      link: "/copo",
      image:
        "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTN8fGRvZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
    },
    {
      title: "Rails",
      description: "Es un perro alegre y juegueton",
      link: "/rails",
      image:
        "https://images.unsplash.com/photo-1597633425046-08f5110420b5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTd8fGRvZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
    },
  ];

  return searchInput
    ? MOCK_DATA.filter((item) => item.title.toLowerCase().includes(searchInput))
    : MOCK_DATA;
};

function debounce<F extends (...args: any[]) => any>(fn: F, delay = 500) {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    return new Promise((resolve) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        resolve(fn(...args));
      }, delay);
    });
  };
}

export const debouncedGetPeople = getPeople;

export const SectionStyle = `
    .section h1, .section h4{
        font-weight:400;
        margin:0
    }
    .section h4{
        color:var(--color-3)
    }
    .section{
        display: flex;
        flex-direction: column;
        text-align: center;
        gap:1.3rem
    }
    .highlight-one{
        display:flex;
        flex-direction:column;
        gap:.5rem
    }
    .section h1{
        font-size:3rem;
    }

    .input-src input{
        background: white;
        width: 500px;
        height: 50px;
        border: 0;
        border-radius: 10px;
        padding: 0 0.7rem;
        font-size: 90%;
    }
`;
