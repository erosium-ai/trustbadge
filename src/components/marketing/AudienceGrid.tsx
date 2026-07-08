import { Section } from "./Section";

const audiences = ["Plumbers", "Electricians", "Roofers", "Cleaners", "Mechanics", "Cafes", "Bookkeepers", "Builders", "Landscapers", "Local services"];

export function AudienceGrid() {
  return (
    <Section className="border-y border-slate-200">
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Who it's for</p>
        <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-tight text-[#0F1B2D] sm:text-4xl">
          Built for the businesses that keep Australia running.
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-[#5B6472]">
          Plumbers, sparkies, roofers, cafes, bookkeepers, cleaners, mechanics — if you're licensed, insured, or just good at what you do, make it easier to prove.
        </p>
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {audiences.map((audience) => (
          <span key={audience} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0F1B2D] shadow-sm">
            {audience}
          </span>
        ))}
      </div>
    </Section>
  );
}
