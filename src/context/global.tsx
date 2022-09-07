import { createContext } from "@builder.io/qwik";

export const globalContext = createContext<{
  src: undefined | string;
  loading: boolean;
  items: {
    image: string;
    title: string;
    link: string;
    description: string;
  }[];
}>("my-context");
