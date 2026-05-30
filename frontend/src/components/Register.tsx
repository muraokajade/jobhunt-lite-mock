import { useState } from "react";

type RegisterProps = {
  onRegisterSuccess: (token: string) => void;
  onSwitchLogin: () => void;
};

function Register({ onRegisterSuccess, onSwitchLogin }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    const response = await fetch("http://127.0.0.1:8000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    if (!response.ok) {
      alert("登録に失敗しました。");
      return;
    }

    const json = await response.json();

    onRegisterSuccess(json.token);
  };

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
      <section className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">新規登録</h1>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold">名前</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <button
            type="button"
            onClick={handleRegister}
            className="w-full rounded bg-slate-900 px-4 py-2 font-semibold text-white"
          >
            登録する
          </button>

          <button
            type="button"
            onClick={onSwitchLogin}
            className="w-full rounded border px-4 py-2 font-semibold text-slate-700"
          >
            ログインはこちら
          </button>
        </div>
      </section>
    </main>
  );
}

export default Register;
