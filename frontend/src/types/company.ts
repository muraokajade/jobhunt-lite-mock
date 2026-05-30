// 応募企業情報をReact側で扱うための型。
// Laravel側のCompanyResourceで snake_case から camelCase に変換されたレスポンスを受け取る。
// ここでは、Laravel APIから返ってくる企業データをReact側で扱うために、Company型を作ります。

// ポイントは2つです。

// 1つ目は、React側では camelCase で扱うことです。
// LaravelやDBでは applied_date のような名前ですが、CompanyResourceで appliedDate に変換して返す想定です。

// 2つ目は、null を許可している項目です。
// 応募日、メモ、URLなどは未入力の可能性があるので、string | null にしています。

// この型を作っておくことで、companies.map の中で company.name や company.status を安全に扱えるようになります。

export type Company = {
  id: number; // 企業ID
  name: string; // 企業名
  media: string | null; // 応募媒体
  priority: string | null; // 志望度
  status: string; // 選考状況
  appliedDate: string | null; // 応募日
  interviewDate: string | null; // 面談・面接予定日
  jobUrl: string | null; // 求人URL
  interviewUrl: string | null; // 面談・面接URL
  memo: string | null; // メモ
  nextAction: string | null; // 次にやること
  documentResult: string | null; // 書類選考結果
  firstInterviewResult: string | null; // 一次面接結果
  secondInterviewResult: string | null; // 二次面接結果
  finalResult: string | null; // 最終結果
  rejectionStage: string | null; // 落選ステージ
  isFavorite: boolean; // お気に入り状態
  createdAt?: string | null; // 作成日時
  updatedAt?: string | null; // 更新日時
};

// 企業登録フォームの入力値を表す型。
// Laravel APIへ送る値なので、DBカラムに合わせてsnake_caseで管理する。

export type CompanyForm = {
  name: string;
  media: string;
  priority: string;
  status: string;
  job_url: string;
  applied_date: string;
  memo: string;
};
// value / label形式のselect選択肢で使う共通型。
// priorityOptionsやrejectionStageOptionsなどで利用する。
export type Option = {
  value: string;
  label: string;
};

// 詳細モーダル用フォームの入力値を表す型。
// 既存企業の現在データをinput / select / textareaに入れて表示するために使う。
// この時点ではPUT更新はまだ行わない。
export type CompanyEditForm = {
  name: string;
  media: string;
  priority: string;
  status: string;
  applied_date: string;
  interview_date: string;
  job_url: string;
  interview_url: string;
  next_action: string;
  document_result: string;
  first_interview_result: string;
  second_interview_result: string;
  final_result: string;
  rejection_stage: string;
  memo: string;
};

export type CompanyTableProps = {
  companies: Company[];
  priorityOptions: Option[];
  statusOptions: string[];
  onOpenModal: (company: Company) => void;
  onDelete: (company: Company) => void;
  onPriorityChange: (company: Company, priority: string) => void;
  onStatusChange: (company: Company, status: string) => void;
  onToggleFavorite: (company: Company) => void;
};

export type DashboardSummary = {
  total: number;
  interview: number;
  waiting: number;
  offer: number;
  rejected: number;
  highPriority: number;
};

//これどこだ？
export type DashboardActionLists = {
  interview: Company[];
  waiting: Company[];
  highPriority: Company[];
};

export type ActionListsProps = {
  dashboardActionLists?: DashboardActionLists;
  onOpenDetail: (company: Company) => void;
};
export type AuthUser = {
  id: number;
  name: string;
  email: string;
};
