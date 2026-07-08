import { Section } from "./Section";
import { CtaButton } from "./CtaButton";

const problems = [
  {
    marker: "01",
    title: "Hard to find",
    body: "Most local business websites aren't written in a format AI tools can reliably read.",
  },
  {
    marker: "02",
    title: "Hard to trust",
    body: "Anyone can claim they're licensed and insured. Almost nobody proves it before the customer calls.",
  },
  {
    marker: "03",
    title: "Hard to compare",
    body: "When a customer weighs you against a competitor, the one with visible proof usually wins the call.",
  },
];

export function ProblemCards({ freeProfileUrl }: { freeProfileUrl: string }) {
  return (
    <Section>
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wide text-blue-700">The problem</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0F1B2D] sm:text-4xl">
          Your next customer might never see your website.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-[#5B6472]">
          More people are asking ChatGPT, Google's AI, and voice assistants to find local businesses. If your details aren't structured in a way these tools can read, you're harder to find — and harder to trust.
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
          label="Fix all three free"
          dataCta="problem-primary"
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
        >
          Fix all three — free →
        </CtaButton>
      </div>
    </Section>
  );
}
