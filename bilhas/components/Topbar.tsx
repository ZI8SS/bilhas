import Link from "next/link";

export function Topbar() {
  return (
    <header className="topbar">
      <Link className="brand" href="/" aria-label="Bilhas">
        <span className="brand-mark">B</span>
        <span>
          <strong>Bilhas</strong>
          <small>o comentario que faltava</small>
        </span>
      </Link>
      <nav className="topnav" aria-label="Navegacao principal">
        <Link href="/">Jogos</Link>
        <Link href="/frases">Frases</Link>
      </nav>
    </header>
  );
}
