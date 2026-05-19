export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <h1 className="text-3xl font-bold">Not found</h1>
      <p className="text-dim mt-2">This converter does not exist (yet).</p>
      <a href="/" className="btn-primary mt-6 inline-flex">
        Back home
      </a>
    </div>
  );
}
