import type { CompanyTableProps } from "../types/company";

function CompanyTable({
  companies,
  priorityOptions,
  statusOptions,
  onDelete,
  onOpenModal,
  onPriorityChange,
  onStatusChange,
  onToggleFavorite,
}: CompanyTableProps) {
  return (
    <section className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">JobHunt Lite</h1>
      <p className="mt-2 text-sm text-slate-600">
        Laravel API から取得した企業一覧を表示します。
      </p>

      <div className="mt-6">
        <h2 className="mb-4 text-xl font-bold">企業一覧</h2>

        {companies.length === 0 ? (
          <p className="text-slate-500">企業データがありません。</p>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-900 text-white text-center">
                <th className="px-3 py-2">注目</th>
                <th className="px-3 py-2">企業名</th>
                <th className="px-3 py-2">媒体</th>
                <th className="px-3 py-2">志望度</th>
                <th className="px-3 py-2">状況</th>
                <th className="px-3 py-2">応募日</th>
                <th className="px-3 py-2">メモ</th>
                <th className="px-3 py-2">操作</th>
              </tr>
            </thead>

            <tbody>
              {companies.map((company) => {
                const isRejected = company.status === "落選";
                const rowClassName = isRejected
                  ? "border-b bg-slate-200 text-slate-500"
                  : "border-b bg-white";
                const favoriteButtonClassName = company.isFavorite
                  ? "flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-500"
                  : "flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-400";
                return (
                  <tr key={company.id} className={rowClassName}>
                    <td className="px-3 py-2">
                      <button
                        className={favoriteButtonClassName}
                        type="button"
                        onClick={() => onToggleFavorite(company)}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill={company.isFavorite ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
                          />
                        </svg>
                      </button>
                    </td>
                    <td className="px-3 py-2 font-semibold">{company.name}</td>
                    <td className="px-3 py-2">{company.media ?? "-"}</td>

                    <td className="px-3 py-2">
                      <select
                        value={company.priority ?? "3.0"}
                        onChange={(event) =>
                          onPriorityChange(company, event.target.value)
                        }
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                      >
                        {priorityOptions.map((priority) => (
                          <option value={priority.value} key={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-3 py-2">
                      <select
                        value={company.status ?? "応募済み"}
                        onChange={(event) =>
                          onStatusChange(company, event.target.value)
                        }
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">{company.appliedDate ?? "-"}</td>
                    <td className="px-3 py-2">{company.memo ?? "-"}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => onOpenModal(company)}
                        className="rounded bg-slate-700 px-3 py-1 text-white"
                      >
                        詳細
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(company)}
                        className="mt-2 rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default CompanyTable;
