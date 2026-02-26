import Head from 'next/head';
import Link from 'next/link';

export default function Layout({ children, title = 'Personal Finance', description = 'A simple expense tracker built for portfolio' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <header className="header">
        <Link href="/" className="logo">Finance</Link>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/dashboard" style={{marginLeft:16}}>Dashboard</Link>
        </nav>
      </header>
      <main className="container">{children}</main>
      <footer className="footer">Built with Next.js &amp; Express | <a href="https://github.com/prestonhuss42-commits/personal-finance" target="_blank" rel="noopener noreferrer">Source</a></footer>
    </>
  );
}
