import { useEffect, useState } from "react";
import type { Company } from "../../types/company";

const API_BASE_URL = "http://127.0.0.1:8000/api";

function App() {
  const [companies, setCompanies] = useState<Company[]>([]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies`);

      if (!response.ok) {
        throw new Error("企業取得失敗");
      }

      const data = await response.json();
      setCompanies(data);
    } catch (erroe) {
      console.error(erroe);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
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
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
