import { useEffect, useState } from "react";
import type {
  CompanyForm,
  Company,
  CompanyEditForm,
  DashboardSummary,
} from "./types/company";
import { priorityOptions, statusOptions } from "./constants/companyOptions";
import CompanyTable from "./components/CompanyTable";
import { buildCompanyRequestBody } from "./utils/companyUtils";
import SummaryCards from "./components/SummaryCards";

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

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [media, setMedia] = useState("");

  //ダッシュ
  const [dashboardSummary, setDashboardSummary] = useState<
    DashboardSummary | undefined
  >(undefined);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/dashboard`, {
        headers: {
          Accept: "application/json",
          // Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("データ取得失敗。");
      }
      //　型をsummaryで解しているからjson.summary
      const json = await response.json();
      setDashboardSummary(json.summary);
    } catch (error) {
      console.error(error);
    }
  };

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

  const handleDelete = async (company: Company) => {
    const isConfirmed = window.confirm("この企業を削除しますか？");

    if (!isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/companies/${company.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("企業削除に失敗しました。");
      }

      alert("企業を先除しました。");
      await fetchCompanies();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePriorityChange = async (company: Company, priority: string) => {
    try {
      // const requestBody = {
      //   name: company.name,
      //   media: company.media,
      //   priority: priority,
      //   status: company.status,
      //   applied_date: company.appliedDate,
      //   interview_date: company.interviewDate,
      //   job_url: company.jobUrl,
      //   interview_url: company.interviewUrl,
      //   memo: company.memo,
      //   next_action: company.nextAction,
      //   document_result: company.documentResult,
      //   first_interview_result: company.firstInterviewResult,
      //   second_interview_result: company.secondInterviewResult,
      //   final_result: company.finalResult,
      //   rejection_stage: company.rejectionStage,
      // };
      const requestBody = buildCompanyRequestBody(company, { priority });

      const response = await fetch(`${API_BASE_URL}/companies/${company.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        throw new Error("志望度変更に失敗しました。");
      }
      await fetchCompanies();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (company: Company, status: string) => {
    try {
      const requestBody = buildCompanyRequestBody(company, { status });

      const response = await fetch(`${API_BASE_URL}/companies/${company.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        throw new Error("志望度変更に失敗しました。");
      }
      await fetchCompanies();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleFavorite = async (company: Company) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/companies/${company.id}/favorite`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );
      if (!response.ok) {
        throw new Error("お気に入りの切り替えに失敗しました");
      }

      await fetchCompanies();
    } catch (error) {
      console.error(error);
    }
  };

  //入力された検索条件をURLのクエリ文字列に変換して、Laravel APIに検索リクエストを送り、
  // 返ってきた企業一覧で画面を更新している処理
  const searchCompanies = async () => {
    console.log("検索ボタン押された");

    const params = new URLSearchParams();

    if (keyword) {
      params.append("keyword", keyword);
    }

    if (status) {
      params.append("status", status);
    }

    if (media) {
      params.append("media", media);
    }

    const queryString = params.toString();

    const url = queryString
      ? `${API_BASE_URL}/companies?${queryString}`
      : `${API_BASE_URL}/companies`;

    console.log("検索URL:", url);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        // Authorization: `Bearer ${authToken}`,
      },
    });

    console.log("検索response:", response.status);

    if (!response.ok) {
      throw new Error("検索に失敗しました。");
    }

    const json = await response.json();

    console.log("検索結果:", json.data);

    setCompanies(json.data);

    // まず検索の動作確認中は一旦コメントアウト
    // await fetchDashboard();
  };

  //こうなる　http://127.0.0.1:8000/api/companies?keyword=React&status=選考中&media=Green

  useEffect(() => {
    fetchCompanies();
    fetchDashboard();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
      <section className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-sm">
        <div className="rounded-lg border bg-slate-50 p-4">
          <h2 className="mb-4 text-xl font-bold">検索・絞り込み</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold">
                キーワード
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full rounded border px-3 py-2"
                placeholder="企業名・メモで検索"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">状況</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded border bg-white px-3 py-2"
              >
                {" "}
                <option value="">すべて</option>
                <option value="応募済み">応募済み</option>
                <option value="選考中">選考中</option>
                <option value="内定">内定</option>
                <option value="落選">落選</option>
                <option value="辞退">辞退</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">媒体</label>
              <input
                type="text"
                value={media}
                onChange={(e) => setMedia(e.target.value)}
                className="w-full rounded border px-3 py-2"
                placeholder="Green / type / レバテック"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={searchCompanies}
              className="rounded bg-slate-900 px-4 py-2 font-semibold text-white transition active:scale-95 active:bg-slate-700"
            >
              検索する
            </button>

            <button
              type="button"
              onClick={() => {
                setKeyword("");
                setStatus("");
                setMedia("");
                fetchCompanies();
              }}
              className="rounded border border-slate-300 px-4 py-2 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 active:translate-y-0.5 active:scale-95 active:shadow-none"
            >
              条件クリア
            </button>
          </div>
        </div>
      </section>
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

      <div
        id="dashboard"
        className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-sm"
      >
        <SummaryCards
          companies={companies}
          dashboardSummary={dashboardSummary}
        />
      </div>
      {/* <div id="action-lists" className="scroll-mt-24">
        <ActionLists
          companies={companies}
          dashboardActionLists={dashboardActionList}
          onOpenDetail={handleOpenModal}
        />
      </div> */}

      <CompanyTable
        companies={companies}
        priorityOptions={priorityOptions}
        statusOptions={statusOptions}
        onDelete={handleDelete}
        onOpenModal={handleOpenModal}
        onPriorityChange={handlePriorityChange}
        onStatusChange={handleStatusChange}
        onToggleFavorite={toggleFavorite}
      />

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
