import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title:
    "From CREATE TABLE to a Go struct that scans rows — step by step",
  description:
    "Turn a Postgres / MySQL / SQLite CREATE TABLE statement into a Go struct with proper json and db tags, ready to scan with database/sql or sqlx.",
  keywords: [
    "sql to go struct",
    "create table to go",
    "postgres to go struct",
    "mysql to go struct",
    "sqlx scan",
    "database/sql Go struct",
  ],
  alternates: { canonical: `${SITE.url}/guides/sql-to-go-struct` },
  openGraph: {
    title: "From CREATE TABLE to a Go struct that scans rows",
    description: "Postgres / MySQL / SQLite DDL → Go struct with json + db tags.",
    url: `${SITE.url}/guides/sql-to-go-struct`,
    type: "article",
    images: [{ url: "/og.svg", width: 1200, height: 630 }],
  },
};

const sampleSql = `CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`;

const generated = `package main

type User struct {
\tID        int       \`json:"id"\`
\tName      string    \`json:"name"\`
\tEmail     *string   \`json:"email,omitempty"\`
\tIsAdmin   bool      \`json:"isAdmin"\`
\tCreatedAt string    \`json:"createdAt"\`
}`;

const polishedStruct = `package model

import "time"

type User struct {
\tID        int64     \`json:"id" db:"id"\`
\tName      string    \`json:"name" db:"name"\`
\tEmail     *string   \`json:"email,omitempty" db:"email"\`
\tIsAdmin   bool      \`json:"is_admin" db:"is_admin"\`
\tCreatedAt time.Time \`json:"created_at" db:"created_at"\`
}`;

const dbScanExample = `var u model.User
err := db.QueryRow(\`
  SELECT id, name, email, is_admin, created_at
  FROM users WHERE id = $1
\`, id).Scan(&u.ID, &u.Name, &u.Email, &u.IsAdmin, &u.CreatedAt)`;

const sqlxScanExample = `var u model.User
err := db.Get(&u, \`SELECT * FROM users WHERE id = $1\`, id)`;

const sqlcNote = `// If you want type-safe SQL queries with the same struct types,
// consider sqlc — it reads .sql files and generates Go from them.
// This guide covers the lighter case: you just want a struct.`;

