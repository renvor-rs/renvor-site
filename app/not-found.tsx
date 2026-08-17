import Header from './components/Header';

/**
 * 404.
 *
 * A static export emits this as `out/404.html`, which `static-web-server` serves for any
 * unmatched path. It deliberately shares the header and the palette, so a mistyped URL still
 * looks like the site rather than like a server default page — and it repeats the
 * development-status statement, because a 404 is a page a search engine can surface on its
 * own and it must not be the one page that overclaims.
 */
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="top" className="notfound-main">
        <section className="notfound">
          <p className="register-label mono">404 / no such register entry</p>
          <h1>That page does not exist.</h1>
          <p>
            The link may be out of date, or the page may never have existed. Renvor is in active
            development and its public surface is still small.
          </p>
          <p className="notfound-status">
            <strong>Renvor cannot be installed.</strong> Phase 002 delivers a tested
            transport-independent kernel; no crate, release, CLI, network transport, database
            adapter, or generated project is available yet.
          </p>
          <div className="actions">
            <a className="btn-primary" href="/">
              Back to the landing page
            </a>
            <a className="btn-secondary" href="https://github.com/renvor-rs/renvor">
              Browse the source ↗
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
