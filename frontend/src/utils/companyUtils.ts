// Company をそのまま Laravel API に送れる形へ変換する関数です。
// フロント側の appliedDate / jobUrl みたいな camelCase を、Laravel側の applied_date / job_url みたいな snake_case に直しています。
// さらに overrides を使うことで、元の会社データをベースにしつつ、priority や status など変更したい項目だけ上書きできます。
//
import type { Company } from "../types/company";

// Company をそのまま Laravel API に送れる形へ変換する関数です。

// フロント側の appliedDate / jobUrl みたいな camelCase を、Laravel側の applied_date / job_url みたいな snake_case に直しています。

// さらに overrides を使うことで、元の会社データをベースにしつつ、priority や status など変更したい項目だけ上書きできます。

// 概要説明
// ここでは、Company型のデータをLaravel APIへ送れる形に変換する関数を作ります。
// React側では、CompanyResourceから返ってきたデータを appliedDate や jobUrl のような camelCase で扱っています。
// 一方で、Laravel側のRequestやDBカラムは applied_date や job_url のような snake_case です。
// そのため、更新APIへ送る時には、React側のCompanyをそのままJSON.stringifyするのではなく、Laravelが受け取れる形に変換する必要があります。
// 最初は各更新処理の中にrequestBodyを直接書いても動きます。
// ただ、志望度変更、状況変更、詳細更新などで毎回同じ変換を書くと、コードが長くなり、修正漏れも起きやすくなります。
// そこで、buildCompanyRequestBodyという関数にまとめます。

// overrides の意味
// overrides は「一部だけ上書きするための追加データ」です。

// 元のcompanyデータをベースにしつつ、
// priorityだけ変えたい、
// statusだけ変えたい、
// という場面で使います。
// buildCompanyRequestBody(company, {
//   priority: "4.0",
// });

//最後に書く理由
//...overrides を最後に置くことで、元データよりも変更したい値を優先できます。
// もし先に書いてしまうと、後から company.priority などで上書きされてしまい、変更が反映されません。

//Partialの意味
//志望度だけ変えたい時に毎回全部渡すのは面倒です。
// こう書ける
// buildCompanyRequestBody(company, {
//   priority: "4.0",
// });

// = {} は、第2引数が省略された時の初期値です。

// overridesを渡さない場合でも、空のオブジェクトとして扱えるようにしています。

// これにより、
// buildCompanyRequestBody(company)
// のように呼んでもエラーにならず、
// buildCompanyRequestBody(company, { priority: "4.0" })
// のように一部だけ上書きすることもできます。

export function buildCompanyRequestBody(
  company: Company,
  overrides: Partial<{
    name: string | null;
    media: string | null;
    priority: string | null;
    status: string;
    applied_date: string | null;
    interview_date: string | null;
    job_url: string | null;
    interview_url: string | null;
    memo: string | null;
    next_action: string | null;
    document_result: string | null;
    first_interview_result: string | null;
    second_interview_result: string | null;
    final_result: string | null;
    rejection_stage: string | null;
  }> = {},
) {
  return {
    name: company.name,
    media: company.media,
    priority: company.priority,
    status: company.status,
    applied_date: company.appliedDate,
    interview_date: company.interviewDate,
    job_url: company.jobUrl,
    interview_url: company.interviewUrl,
    memo: company.memo,
    next_action: company.nextAction,
    document_result: company.documentResult,
    first_interview_result: company.firstInterviewResult,
    second_interview_result: company.secondInterviewResult,
    final_result: company.finalResult,
    rejection_stage: company.rejectionStage,
    ...overrides,
  };
}
