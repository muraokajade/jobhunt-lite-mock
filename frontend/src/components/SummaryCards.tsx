import type { Company, DashboardSummary } from "../types/company";

type SummaryCardsProps = {
  companies: Company[];
  dashboardSummary?: DashboardSummary;
};

// 応募企業の集計カードを表示するコンポーネント。
// このコンポーネント内ではAPI通信を行わない。
// 親コンポーネントから受け取ったdashboardSummaryを表示するだけにする。
function SummaryCards({ companies, dashboardSummary }: SummaryCardsProps) {
  // Dashboard APIから取得した応募総数。
  // dashboardSummaryがまだ取得できていない場合は、0を表示する。
  const total = dashboardSummary?.total ?? 0;

  // Dashboard APIから取得した面談予定数。
  // Lite版では、React側で仮集計するfallbackは入れず、APIの値をそのまま使う。
  const interview = dashboardSummary?.interview ?? 0;

  // Dashboard APIから取得した返答待ち件数。
  const waiting = dashboardSummary?.waiting ?? 0;

  // Dashboard APIから取得した内定数。
  const offer = dashboardSummary?.offer ?? 0;

  // Dashboard APIから取得した落選数。
  const rejected = dashboardSummary?.rejected ?? 0;

  // 同じ形のカードを5回ベタ書きすると長くなるため、
  // 表示に必要な情報を配列にまとめる。
  const summaryCards = [
    {
      label: "応募総数",
      value: total,
      cardClassName: "border-slate-200 bg-white",
      labelClassName: "text-slate-500",
      valueClassName: "text-slate-900",
    },
    {
      label: "面談予定",
      value: interview,
      cardClassName: "border-blue-100 bg-blue-50",
      labelClassName: "text-blue-700",
      valueClassName: "text-blue-900",
    },
    {
      label: "返答待ち",
      value: waiting,
      cardClassName: "border-amber-100 bg-amber-50",
      labelClassName: "text-amber-700",
      valueClassName: "text-amber-900",
    },
    {
      label: "内定",
      value: offer,
      cardClassName: "border-emerald-100 bg-emerald-50",
      labelClassName: "text-emerald-700",
      valueClassName: "text-emerald-900",
    },
    {
      label: "落選",
      value: rejected,
      cardClassName: "border-slate-200 bg-slate-100",
      labelClassName: "text-slate-600",
      valueClassName: "text-slate-800",
    },
  ];

  return (
    <section className="mt-6 rounded-lg bg-slate-50 p-4">
      <h2 className="mb-4 text-xl font-bold">応募状況サマリー</h2>

      <div className="grid gap-3 md:grid-cols-5">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border p-4 shadow-sm ${card.cardClassName}`}
          >
            <p className={`text-sm ${card.labelClassName}`}>{card.label}</p>
            <p className={`text-2xl font-bold ${card.valueClassName}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SummaryCards;
