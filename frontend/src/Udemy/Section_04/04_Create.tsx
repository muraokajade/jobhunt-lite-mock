import { useEffect, useState } from "react";
import type { CompanyForm, Company } from "./types/company";
import { priorityOptions, statusOptions } from "./constants/companyOptions";

const API_BASE_URL = "http://127.0.0.1:8000/api";

// 今日の日付を yyyy-MM-dd 形式で取得する関数。
// input type="date" の初期値に使う。
//
function getToday() {
  return new Date().toISOString().slice(0, 10);
}
function App() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState<CompanyForm>({
    name: "",
    media: "",
    priority: "3.0",
    status: "応募済み",
    job_url: "",
    applied_date: getToday(),
    memo: "",
  });

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies`);

      if (!response.ok) {
        throw new Error("企業取得失敗");
      }

      const json = await response.json();
      setCompanies(json.data);
    } catch (erroe) {
      console.error(erroe);
    }
  };

  const createCompany = async () => {
    try {
      const requestBody = {
        ...form,
        name: form.name,
        media: form.media,
        priority: form.priority,
        job_url: form.job_url,
        applied_ddate: getToday(),
        memo: form.memo,
      };
      const response = await fetch(`${API_BASE_URL}/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("企業登録に失敗しました。");
      }

      const json = await response.json();

      const createdCompany = json.data;

      // 登録成功後、一覧に追加する
      setCompanies((prevCompanies) => [...prevCompanies, createdCompany]);

      // 登録成功後、フォームを初期化する
      setForm({
        name: "",
        media: "",
        priority: "3.0",
        status: "応募済み",
        job_url: "",
        applied_date: getToday(),
        memo: "",
      });

      // //LaravelからResourceで来るので。
      // setForm(json);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
      <section className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-sm">
        <form id="register" className="mt-6 rounded-lg border bg-slate-50 p-4">
          <h2 className="mb-4 text-xl font-bold">企業登録</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">企業名</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded border px-3 py-2"
                placeholder="例：株式会社サンプル"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">媒体</label>
              <input
                type="text"
                value={form.media}
                onChange={(e) => setForm({ ...form, media: e.target.value })}
                className="w-full rounded border px-3 py-2"
                placeholder="例：Green"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">志望度</label>

              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full rounded border bg-white px-3 py-2"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
                {/* <option value="1.0">1.0 なんとなく（練習用）</option>
                <option value="1.5">1.5 低め</option>
                <option value="2.0">2.0 少し気になる</option>
                <option value="2.5">2.5 検討中</option>
                <option value="3.0">3.0 普通</option>
                <option value="3.5">3.5 やや高め</option>
                <option value="4.0">4.0 かなり興味あり</option>
                <option value="4.5">4.5 本命</option>
                <option value="5.0">5.0 大本命</option> */}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">状況</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded border bg-white px-3 py-2"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">
                求人URL
              </label>
              <input
                type="url"
                value={form.job_url}
                onChange={(e) => setForm({ ...form, job_url: e.target.value })}
                className="w-full rounded border px-3 py-2"
                placeholder="例：https://example.com/jobs/123"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">応募日</label>
              <input
                type="date"
                value={form.applied_date}
                onChange={(e) =>
                  setForm({ ...form, applied_date: e.target.value })
                }
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">メモ</label>
              <input
                type="text"
                value={form.memo}
                onChange={(e) => setForm({ ...form, memo: e.target.value })}
                className="w-full rounded border px-3 py-2"
                placeholder="例：React経験が活かせそう"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={createCompany}
            className="mt-4 rounded bg-slate-900 px-4 py-2 font-semibold text-white"
          >
            保存
          </button>
        </form>
      </section>
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
