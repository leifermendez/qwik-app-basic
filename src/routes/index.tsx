import {
  component$,
  useContextProvider,
  useStore,
  useWatch$,
} from "@builder.io/qwik";
import CardSection from "../components/section-card";
import Input from "../components/input";
import { useContent } from "@builder.io/qwik-city";
import { globalContext } from "~/context/global";
import {
  App,
  SuggestionsListComponent,
  AutoComplete,
} from "../components/test/test";
export default component$(() => {
  const state = useStore<{
    src: string | undefined;
    loading: boolean;
    items: {
      image: string;
      title: string;
      link: string;
      description: string;
    }[];
  }>({
    src: undefined,
    items: [
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
    ],
    loading: false,
  });
  useContextProvider(globalContext, state);

  return (
    <div style={{ padding: "3rem 0" }} className="wrapper-body">
      <Input />
      <CardSection />
    </div>
  );
});
