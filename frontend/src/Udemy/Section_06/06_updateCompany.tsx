import { useEffect, useState } from "react";
import type { CompanyForm, Company, CompanyEditForm } from "./types/company";
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
  //詳細モーダル用state作成
  const [isModalOpen, setIsModalOpen] = useState(false);
  //詳細ボタンクリックしたその会社情報
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  //ベタガキする
  const [editForm, setEditForm] = useState<CompanyEditForm>({
    name: "",
    media: "",
    priority: "3.0",
    status: "応募済み",
    applied_date: "",
    interview_date: "",
    job_url: "",
    interview_url: "",
    next_action: "",
    document_result: "未対応",
    first_interview_result: "未対応",
    second_interview_result: "未対応",
    final_result: "未対応",
    rejection_stage: "未設定",
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

  // 詳細ボタンを押した企業を選択状態にし、
  // その企業の現在データを詳細モーダル用フォームに詰めてからモーダルを開く。
  function handleOpenModal(company: Company) {
    //保存してから
    setSelectedCompany(company);

    //editFormに既存値セット
    setEditForm({
      name: company.name,
      media: company.media ?? "",
      priority: company.priority ?? "3.0",
      status: company.status,
      applied_date: company.appliedDate ?? "",
      interview_date: company.interviewDate ?? "",
      job_url: company.jobUrl ?? "",
      interview_url: company.interviewUrl ?? "",
      next_action: company.nextAction ?? "",
      document_result: company.documentResult ?? "未対応",
      first_interview_result: company.firstInterviewResult ?? "未対応",
      second_interview_result: company.secondInterviewResult ?? "未対応",
      final_result: company.finalResult ?? "未対応",
      rejection_stage: company.rejectionStage ?? "未設定",
      memo: company.memo ?? "",
    });

    setIsModalOpen(true);
  }

  const handleUpdateCompany = async () => {
    //nullガード
    if (!selectedCompany) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/companies/${selectedCompany.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        },
      );

      if (!response.ok) {
        throw new Error("データ更新に失敗しました。");
      }

      await fetchCompanies();
      // setIsModalOpen(false);
      handleCloseModal();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseModal = () => {
    setSelectedCompany(null);
    setIsModalOpen(false);
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
                        onClick={() => handleOpenModal(company)}
                        className="rounded bg-slate-700 px-3 py-1 text-white"
                      >
                        詳細
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
      {isModalOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">会社詳細</p>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedCompany.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-xl border px-4 py-2 text-sm font-semibold"
              >
                閉じる
              </button>
            </div>

            <div className="space-y-6 p-6 text-sm">
              <section className="rounded-2xl border bg-slate-50 p-5">
                <h3 className="mb-4 text-base font-bold">基本情報</h3>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      企業名
                    </label>
                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="h-11 w-full rounded-xl border px-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      媒体
                    </label>
                    <input
                      value={editForm.media}
                      onChange={(e) =>
                        setEditForm({ ...editForm, media: e.target.value })
                      }
                      className="h-11 w-full rounded-xl border px-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      応募日
                    </label>
                    <input
                      type="date"
                      value={editForm.applied_date}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          applied_date: e.target.value,
                        })
                      }
                      className="h-11 w-full rounded-xl border px-3"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border bg-white p-5">
                <h3 className="mb-4 text-base font-bold">選考情報</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      志望度
                    </label>
                    <select
                      value={editForm.priority}
                      onChange={(e) =>
                        setEditForm({ ...editForm, priority: e.target.value })
                      }
                      className="h-11 w-full rounded-xl border bg-white px-3"
                    >
                      {/* mapにする */}
                      <option value="1.0">1.0 なんとなく（練習用）</option>
                      <option value="1.5">1.5 低め</option>
                      <option value="2.0">2.0 少し気になる</option>
                      <option value="2.5">2.5 検討中</option>
                      <option value="3.0">3.0 普通</option>
                      <option value="3.5">3.5 やや高め</option>
                      <option value="4.0">4.0 かなり興味あり</option>
                      <option value="4.5">4.5 本命</option>
                      <option value="5.0">5.0 大本命</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      状況
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm({ ...editForm, status: e.target.value })
                      }
                      className="h-11 w-full rounded-xl border bg-white px-3"
                    >
                      {/* mapにする */}
                      <option value="応募済み">応募済み</option>
                      <option value="選考中">選考中</option>
                      <option value="内定">内定</option>
                      <option value="落選">落選</option>
                      <option value="辞退">辞退</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      面談日
                    </label>
                    <input
                      type="datetime-local"
                      value={editForm.interview_date}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          interview_date: e.target.value,
                        })
                      }
                      className="h-11 w-full rounded-xl border px-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      次アクション
                    </label>
                    <input
                      value={editForm.next_action}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          next_action: e.target.value,
                        })
                      }
                      className="h-11 w-full rounded-xl border px-3"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border bg-slate-50 p-5">
                <h3 className="mb-4 text-base font-bold">URL情報</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      求人URL
                    </label>
                    <input
                      value={editForm.job_url}
                      onChange={(e) =>
                        setEditForm({ ...editForm, job_url: e.target.value })
                      }
                      className="h-11 w-full rounded-xl border px-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      面談URL
                    </label>
                    <input
                      value={editForm.interview_url}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          interview_url: e.target.value,
                        })
                      }
                      className="h-11 w-full rounded-xl border px-3"
                    />
                  </div>
                </div>
              </section>
              <section className="rounded-2xl border bg-white p-5">
                <h3 className="mb-4 text-base font-bold">選考結果</h3>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      書類選考
                    </label>
                    <select
                      value={editForm.document_result}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          document_result: e.target.value,
                        })
                      }
                      className="h-11 w-full rounded-xl border bg-white px-3"
                    >
                      {/* マップ */}
                      <option value="未対応">未対応</option>
                      <option value="通過">通過</option>
                      <option value="不通過">不通過</option>
                      <option value="保留">保留</option>
                      <option value="辞退">辞退</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      1次面接
                    </label>
                    <select
                      value={editForm.first_interview_result}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          first_interview_result: e.target.value,
                        })
                      }
                      className="h-11 w-full rounded-xl border bg-white px-3"
                    >
                      <option value="未対応">未対応</option>
                      <option value="通過">通過</option>
                      <option value="不通過">不通過</option>
                      <option value="保留">保留</option>
                      <option value="辞退">辞退</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      2次面接
                    </label>
                    <select
                      value={editForm.second_interview_result}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          second_interview_result: e.target.value,
                        })
                      }
                      className="h-11 w-full rounded-xl border bg-white px-3"
                    >
                      <option value="未対応">未対応</option>
                      <option value="通過">通過</option>
                      <option value="不通過">不通過</option>
                      <option value="保留">保留</option>
                      <option value="辞退">辞退</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      最終結果
                    </label>
                    <select
                      value={editForm.final_result}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          final_result: e.target.value,
                        })
                      }
                      className="h-11 w-full rounded-xl border bg-white px-3"
                    >
                      <option value="未対応">未対応</option>
                      <option value="通過">通過</option>
                      <option value="不通過">不通過</option>
                      <option value="保留">保留</option>
                      <option value="辞退">辞退</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      落選段階
                    </label>
                    <select
                      value={editForm.rejection_stage}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          rejection_stage: e.target.value,
                        })
                      }
                      className="h-11 w-full rounded-xl border bg-white px-3"
                    >
                      <option value="未設定">未設定</option>
                      <option value="書類選考">書類選考</option>
                      <option value="1次面接">1次面接</option>
                      <option value="2次面接">2次面接</option>
                      <option value="最終面接">最終面接</option>
                      <option value="辞退">辞退</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border bg-slate-50 p-5">
                <h3 className="mb-4 text-base font-bold">メモ</h3>

                <textarea
                  value={editForm.memo}
                  onChange={(e) =>
                    setEditForm({ ...editForm, memo: e.target.value })
                  }
                  className="min-h-28 w-full rounded-xl border px-3 py-2"
                />
              </section>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl border px-5 py-2 text-sm font-semibold"
                >
                  キャンセル
                </button>

                <button
                  type="button"
                  onClick={handleUpdateCompany}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
                >
                  更新
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
