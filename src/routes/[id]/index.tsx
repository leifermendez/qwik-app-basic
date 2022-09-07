import { component$, useStore } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { Card } from "../../components/card/card";

export default component$(() => {
  const state = useStore({
    item: {
      title: "Max",
      description: "Es un perro alegre y juegueton",
      link: "/1",
      image:
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
    },
  });

  const { params } = useLocation();
  return (
    <div>
      <div>MyCmp {params.id}</div>
      <Card item={state.item} />
    </div>
  );
});
