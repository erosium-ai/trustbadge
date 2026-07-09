import { Section } from "./Section";
import { CtaButton } from "./CtaButton";

const problems = [
  {
    marker: "01",
    title: "Unreadable",
    body: "Search engines and AI assistants are answering 'who should I call?' Most local business sites aren't structured in a way these tools can reliably understand.",
  },
  {
    marker: "02",
    title: "Unproven",
    body: "Anyone can write 'licensed and insured'. Almost nobody proves it. When customers compare two quotes, visible proof wins.",
  },
  {
    marker: "03",
    title: "Unmeasured",
    body: "Calls come in, quotes go out, and you still don't know what's actually working. 'Phone felt quiet' is not reporting.",
  },
];

export function ProblemCards({ freeProfileUrl }: { freeProfileUrl: string }) {
  return (
    <Section>
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wide text-blue-700">The three gaps</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0F1B2D] sm:text-4xl">
          People already check you out online. You just can&apos;t see it — or prove you&apos;re legit.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-[#5B6472]">
          This is where most local businesses lose ground: unreadable details, unproven credentials, and zero proof on
          what enquiries actually came through.
        </p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {problems.map((problem) => (
          <div key={problem.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-700">
              {problem.marker}
            </div>
            <h3 className="text-xl font-black text-[#0F1B2D]">{problem.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#5B6472]">{problem.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <CtaButton
          href={freeProfileUrl}
          eventName="credentials_ai_click_problem_section"
          label="Close all three gaps"
          dataCta="problem-primary"
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
        >
          Close all three gaps — start free →
        </CtaButton>
      </div>
    </Section>
  );
}
