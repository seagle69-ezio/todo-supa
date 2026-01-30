"use client";
export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // 🔑 Şifre alanı
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/");
      }
    });
  }, [router]);

  
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    setLoading(false);

    if (error) {
      alert("Giriş başarısız: " + error.message);
      return;
    }

    
    router.replace("/");
  };

  
  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
    });

    setLoading(false);

    if (error) {
      alert("Kayıt başarısız: " + error.message);
      return;
    }

    
    alert("Kayıt başarılı! Şimdi giriş yapabilirsin.");
  };

  
  const signInWithGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #0f172a 0, #020617 45%, #000 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        color: "#e5e7eb",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(0,0,0,0.95))",
          borderRadius: 18,
          padding: 28,
          width: 360,
          border: "1px solid rgba(59,130,246,0.45)",
          boxShadow:
            "0 0 25px rgba(0,0,0,0.9), 0 0 50px rgba(59,130,246,0.08)",
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#3b82f6",
              opacity: 0.9,
            }}
          >
            LUX TODO
          </div>
  
          <h2
            style={{
              marginTop: 8,
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            Giriş / Kayıt
          </h2>
  
          <p style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>
            E-posta ve şifre ile anında todo listene gir.
          </p>
        </div>
  
        <label
          style={{
            fontSize: 13,
            marginBottom: 4,
            display: "block",
            opacity: 0.8,
          }}
        >
          E-posta adresi
        </label>
  
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@mail.com"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(148,163,184,0.6)",
            background: "rgba(15,23,42,0.85)",
            color: "#e5e7eb",
            fontSize: 14,
            outline: "none",
            marginBottom: 10,
          }}
        />
  
        <label
          style={{
            fontSize: 13,
            marginBottom: 4,
            display: "block",
            opacity: 0.8,
          }}
        >
          Şifre
        </label>
  
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="En az 6 karakter"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(148,163,184,0.6)",
            background: "rgba(15,23,42,0.85)",
            color: "#e5e7eb",
            fontSize: 14,
            outline: "none",
            marginBottom: 14,
          }}
        />
  
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 999,
            border: "none",
            marginBottom: 8,
            background:
              "linear-gradient(135deg, #3b82f6, #2563eb, #1e40af)",
            color: "#020617",
            fontWeight: 600,
            fontSize: 14,
            cursor: loading ? "wait" : "pointer",
            boxShadow: "0 12px 30px rgba(59,130,246,0.45)",
          }}
        >
          {loading ? "İşleniyor..." : "Giriş Yap"}
        </button>
  
        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: "100%",
            padding: "9px 12px",
            borderRadius: 999,
            border: "1px solid rgba(148,163,184,0.6)",
            marginBottom: 10,
            background: "rgba(15,23,42,0.9)",
            color: "#e5e7eb",
            fontWeight: 500,
            fontSize: 13,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          Kayıt Ol
        </button>
  
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          style={{
            width: "100%",
            padding: "9px 12px",
            borderRadius: 999,
            border: "1px solid rgba(148,163,184,0.6)",
            background: "rgba(15,23,42,0.9)",
            color: "#e5e7eb",
            fontWeight: 500,
            fontSize: 13,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          Google ile giriş yap
        </button>
  
        <p
          style={{
            marginTop: 12,
            fontSize: 11,
            opacity: 0.7,
            textAlign: "center",
          }}
        >
          Giriş başarılı olduğunda otomatik olarak todo sayfasına
          yönlendirileceksin.
        </p>
      </div>
    </div>
  );
}  
