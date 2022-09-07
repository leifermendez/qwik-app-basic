import { component$, useStylesScoped$ } from "@builder.io/qwik";

export const Card = component$(
  (prosp: {
    item: { image: string; title: string; link: string; description: string };
  }) => {
    useStylesScoped$(CardStyle);
    return (
      <div className="card">
        <img src={prosp.item.image} alt={prosp.item.title} />
        <div className="title">{prosp.item.title}</div>
        <div className="description">{prosp.item.description}</div>
      </div>
    );
  }
);

export const CardStyle = `
    .card{
        position:relative;
        max-width:600px;
        height:350px;
        display:block;
        background-color:white;
        border-radius:20px;
        padding:1rem
    }
    .title{
        font-weight:500
    }
    .description{
        color:var(--color-2)
    }
    .card img{
        position:relative;
        height: 280px;
        width:100%;
        object-fit: cover;
        border-radius: 20px;
    }
`;
