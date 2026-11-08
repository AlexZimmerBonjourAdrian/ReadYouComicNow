import type { ReactNode } from "react";

export default function SeoLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#0f0f0f] px-6 py-16 text-[#e5e5e5]">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-white">{title}</h1>
        {description ? (
          <p className="mt-4 text-lg leading-8 text-[#9CA3AF]">{description}</p>
        ) : null}
        <div className="mt-8 space-y-6 leading-8 text-[#d1d5db]">{children}</div>
      </div>
    </main>
  );
}