export default function GuideSqlToGoStruct() {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "From CREATE TABLE to a Go struct that scans rows",
    description: metadata.description,
    inLanguage: "en",
    totalTime: "PT5M",
    tool: [{ "@type": "HowToTool", name: "Schemato SQL → Go struct converter" }],
    step: [
      { "@type": "HowToStep", position: 1, name: "Have a CREATE TABLE statement", text: "Postgres / MySQL / SQLite all work with the shared subset." },
      { "@type": "HowToStep", position: 2, name: "Generate the Go struct", text: "Paste the DDL into the SQL → Go struct converter and copy the output." },
      { "@type": "HowToStep", position: 3, name: "Polish field types", text: "Switch int to int64 for big integer columns, str to time.Time for timestamps, add db tags." },
      { "@type": "HowToStep", position: 4, name: "Use with database/sql Scan", text: "Pass struct field pointers to row.Scan in column order." },
      { "@type": "HowToStep", position: 5, name: "Or use sqlx for less boilerplate", text: "db.Get / db.Select read column names directly via the db tag." },
    ],
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Does it understand Postgres-specific types like jsonb?", acceptedAnswer: { "@type": "Answer", text: "jsonb / json become interface{}. For typed JSON, define a custom Go type that implements driver.Valuer / sql.Scanner." } },
      { "@type": "Question", name: "What about NULL columns?", acceptedAnswer: { "@type": "Answer", text: "Nullable columns become pointer types (*string, *int) by default. If you prefer sql.NullString / sql.NullInt64, swap them in manually." } },
      { "@type": "Question", name: "Does this work with sqlc?", acceptedAnswer: { "@type": "Answer", text: "Schemato gives you a struct from DDL. sqlc generates structs from queries. They serve different needs — pick whichever matches your workflow." } },
      { "@type": "Question", name: "Does it preserve column comments / constraints?", acceptedAnswer: { "@type": "Answer", text: "Comments and CHECK / FOREIGN KEY constraints are ignored — only column name, type, and NOT NULL are reflected in the struct." } },
    ],
  };

  return (
    <article className="container-x py-16 max-w-3xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <nav className="text-sm text-dim mb-4" aria-label="breadcrumb">
        <a href="/" className="hover:text-text">Home</a>
        <span className="mx-2">/</span>
        <a href="/guides" className="hover:text-text">Guides</a>
        <span className="mx-2">/</span>
        <span>SQL to Go struct</span>
      </nav>

      <header>
        <p className="text-dim text-sm uppercase tracking-widest">Guide</p>
        <h1 className="text-4xl font-bold tracking-tight mt-1">
          From CREATE TABLE to a Go struct that scans rows
        </h1>
        <p className="text-dim mt-3 text-lg leading-relaxed">
          A practical walkthrough: turn a Postgres / MySQL / SQLite DDL into a
          Go struct, then use it with the standard library or sqlx.
        </p>
        <p className="text-mute mt-2 text-sm">
          Need it now?{" "}
          <a className="text-accent hover:underline" href="/sql-to-go-struct">
            SQL → Go struct converter
          </a>
          .
        </p>
      </header>

      <hr className="border-border my-10" />

      <h2 className="text-2xl font-bold">Step 1 — Have a CREATE TABLE statement</h2>
      <p className="text-dim mt-2 leading-relaxed">
        Use whichever flavour of SQL your database speaks. The shared subset
        across Postgres, MySQL, and SQLite is enough for most application tables:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{sampleSql}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 2 — Generate the Go struct</h2>
      <p className="text-dim mt-2 leading-relaxed">
        Paste the DDL into the{" "}
        <a className="text-accent hover:underline" href="/sql-to-go-struct">
          SQL → Go struct converter
        </a>
        . Default output:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{generated}</pre>
      <p className="text-dim mt-3 leading-relaxed">
        Two things to notice: nullable columns become pointer types, and field
        names are PascalCase with the original column name preserved in the json
        tag.
      </p>

      <h2 className="text-2xl font-bold mt-12">Step 3 — Polish field types</h2>
      <p className="text-dim mt-2 leading-relaxed">
        For real services, you usually want to:
      </p>
      <ul className="mt-3 space-y-2 text-dim">
        <li>• Switch <code className="text-accent2">int</code> to <code className="text-accent2">int64</code> for BIGINT / BIGSERIAL columns.</li>
        <li>• Switch timestamp string types to <code className="text-accent2">time.Time</code>.</li>
        <li>• Add <code className="text-accent2">db</code> tags so sqlx / scany can use them.</li>
        <li>• Pick consistent json tag style (camelCase or snake_case).</li>
      </ul>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{polishedStruct}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 4 — Scan with database/sql</h2>
      <p className="text-dim mt-2 leading-relaxed">
        The standard library is verbose but always works:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{dbScanExample}</pre>

      <h2 className="text-2xl font-bold mt-12">Step 5 — Or use sqlx for less boilerplate</h2>
      <p className="text-dim mt-2 leading-relaxed">
        sqlx reads <code className="text-accent2">db</code> tags and matches columns by name, so:
      </p>
      <pre className="mt-4 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{sqlxScanExample}</pre>
      <p className="text-dim mt-3 leading-relaxed">
        For a deeper integration path, look into <code className="text-accent2">sqlc</code>:
      </p>
      <pre className="mt-3 bg-panel2 border border-border rounded-lg p-4 code-pre overflow-x-auto">{sqlcNote}</pre>

      <hr className="border-border my-12" />

      <h2 className="text-2xl font-bold">Common pitfalls</h2>
      <ul className="mt-4 space-y-3 text-dim">
        <li>
          • <strong className="text-text">Big integer overflow.</strong> If your
          columns are BIGINT or BIGSERIAL, switch{" "}
          <code className="text-accent2">int</code> to{" "}
          <code className="text-accent2">int64</code> — Go&apos;s default int is platform-dependent.
        </li>
        <li>
          • <strong className="text-text">Nullable handling.</strong> Pointer types
          are clean for JSON encoding; <code className="text-accent2">sql.NullString</code> is
          more idiomatic for raw <code className="text-accent2">database/sql</code> code. Pick one and stay consistent.
        </li>
        <li>
          • <strong className="text-text">Tag mismatches.</strong> Forgetting a{" "}
          <code className="text-accent2">db</code> tag on a struct used with sqlx
          will cause the field to be skipped silently.
        </li>
        <li>
          • <strong className="text-text">Time zones.</strong>{" "}
          <code className="text-accent2">TIMESTAMPTZ</code> stores UTC; a string field will represent it
          differently from a real <code className="text-accent2">time.Time</code>. Use the right type per column.
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-12">FAQ</h2>
      <div className="mt-4 space-y-4">
        <div className="card p-4">
          <div className="font-semibold">Postgres-specific types like jsonb?</div>
          <p className="text-dim mt-1">jsonb / json become <code className="text-accent2">interface{}</code>. Implement <code className="text-accent2">sql.Scanner</code> on a custom type for typed JSON.</p>
        </div>
        <div className="card p-4">
          <div className="font-semibold">NULL columns?</div>
          <p className="text-dim mt-1">Become pointer types by default. Swap to <code className="text-accent2">sql.NullString</code> / <code className="text-accent2">NullInt64</code> if you prefer.</p>
        </div>
        <div className="card p-4">
          <div className="font-semibold">Does this replace sqlc?</div>
          <p className="text-dim mt-1">No — sqlc generates from queries. This generates from DDL. Different workflows, both valid.</p>
        </div>
        <div className="card p-4">
          <div className="font-semibold">CHECK / FOREIGN KEY constraints?</div>
          <p className="text-dim mt-1">Ignored — only column name, type, and NOT NULL are reflected.</p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Related</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a href="/sql-to-go-struct" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">SQL → Go struct converter</div>
            <div className="text-xs text-mute">The tool used in this guide</div>
          </a>
          <a href="/sql-to-rust-struct" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">SQL → Rust struct (sqlx)</div>
            <div className="text-xs text-mute">For Rust services on Postgres</div>
          </a>
          <a href="/sql-to-typescript" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">SQL → TypeScript</div>
            <div className="text-xs text-mute">For Node services using postgres.js</div>
          </a>
          <a href="/format/sql" className="card px-3 py-3 hover:border-accent">
            <div className="text-sm font-medium">All SQL converters</div>
            <div className="text-xs text-mute">15 target languages</div>
          </a>
        </div>
      </section>
    </article>
  );
}
