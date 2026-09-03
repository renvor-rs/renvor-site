import Header from './components/Header';
import AmbientField from './components/AmbientField';
import Hero from './components/Hero';
import LensCarousel from './components/LensCarousel';
import Panorama from './components/Panorama';
import ScrollFX from './components/ScrollFX';
import SolutionTabs from './components/SolutionTabs';

const STAGE_NAMES = ['Load', 'Validate', 'Register', 'Boot', 'Ready', 'Drain', 'Stop'];

const STATEMENT =
  'A request enters through one visible route, crosses policy and transaction boundaries at an owned junction, reaches replaceable capability ports, and returns through one typed error contract.';

const ROUTE_LEDGER = [
  {
    title: 'Lifecycle and provider graph',
    state: 'Phase 002 / implemented and tested',
    copy: 'The kernel owns ordered phases, dependency resolution, bounded work, rollback, liveness, and readiness.',
  },
  {
    title: 'REST, validation, and API description',
    state: 'Phases 004 and 005 / implemented and tested',
    copy: 'The opt-in REST and HTTP adapter, runtime validation, RFC 9457 failures, OpenAPI 3.2 generation, and compatibility gate run in workspace tests.',
  },
  {
    title: 'Persistence, identity, clients, and packages',
    state: 'Phases 006–009 delivered / unpublished',
    copy: 'SQLx and SeaORM adapters, four-row database evidence, authentication, sessions, and optional tokens exist. Client generation, desktop packaging, and installable packages do not.',
  },
];

