export default function Home() {
  return (
    <main className="p-6">
      <h1>USO Fusion</h1>
      <nav aria-label="Primary">
        <ul>
          <li>
            <a href="/dashboard">DASHBOARD</a>
          </li>
          <li>
            <a href="/strategy">STRATEGY</a>
          </li>
          <li>
            <a href="/legislation">LEGISLATION</a>
          </li>
          <li>
            <a href="/sentiment">SENTIMENT</a>
          </li>
          <li>
            <a href="/vegas-intel">VEGAS INTEL</a>
          </li>
        </ul>
      </nav>
    </main>
  );
}
