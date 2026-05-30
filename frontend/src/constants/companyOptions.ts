import type { Option } from "../types/company";

// 志望度selectで表示する選択肢。
// valueはAPI・stateで扱う値、labelは画面に表示する文字列。
export const priorityOptions: Option[] = [
  { value: "5.0", label: "5.0 大本命" },
  { value: "4.5", label: "4.5 本命" },
  { value: "4.0", label: "4.0 かなり興味ある" },
  { value: "3.5", label: "3.5 検討" },
  { value: "3.0", label: "3.0 普通" },
  { value: "2.5", label: "2.5 補欠" },
  { value: "2.0", label: "2.0 低め" },
  { value: "1.5", label: "1.5 低" },
  { value: "1.0", label: "1.0 とりあえず(練習)" },
];

// 選考状況selectで表示する選択肢。
// 企業の現在ステータスや検索条件として利用する。
export const statusOptions: string[] = [
  "応募済み",
  "書類選考待ち",
  "書類通過",
  "面談日程調整中",
  "面談予定",
  "面談後返答待ち",
  "内定",
  "辞退",
  "落選",
];

// 選考結果selectで表示する選択肢。
// 書類選考・1次面接・2次面接・最終結果で共通利用する。
export const resultOptions: string[] = [
  "未対応",
  "通過",
  "不通過",
  "保留",
  "辞退",
];

// 落選段階selectで表示する選択肢。
// 落選理由や辞退など、選考終了時の段階を管理する。
export const rejectionStageOptions: Option[] = [
  { value: "", label: "未設定" },
  { value: "書類落ち", label: "書類落ち" },
  { value: "1次面接落ち", label: "1次面接落ち" },
  { value: "2次面接落ち", label: "2次面接落ち" },
  { value: "最終落ち", label: "最終落ち" },
  { value: "条件不一致", label: "条件不一致" },
  { value: "辞退", label: "辞退" },
];
