// 🔑 Keywords: Credentials AI QR code section, offline marketing, fridge magnets, flyers, vehicle stickers, AI-Ready Business Page QR code

const QR_USES = ["Fridge magnets", "Flyers", "Invoices", "Business cards", "Vehicle stickers", "Jobsite signs"];
const QR_BENEFITS = [
  "Downloadable QR code included",
  "Put it on magnets, flyers, vehicles, invoices and cards",
  "Sends customers to your profile with checked business details",
  "Track quote requests, calls and email clicks from the page",
  "Makes offline marketing measurable",
];

function QrMockup() {
  return (
    <div className="relative mx-auto max-w-sm">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-emerald-300/10 blur-3xl" aria-hidden />
      <div className="relative rounded-[2rem] border border-emerald-300/25 bg-slate-950/88 p-5 shadow-[0_0_55px_rgb(16_185_129/0.16)]">
        <div className="rounded-[1.4rem] border border-white/10 bg-white p-4">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 49 }).map((_, index) => {
              const finder =
                (index < 14 && index % 7 < 2) ||
                (index < 14 && index % 7 > 4) ||
                (index > 34 && index % 7 < 2);
              const filled = finder || [10, 17, 19, 23, 25, 30, 32, 37, 39, 41, 45].includes(index);
              return (
                <span
                  key={index}
                  className={`aspect-square rounded-[3px] ${filled ? "bg-slate-950" : "bg-slate-200"}`}
                />
              );
            })}
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-200">Scan to open</p>
          <p className="mt-1 text-lg font-black text-white">AI-Ready Business Page</p>
          <p className="mt-1 text-xs font-semibold text-slate-400">Services · Checked details · Quote form</p>
        </div>
      </div>
    </div>
  );
}

export function QrCodeSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid items-center gap-10 rounded-[2rem] border border-emerald-300/18 bg-gradient-to-br from-slate-950/88 via-slate-900/80 to-emerald-950/35 p-6 shadow-[0_0_70px_rgb(16_185_129/0.12)] sm:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:p-10">
        <QrMockup />
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-emerald-200">
            QR code included
          </span>
          <h2 className="mt-5 text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
            QR code included with every AI-Ready Business Page
          </h2>
          <p className="mt-3 text-xl font-black text-emerald-200">Take your profile into the real world.</p>
          <p className="mt-4 text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
            Every AI-Ready Business Page comes with a QR code you can download and use anywhere — on fridge magnets,
            flyers, invoices, quote forms, business cards, jobsite signs, counter displays, or even your work vehicle.
          </p>
          <p className="mt-4 text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
            Someone sees your business in the real world, scans the code, and lands on a proper profile page with your
            services, contact details, ABN/business-registration trust wording, and enquiry form.
          </p>
          <p className="mt-5 text-lg font-black text-white">
            That means your offline marketing finally connects back to something measurable.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {QR_USES.map((use) => (
              <span key={use} className="rounded-full border border-white/10 bg-white/7 px-3 py-1.5 text-xs font-bold text-slate-200">
                {use}
              </span>
            ))}
          </div>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {QR_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex gap-2.5 text-sm font-semibold leading-relaxed text-slate-200">
                <span className="mt-0.5 font-black text-emerald-300">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
