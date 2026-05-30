import { useState } from "react";

type LoginProps = {
  onLoginSuccess: (token: string) => void;
  onSwitchRegister: () => void;
};

function Login({ onLoginSuccess, onSwitchRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const response = await fetch("http://127.0.0.1:8000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      alert("ログインに失敗しました。");
      return;
    }

    const json = await response.json();
    onLoginSuccess(json.token);
  };

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
      <section className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">ログイン</h1>

        <div className="space-y-4">
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
            onClick={handleLogin}
            className="w-full rounded bg-slate-900 px-4 py-2 font-semibold text-white"
          >
            ログイン
          </button>

          <button
            type="button"
            onClick={onSwitchRegister}
            className="w-full rounded border px-4 py-2 font-semibold text-slate-700"
          >
            新規登録はこちら
          </button>
        </div>
      </section>
    </main>
  );
}

export default Login;
