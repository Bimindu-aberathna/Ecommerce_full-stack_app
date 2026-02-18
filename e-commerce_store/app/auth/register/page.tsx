"use client";
import { useAuth } from "@/src/hooks/useAuth";
import { validateUser } from "@/src/services/validation/validation.services";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";

export default function RegisterPage() {
  const { register, loading, isAuthenticated, user } = useAuth();
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    address: "",
    postalCode: "",
    password: "",
    confirmPassword: "",
  });

  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const router = useRouter();

  const getDefaultRoute = (role?: string | null) => {
    if (role === "seller") return "/seller/dashboard";
    return "/";
  };

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    router.replace(getDefaultRoute(user.role));
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate input
    const errors = validateUser(userData);
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }
    if (userData.password !== userData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Call registration service through useAuth hook
    const response = await register(userData);
    if (response && response.success) {
      toast.success(response.message);
      // Redirect to login page after successful registration
      router.push('/auth/login');
    } else {
      toast.error(response?.message || "Registration failed");
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
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-text-primary">
            Sign up for your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form
            action=""
            method="POST"
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-2 gap-4">
              {/* First Name and Last Name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm/6 font-medium text-text-primary"
                >
                  First Name
                </label>
                <div className="mt-2">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    autoComplete="given-name"
                    className="block w-full rounded-md bg-input-bg px-3 py-1.5 text-base text-text-primary outline-1 -outline-offset-1 outline-border placeholder:text-input-placeholder focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                    onChange={(e) =>
                      setUserData({ ...userData, firstName: e.target.value })
                    }
                    value={userData.firstName}
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm/6 font-medium text-text-primary"
                >
                  Last Name
                </label>
                <div className="mt-2">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    autoComplete="family-name"
                    className="block w-full rounded-md bg-input-bg px-3 py-1.5 text-base text-text-primary outline-1 -outline-offset-1 outline-border placeholder:text-input-placeholder focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                    onChange={(e) =>
                      setUserData({ ...userData, lastName: e.target.value })
                    }
                    value={userData.lastName}
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-text-primary"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-input-bg px-3 py-1.5 text-base text-text-primary outline-1 -outline-offset-1 outline-border placeholder:text-input-placeholder focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                  onChange={(e) =>
                    setUserData({ ...userData, email: e.target.value })
                  }
                  value={userData.email}
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label
                htmlFor="mobile"
                className="block text-sm/6 font-medium text-text-primary"
              >
                Mobile Number
              </label>
              <div className="mt-2">
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  autoComplete="tel"
                  className="block w-full rounded-md bg-input-bg px-3 py-1.5 text-base text-text-primary outline-1 -outline-offset-1 outline-border placeholder:text-input-placeholder focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                  onChange={(e) =>
                    setUserData({ ...userData, mobile: e.target.value })
                  }
                  value={userData.mobile}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm/6 font-medium text-text-primary"
              >
                Address
              </label>
              <div className="mt-2">
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  autoComplete="address"
                  className="block w-full rounded-md bg-input-bg px-3 py-1.5 text-base text-text-primary outline-1 -outline-offset-1 outline-border placeholder:text-input-placeholder focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                  onChange={(e) =>
                    setUserData({ ...userData, address: e.target.value })
                  }
                  value={userData.address}
                />
              </div>
            </div>

            {/* postal code */}
            <div>
              <label
                htmlFor="postalCode"
                className="block text-sm/6 font-medium text-text-primary"
              >
                Postal Code
              </label>
              <div className="mt-2">
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  required
                  autoComplete="postal-code"
                  className="block w-full rounded-md bg-input-bg px-3 py-1.5 text-base text-text-primary outline-1 -outline-offset-1 outline-border placeholder:text-input-placeholder focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                  onChange={(e) =>
                    setUserData({ ...userData, postalCode: e.target.value })
                  }
                  value={userData.postalCode}
                />
              </div>
            </div>
            {/* Password */}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-text-primary"
                >
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    className="block w-full rounded-md bg-input-bg px-3 py-1.5 text-base text-text-primary outline-1 -outline-offset-1 outline-border placeholder:text-input-placeholder focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                    onChange={(e) =>
                      setUserData({ ...userData, password: e.target.value })
                    }
                    value={userData.password}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm/6 font-medium text-text-primary"
                >
                  Confirm Password
                </label>
                <div className="mt-2">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    autoComplete="new-password"
                    className="block w-full rounded-md bg-input-bg px-3 py-1.5 text-base text-text-primary outline-1 -outline-offset-1 outline-border placeholder:text-input-placeholder focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        confirmPassword: e.target.value,
                      })
                    }
                    value={userData.confirmPassword}
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm/6 text-text-secondary"
              >
                I agree to the{" "}
                <a
                  href="/terms"
                  className="font-semibold text-primary hover:text-primary-hover"
                >
                  Terms and Conditions
                </a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-button-primary-bg px-3 py-1.5 text-sm/6 font-semibold text-button-primary-text shadow-xs hover:bg-button-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
                disabled={!agreeToTerms || loading}
              >
                {loading ? "Creating Account..." : "Sign up"}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-text-secondary">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="font-semibold text-primary hover:text-primary-hover"
            >
              Sign in here
            </a>
          </p>
        </div>
        <ToastContainer />
      </div>
    </>
  );
}
