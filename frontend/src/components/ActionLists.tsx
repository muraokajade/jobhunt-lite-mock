import type {
  ActionListsProps,
  Company,
  DashboardActionLists,
} from "../types/company";

type ActionCompanyItemProps = {
  company: Company;
  onOpenDetail: (company: Company) => void;
};

function ActionCompanyItem({ company, onOpenDetail }: ActionCompanyItemProps) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{company.name}</p>
          <p className="mt-1 text-sm text-slate-500">状況：{company.status}</p>
          <p className="text-sm text-slate-500">
            志望度：{company.priority ?? "未設定"}
          </p>
          <p className="text-sm text-slate-500">
            次アクション：{company.nextAction ?? "未設定"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenDetail(company)}
          className="shrink-0 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
        >
          詳細
        </button>
      </div>
    </li>
  );
}

// Dashboardの「次に確認する企業」を表示するコンポーネント。
// 面談予定・確認待ち・高優先度の3分類を表示する。
function ActionLists({ dashboardActionLists, onOpenDetail }: ActionListsProps) {
  // APIからactionListsが来ていればそれを使う。
  // まだ取得前なら空配列にして画面を壊さない。
  const interviewCompanies = dashboardActionLists?.interview ?? [];
  const waitingCompanies = dashboardActionLists?.waiting ?? [];
  const highPriorityCompanies = dashboardActionLists?.highPriority ?? [];

  console.log(highPriorityCompanies);

  return (
    <section className="mt-6 rounded-lg border bg-slate-50 p-4">
      <h2 className="mb-4 text-xl font-bold">次に確認する企業</h2>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-blue-900">面談予定</h2>

          {interviewCompanies.length === 0 ? (
            <p className="text-sm text-blue-700">面談予定はありません。</p>
          ) : (
            <ul className="space-y-2">
              {interviewCompanies.map((company) => (
                <ActionCompanyItem
                  key={company.id}
                  company={company}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-amber-900">確認待ち</h2>

          {waitingCompanies.length === 0 ? (
            <p className="text-sm text-amber-700">確認待ちはありません。</p>
          ) : (
            <ul className="space-y-2">
              {waitingCompanies.map((company) => (
                <ActionCompanyItem
                  key={company.id}
                  company={company}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-rose-900">高優先度</h2>

          {highPriorityCompanies.length === 0 ? (
            <p className="text-sm text-rose-700">
              高優先度の企業はありません。
            </p>
          ) : (
            <ul className="space-y-2">
              {highPriorityCompanies.map((company) => (
                <ActionCompanyItem
                  key={company.id}
                  company={company}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default ActionLists;
