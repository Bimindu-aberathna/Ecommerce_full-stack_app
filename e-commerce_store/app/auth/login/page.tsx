"use client";
import { useAuth } from "@/src/hooks/useAuth";
import { useCart } from "@/src/hooks/useCart";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

export default function LoginPage() {
  const { login, loading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { getCartCount } = useCart();

  const nextUrl = useMemo(() => searchParams.get("next"), [searchParams]);

  const getDefaultRoute = (role?: string | null) => {
    if (role === "seller") return "/seller/dashboard";
    return "/";
  };

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const redirectTo = nextUrl || getDefaultRoute(user.role);
    router.replace(redirectTo);
  }, [isAuthenticated, user, nextUrl, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    const loginData = { email, password };

    try {
      const response = await login(loginData);

      if (response.success) {
        const token = response.data?.data?.token;

        if (token) {
          try {
            const cartResponse = await getCartCount(token);
            if (cartResponse.success) {
              console.log("Cart count:", cartResponse.itemCount);
            }
          } catch (cartError) {
            console.warn("Failed to fetch cart count:", cartError);
          }
        }

        const userRole = response.data?.data?.user?.role === "admin"
          ? "seller"
          : response.data?.data?.user?.role;
        const redirectTo = nextUrl || getDefaultRoute(userRole);
        router.replace(redirectTo);
      } else {
        toast.error(response?.message || "Login failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <div
        className="flex min-h-full flex-1 flex-col justify-center items-center px-6 py-12 lg:px-8"
        style={{ height: "100vh" }}
      >
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <Image
            alt="E-Store"
            src="/images/logos/7941375.jpg"
            style={{ objectFit: "cover", borderRadius: "12px" }}
            className="mx-auto"
            width={100}
            height={100}
          />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleLogin} method="POST" className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Password
                </label>
                <div className="text-sm">
                  <a
                    href="/auth/forgot-password"
                    className="font-semibold text-blue-600 hover:text-blue-500"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6 pr-10"
                />
                <div
                  className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Not a member?{" "}
            <a
              href="/auth/register"
              className="font-semibold text-blue-600 hover:text-blue-500"
            >
              Sign up now
            </a>
          </p>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
