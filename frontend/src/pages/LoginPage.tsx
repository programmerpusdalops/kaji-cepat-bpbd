/**
 * LoginPage — Premium glassmorphism login
 *
 * Features: animated gradient background, glass card,
 * animated field focus, dark-mode compatible, branded
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { AlertTriangle, Loader2, Eye, EyeOff, Moon, Sun, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@bpbd.go.id");
  const [password, setPassword] = useState("admin123");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* ── Animated gradient background ── */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: theme === "dark"
            ? "linear-gradient(135deg, #0f1219 0%, #1a1f2e 30%, #0f1219 50%, #1e1a14 70%, #0f1219 100%)"
            : "linear-gradient(135deg, #1e3a5f 0%, #1a2744 30%, #2a1f3d 50%, #3d2a1a 70%, #1e3a5f 100%)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 15s ease infinite",
        }}
      />

      {/* Decorative blurred orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl animate-float"
        style={{ background: "hsl(24 95% 53% / 0.4)" }}
      />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full opacity-15 blur-3xl animate-float"
        style={{ background: "hsl(222 60% 40% / 0.5)", animationDelay: "2s" }}
      />

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="absolute top-4 right-4 z-10 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      {/* ── Login Card ── */}
      <div className="w-full max-w-[420px] animate-fade-in-up">
        <div className="glass-card p-8 rounded-2xl shadow-2xl">
          {/* Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg animate-pulse-glow"
                style={{ background: "var(--gradient-primary)" }}
              >
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              PUSDALOPS BPBD
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sistem Kaji Cepat Bencana
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-muted-foreground font-medium">
                Sistem Aktif
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="login-email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@bpbd.go.id"
                className="h-11 bg-muted/50 border-border/50 focus:bg-card transition-colors"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="login-password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 bg-muted/50 border-border/50 focus:bg-card transition-colors pr-10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 animate-fade-in">
                <Shield className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
              style={{ background: "var(--gradient-primary)" }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                "Masuk ke Sistem"
              )}
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 pt-4 border-t border-border/30">
            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              Demo: <span className="font-medium text-foreground/70">admin@bpbd.go.id</span> / <span className="font-medium text-foreground/70">admin123</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-white/40 mt-6">
          © {new Date().getFullYear()} BPBD Provinsi Sulawesi Tengah
        </p>
      </div>

      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
