import type { CompanyTableProps } from "../types/company";

function CompanyTable({
  companies,
  priorityOptions,
  statusOptions,
  onDelete,
  onOpenModal,
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
              <tr className="border-b bg-slate-900 text-white">
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
              {companies.map((company) => (
                <tr key={company.id} className="border-b">
                  <td className="px-3 py-2 font-semibold">{company.name}</td>
                  <td className="px-3 py-2">{company.media ?? "-"}</td>
                  <td className="px-3 py-2">{company.priority ?? "-"}</td>
                  <td className="px-3 py-2">{company.status}</td>
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default CompanyTable;
