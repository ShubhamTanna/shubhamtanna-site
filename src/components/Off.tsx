import Image from "next/image";

export function OffTiles({ items, style }: { items: { title: string; text: string; photo: string }[]; style?: React.CSSProperties }) {
  return (
    <div className="off" style={style}>
      {items.map((o) => (
        <div key={o.title} className="offt">
          <Image className="ph" src={o.photo} alt={o.title} width={1200} height={900} sizes="(max-width: 480px) 100vw, (max-width: 860px) 50vw, 420px" />
          <div className="tx"><b>{o.title}</b><p>{o.text}</p></div>
        </div>
      ))}
    </div>
  );
}