export default function Page() {
  return (
    <>
      <Header />
      <main id="top">
        <aside className="status-notice" role="note" aria-label="Project status">
          <span className="notice-label mono">In development / prerelease</span>
          <p>
            <strong>Renvor is in active development with no supported installation path.</strong>{' '}
            Phases 002 through 009 implement and test the kernel, CLI, HTTP transport, validation,
            persistence, and authentication. <strong>Nothing is published, the facade exposes
            neither persistence nor authentication, and generated projects cannot yet resolve a
            Renvor dependency.</strong>
          </p>
          <a href="https://github.com/renvor-rs/renvor/blob/main/PLAN.md">Read the public plan</a>
        </aside>

        <AmbientField />

        <Hero />

        <div className="signal-loop" aria-label="Kernel lifecycle sequence">
          <span className="sr-only">Load, Validate, Register, Boot, Ready, Drain, Stop</span>
          <div className="signal-loop-track" aria-hidden="true">
            {[...STAGE_NAMES, ...STAGE_NAMES].map((name, index) => (
              <span className="mono" key={`${name}-${index}`}>
                <i />
                {name}
              </span>
            ))}
          </div>
        </div>

        <section id="solutions" className="section system-section">
          <div className="section-intro boundary-manifesto" data-boundary-manifesto>
            <figure className="boundary-map">
              <svg
                viewBox="0 0 470 360"
                role="img"
                aria-labelledby="boundary-map-title boundary-map-description"
                focusable="false"
              >
                <title id="boundary-map-title">Two routes through visible framework gates</title>
                <desc id="boundary-map-description">
                  The REST and HTTP route passes through validation, and the CLI and generator
                  route passes through configuration. Both enter an ordinary Rust application core.
                </desc>

                <g className="boundary-map-grid" aria-hidden="true">
                  <path d="M26 60H444M26 180H444M26 300H444" />
                  <path d="M26 60V300M238 60V300M444 60V300" />
                </g>
                <g className="boundary-map-headings" aria-hidden="true">
                  <text x="26" y="36">framework inputs</text>
                  <text x="238" y="36" textAnchor="middle">visible gates</text>
                  <text x="444" y="36" textAnchor="end">application core</text>
                </g>

                <path className="boundary-plane" d="M238 70V290" aria-hidden="true" />

                <path
                  className="boundary-route boundary-route-signal"
                  data-boundary-route
                  d="M28 112H152L238 150H354"
                />
                <path
                  className="boundary-route boundary-route-core"
                  data-boundary-route
                  d="M28 258H152L238 220H354"
                />

                <g className="boundary-input boundary-input-signal" aria-hidden="true">
                  <rect x="28" y="103" width="18" height="18" />
                  <text x="28" y="92">REST + HTTP</text>
                </g>
                <g className="boundary-input boundary-input-core" aria-hidden="true">
                  <rect x="28" y="249" width="18" height="18" />
                  <text x="28" y="287">CLI + generator</text>
                </g>

                <g className="boundary-gate" data-boundary-gate aria-hidden="true">
                  <rect x="226" y="136" width="24" height="28" />
                  <circle cx="238" cy="150" r="4" />
                  <text x="218" y="112" textAnchor="end">validation</text>
                </g>
                <g className="boundary-gate" data-boundary-gate aria-hidden="true">
                  <rect x="226" y="206" width="24" height="28" />
                  <circle cx="238" cy="220" r="4" />
                  <text x="218" y="268" textAnchor="end">configuration</text>
                </g>

                <g className="boundary-core" data-boundary-core aria-hidden="true">
                  <rect x="354" y="86" width="90" height="204" />
                  <text x="399" y="154" textAnchor="middle">ordinary</text>
                  <text className="boundary-core-rust" x="399" y="192" textAnchor="middle">Rust</text>
                  <text x="399" y="218" textAnchor="middle">application</text>
                  <text x="399" y="238" textAnchor="middle">core</text>
                </g>

              </svg>
            </figure>

            <div className="boundary-manifesto-copy" data-boundary-copy>
              <p className="section-kicker mono">Visible routes / explicit ownership</p>
              <h2>The framework boundary should stay readable when the system gets real.</h2>
              <p>
                Renvor is being designed around one strong idea: framework choices belong at
                visible boundaries, while application services stay ordinary Rust. The kernel,
                CLI, generator, REST and HTTP adapter, validation boundary, and API description now
                prove that shape in workspace tests. The broader application stack is still being built.
              </p>

              <div className="boundary-evidence-wrap">
                <span className="boundary-evidence-track" data-boundary-evidence-track aria-hidden="true" />
                <ol className="boundary-evidence" aria-label="Framework boundary evidence route">
                  <li data-boundary-evidence>
                    <i aria-hidden="true" />
                    <span className="mono">Framework inputs</span>
                    <strong>CLI + HTTP</strong>
                  </li>
                  <li data-boundary-evidence>
                    <i aria-hidden="true" />
                    <span className="mono">Visible gates</span>
                    <strong>validation + configuration</strong>
                  </li>
                  <li data-boundary-evidence>
                    <i aria-hidden="true" />
                    <span className="mono">Application core</span>
                    <strong>ordinary Rust</strong>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          <div className="proof-bento" data-proof-board>
            <article className="proof-primary">
              <div className="proof-route" aria-hidden="true">
                <svg
                  className="proof-junction-map"
                  viewBox="0 0 880 320"
                  role="presentation"
                  focusable="false"
                >
                  <g className="proof-map-grid">
                    <path d="M48 48H832M48 160H832M48 272H832" />
                    <path d="M48 48V272M244 48V272M440 48V272M636 48V272M832 48V272" />
                  </g>
                  <g className="proof-map-labels mono">
                    <text x="48" y="26">CONTROL ROUTE / PHASE 002 TO 009</text>
                    <text x="832" y="26" textAnchor="end">JUNCTION J-05</text>
                  </g>

                  <path
                    className="proof-rail proof-rail-core"
                    data-proof-rail
                    d="M64 96H278L408 160H816"
                  />
                  <path
                    className="proof-rail proof-rail-signal"
                    data-proof-rail
                    d="M64 248H278L408 160L554 248H816"
                  />

                  <g className="proof-junction-node" data-proof-node>
                    <circle cx="408" cy="160" r="20" />
                    <circle cx="408" cy="160" r="5" />
                    <path d="M408 132V116M408 188V204M380 160H364M436 160H452" />
                  </g>

                  <g className="proof-phase-marker" data-proof-phase>
                    <circle cx="150" cy="96" r="8" />
                    <path d="M150 112V134" />
                    <text x="150" y="154" textAnchor="middle">002</text>
                  </g>
                  <g className="proof-phase-marker" data-proof-phase>
                    <circle cx="294" cy="239" r="8" />
                    <path d="M294 222V200" />
                    <text x="294" y="190" textAnchor="middle">004</text>
                  </g>
                  <g className="proof-phase-marker" data-proof-phase>
                    <circle cx="554" cy="160" r="8" />
                    <path d="M554 144V122" />
                    <text x="554" y="112" textAnchor="middle">006</text>
                  </g>
                  <g className="proof-phase-marker" data-proof-phase>
                    <circle cx="706" cy="248" r="8" />
                    <path d="M706 232V210" />
                    <text x="706" y="200" textAnchor="middle">009</text>
                  </g>
                </svg>
              </div>
              <div className="proof-primary-copy">
                <p className="mono">Phases 002 to 009 / implemented and tested</p>
                <h3>A tested route through the junction.</h3>
                <p>
                  Seven ordered lifecycle phases, provider dependencies, layered configuration,
                  bounded deadlines, cancellation, rollback, REST and HTTP delivery, runtime
                  validation, Problem Details, OpenAPI 3.2, persistence, and authentication are
                  implemented and tested.
                </p>
              </div>
            </article>
            <article className="proof-secondary">
              <span className="proof-index mono">Configuration route</span>
              <h3>Every value keeps its source.</h3>
              <p>
                Layered configuration retains per-key attribution while secrets stay redacted from
                every diagnostic path.
              </p>
              <ol className="precedence-stack" aria-label="Configuration precedence order">
                <li data-precedence-tier>
                  <span className="mono">01</span>
                  <strong>defaults</strong>
                  <i className="mono">base</i>
                </li>
                <li data-precedence-tier>
                  <span className="mono">02</span>
                  <strong>file</strong>
                  <i className="mono">layer</i>
                </li>
                <li data-precedence-tier>
                  <span className="mono">03</span>
                  <strong>environment</strong>
                  <i className="mono">override</i>
                </li>
                <li data-precedence-tier>
                  <span className="mono">04</span>
                  <strong>CLI</strong>
                  <i className="mono">explicit</i>
                </li>
              </ol>
            </article>
            <article className="proof-tertiary">
              <span className="proof-index mono">Release route</span>
              <h3>Implemented does not mean published.</h3>
              <p>
                No crate or executable is published. Generated projects cannot resolve Renvor,
                and the implemented database and authentication crates are not reachable through
                the facade.
              </p>
              <ul className="release-ledger" aria-label="Current release status">
                <li data-release-status>
                  <span className="mono">workspace</span>
                  <strong>tested</strong>
                </li>
                <li data-release-status>
                  <span className="mono">registry</span>
                  <strong>unpublished</strong>
                </li>
                <li data-release-status>
                  <span className="mono">install</span>
                  <strong>unavailable</strong>
                </li>
              </ul>
            </article>
          </div>

          <SolutionTabs />

          <div className="command-pair" data-stagger-group>
            <article>
              <span className="mono">Phase 003 / implemented and tested / unpublished</span>
              <h3>Transactional project generation</h3>
              <p>The CLI and generator run from source, preserve safe writes, and record project choices.</p>
              <code className="unavailable-command">renvor new</code>
              <em className="unavailable-note">
                No supported install command exists. The CLI is implemented and tested, but no package is published.
              </em>
            </article>
            <article>
              <span className="mono">Planned for Renvor 4.0</span>
              <h3>Installable capability packages</h3>
              <p>Packages are designed to join existing projects through a versioned contract.</p>
              <code className="unavailable-command">renvor add renvor-rbac</code>
              <em className="unavailable-note">Unavailable. No package has been published.</em>
            </article>
          </div>
        </section>

        <section
          className="architecture-statement"
          data-architecture-trace
          aria-labelledby="architecture-trace-title"
        >
          <header className="architecture-trace-header">
            <h2 id="architecture-trace-title">One request. Four visible stages.</h2>
            <p>{STATEMENT}</p>
          </header>

          <div className="architecture-trace-composition">
            <svg
              className="architecture-route-map"
              viewBox="0 0 1200 330"
              role="img"
              aria-labelledby="architecture-route-title architecture-route-description"
              focusable="false"
            >
              <title id="architecture-route-title">Request and typed return route</title>
              <desc id="architecture-route-description">
                An HTTP and REST request enters the system, crosses an owned policy and transaction
                junction, reaches a replaceable capability port, and returns through an RFC 9457
                Problem Details contract.
              </desc>

              <g className="architecture-route-grid" aria-hidden="true">
                <path d="M52 52H1148M52 165H1148M52 278H1148" />
                <path d="M52 52V278M326 52V278M600 52V278M874 52V278M1148 52V278" />
              </g>

              <g className="architecture-route-labels" aria-hidden="true">
                <text x="52" y="34">request</text>
                <text x="1148" y="34" textAnchor="end">typed return</text>
              </g>

              <path
                className="architecture-route architecture-route-outbound"
                data-architecture-route
                d="M58 118H310L374 82H648L712 118H1088"
              />
              <path
                className="architecture-route architecture-route-return"
                data-architecture-route
                d="M1088 220H712L648 256H374L310 220H58"
              />
              <path
                className="architecture-return-link"
                data-architecture-route
                d="M1088 118V220"
              />

              <g className="architecture-node architecture-node-entry" data-architecture-node aria-hidden="true">
                <rect x="86" y="103" width="30" height="30" />
                <text x="101" y="122" textAnchor="middle">01</text>
              </g>
              <g className="architecture-node" data-architecture-node aria-hidden="true">
                <rect x="359" y="67" width="30" height="30" />
                <text x="374" y="86" textAnchor="middle">02</text>
              </g>
              <g className="architecture-node" data-architecture-node aria-hidden="true">
                <rect x="697" y="103" width="30" height="30" />
                <text x="712" y="122" textAnchor="middle">03</text>
              </g>
              <g className="architecture-node architecture-node-return" data-architecture-node aria-hidden="true">
                <rect x="1073" y="154" width="30" height="30" />
                <text x="1088" y="173" textAnchor="middle">04</text>
              </g>
            </svg>

            <ol className="architecture-stages" aria-label="Ordered request trace">
              <li data-architecture-stage>
                <span className="architecture-stage-index mono">01 / Entry</span>
                <h3>HTTP / REST</h3>
                <p>A request enters through one visible transport route.</p>
              </li>
              <li data-architecture-stage>
                <span className="architecture-stage-index mono">02 / Owned junction</span>
                <h3>Policy + transaction</h3>
                <p>Policy and transaction boundaries meet at one owned junction.</p>
              </li>
              <li data-architecture-stage>
                <span className="architecture-stage-index mono">03 / Capability port</span>
                <h3>Provider boundary</h3>
                <p>The route reaches a replaceable capability through its provider boundary.</p>
              </li>
              <li data-architecture-stage>
                <span className="architecture-stage-index mono">04 / Typed return</span>
                <h3>RFC 9457</h3>
                <p>Failures return through one typed Problem Details contract.</p>
              </li>
            </ol>
          </div>
        </section>

        <Panorama />

        <section id="operations" className="section operations-section">
          <div className="operations-heading">
            <p className="section-kicker mono">Reviewed language / verified evidence</p>
            <h2>A lifecycle with a way in, a way through, and a deliberate way out.</h2>
            <p>
              The sequence below is the current kernel, not a future promise. Assembly is
              synchronous. Boot is asynchronous. Failed boot rolls back what it started.
            </p>
          </div>

          <div
            className="lifecycle-board"
            data-lifecycle-board
            data-loop-state="idle"
            data-current-phase="01"
            data-loop-cycle="0"
            role="group"
            aria-labelledby="lifecycle-board-title"
          >
            <header className="lifecycle-board-head">
              <div>
                <span className="mono">Kernel interlocking / ordered lifecycle</span>
                <strong id="lifecycle-board-title">Seven phases. One controlled route.</strong>
              </div>
              <output className="lifecycle-readout mono" data-lifecycle-readout aria-live="off">
                01 / Load
              </output>
            </header>

            <div className="lifecycle-phase-field" data-lifecycle-field>
              <span className="lifecycle-main-rail" aria-hidden="true" />
              <span className="lifecycle-cursor" data-lifecycle-cursor aria-hidden="true">
                <i />
              </span>

              <ol
                className="lifecycle-phases"
                aria-label="Load, Validate, Register, Boot, Ready, Drain, Stop"
              >
                {STAGE_NAMES.map((name, index) => (
                  <li
                    className={name === 'Boot' ? 'lifecycle-phase lifecycle-phase-boot' : 'lifecycle-phase'}
                    data-lifecycle-node
                    data-lifecycle-phase={String(index + 1).padStart(2, '0')}
                    key={name}
                  >
                    <span className="lifecycle-node-marker" data-lifecycle-marker aria-hidden="true" />
                    <span className="lifecycle-phase-name">
                      <i className="mono">{String(index + 1).padStart(2, '0')}</i>
                      <strong>{name}</strong>
                    </span>

                    {name === 'Boot' ? (
                      <aside className="lifecycle-rollback" data-lifecycle-rollback>
                        <i className="lifecycle-rollback-signal" aria-hidden="true" />
                        <span className="mono">Failed boot / rollback branch</span>
                        <strong>Rollback what started</strong>
                        <p>Boot is asynchronous. Failed boot rolls back what it started.</p>
                      </aside>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="route-ledger" data-lifecycle-ledger>
            <header className="route-ledger-head mono" aria-hidden="true">
              <span>State</span>
              <span>Evidence surface</span>
              <span>Verified scope</span>
            </header>
            {ROUTE_LEDGER.map((item) => (
              <article data-lifecycle-evidence-row key={item.title}>
                <span className="route-state mono">{item.state}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <LensCarousel />

        <section id="docs" className="docs-section docs-band">
          <div className="docs-rail" aria-hidden="true">
            {/* eslint-disable @next/next/no-img-element */}
            <img
              className="only-light"
              src="/assets/renvor-parallel-passage-v40-dark.svg"
              alt=""
              width={400}
              height={400}
            />
            <img
              className="only-dark"
              src="/assets/renvor-parallel-passage-v40-light.svg"
              alt=""
              width={400}
              height={400}
            />
            {/* eslint-enable @next/next/no-img-element */}
          </div>
          <div className="docs-content" data-reveal>
            {/* eslint-disable @next/next/no-img-element */}
            <img
              className="docs-mark band-mark-dark-variant"
              src="/assets/renvor-mark-v40-dark.svg"
              alt=""
              width={120}
              height={123}
            />
            <img
              className="docs-mark band-mark-light-variant"
              src="/assets/renvor-mark-v40-light.svg"
              alt=""
              width={120}
              height={123}
            />
            {/* eslint-enable @next/next/no-img-element */}
            <p className="docs-state mono">In development / prerelease</p>
            <h2>Follow the route. Inspect the junction.</h2>
            <p className="docs-caveat">
              There is nothing to install. The source, governance, plan, tested kernel, CLI,
              HTTP adapter, validation, persistence, authentication, and OpenAPI evidence are
              public and readable today.
            </p>
            <div className="actions">
              <a className="btn-primary" href="https://github.com/renvor-rs/renvor">
                Browse the source
              </a>
              <a className="btn-secondary" href="https://docs.renvor.dev/">
                Read the documentation
              </a>
            </div>
          </div>
        </section>

        <footer className="site-footer">
          <div>
            {/* eslint-disable @next/next/no-img-element */}
            <img
              className="only-light"
              src="/assets/renvor-favicon-v40-light.svg"
              alt=""
              width={24}
              height={24}
            />
            <img
              className="only-dark"
              src="/assets/renvor-favicon-v40-dark.svg"
              alt=""
              width={24}
              height={24}
            />
            {/* eslint-enable @next/next/no-img-element */}
            <span>Renvor / Two routes. One junction.</span>
          </div>
          <nav aria-label="Footer" className="mono">
            <a href="https://github.com/renvor-rs/renvor">GitHub</a>
            <a href="https://docs.renvor.dev/">Docs</a>
            <a href="https://github.com/renvor-rs/renvor/blob/main/PLAN.md">Plan</a>
            <a href="https://github.com/renvor-rs/renvor/blob/main/SECURITY.md">Security</a>
          </nav>
        </footer>
      </main>
      <ScrollFX />
    </>
  );
}
