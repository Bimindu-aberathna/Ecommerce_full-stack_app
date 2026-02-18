"use client";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  CreditCard,
  Lock,
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/src/hooks/useAuth";
import { metadata } from "@/app/layout";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  throw new Error(
    "Stripe publishable key is not defined in environment variables."
  );
}
const stripePromise = loadStripe(stripePublishableKey);

// using URL params for data transfer

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const searchParams = useSearchParams();

  const cartId = searchParams.get("cartId") || ""; // ✅ For future server validation
  const amount = parseFloat(searchParams.get("amount") || "0");
  const shippingCost = parseFloat(searchParams.get("shippingCost") || "0");
  const address = searchParams.get("address") || "";
  const postalCode = searchParams.get("postalCode") || "";
  const email = searchParams.get("email") || "";
  const telephone = searchParams.get("telephone") || "";

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [showTestCards, setShowTestCards] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    address,
    postalCode,
    email,
    telephone,
  });
  const [deliveryInfoError, setDeliveryInfoError] = useState<{
    address: string | null;
    postalCode: string | null;
    email: string | null;
    telephone: string | null;
  }>({ address: null, postalCode: null, email: null, telephone: null });
  const { token } = useAuth();

  useEffect(() => {
    changeDeliveryInfo("address", address);
    changeDeliveryInfo("postalCode", postalCode);
    changeDeliveryInfo("email", email);
    changeDeliveryInfo("telephone", telephone);
  }, [address, postalCode, email, telephone]);

  const totalAmount = amount + shippingCost;

  useEffect(() => {
    const validate_amount = () => {
      if (
        amount <= 0 ||
        isNaN(amount) ||
        !/^\d+(\.\d{2})?$/.test(amount.toString())
      ) {
        setErrorMessage("Invalid amount. Navigating back to cart.");
        return false;
      }
      return true;
    };

    if (!validate_amount()) {
      setTimeout(() => router.push("/cart"), 2000);
    }
  }, [amount, router]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
    }
  }, [errorMessage]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      deliveryInfoError.address ||
      deliveryInfoError.postalCode ||
      deliveryInfoError.telephone
    ) {
      setErrorMessage(
        "Please fix delivery information errors before proceeding."
      );
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");
    setPaymentStatus("");

    try {
      const intent = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/createPaymentIntent`,
        {
          amount: totalAmount * 100,
          currency: "lkr",
          cartId: cartId,
          deliveryInfo: deliveryInfo, // ✅ Fixed: removed { deliveryInfo }
          metadata: deliveryInfo, // ✅ Fixed: removed nested deliveryInfo
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Payment Intent:", intent);

      if (intent.status !== 200) {
        throw new Error(
          intent.data.message || "Failed to create payment intent"
        );
      }

      const { clientSecret } = await intent.data.data;
      const cardElement = elements.getElement(CardElement);

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement!,
          billing_details: {
            name: "Customer",
            email: deliveryInfo.email || "customer@example.com", // ✅ Fixed: use deliveryInfo.email
            address: {
              line1: deliveryInfo.address, // ✅ Fixed: use deliveryInfo.address
              postal_code: deliveryInfo.postalCode, // ✅ Fixed: use deliveryInfo.postalCode
            },
          },
        },
      });
      if (result.error) {
        setErrorMessage(result.error.message || "Payment failed");
        setPaymentStatus("failed");
      } else if (result.paymentIntent.status === "succeeded") {
        toast.success("Payment succeeded, finalizing order...");
        // 3. Finalize (create order) on server
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/payments/complete`,
          {
            paymentIntentId: result.paymentIntent.id,
            delivery_Info: deliveryInfo, // ✅ Fixed: removed { deliveryInfo }
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.status !== 200) {
          throw new Error(
            response.data.message || "Failed to finalize order"
          );
        }

        setPaymentStatus("success");
        toast.success("Payment successful!");
        setTimeout(() => router.push("/"), 2000);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred");
      }
      setPaymentStatus("failed");
    }

    setIsProcessing(false);
  };

  const changeDeliveryInfo = (field: string, value: string) => {
    switch (field) {
      case "address":
        if (!value || value.trim() === "" || value.length < 5) {
          setDeliveryInfoError((prev) => ({
            ...prev,
            address: "Check address. This address will be used for delivery.",
          }));
        } else {
          setDeliveryInfoError((prev) => ({ ...prev, address: null }));
        }
        break;
      case "postalCode":
        if (!value || value.trim() === "" || !/^\d{5}$/.test(value)) {
          setDeliveryInfoError((prev) => ({
            ...prev,
            postalCode: "Invalid postal code. Must be 5 digits.",
          }));
        } else {
          setDeliveryInfoError((prev) => ({ ...prev, postalCode: null }));
        }
        break;
      case "telephone":
        if (
          !value ||
          value.trim() === "" ||
          !/^(?:0(?:7[0-8]\d|[1-9]\d{2})\d{6})$/.test(value)
        ) {
          setDeliveryInfoError((prev) => ({
            ...prev,
            telephone: "Invalid telephone number.",
          }));
        } else {
          setDeliveryInfoError((prev) => ({ ...prev, telephone: null }));
        }
        break;
      default:
        break;
    }
    setDeliveryInfo((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 sm:py-8 lg:py-10 px-2 sm:px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => router.push("/cart")}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back to Cart
          </button>
          <div className="flex items-center gap-2 text-xl sm:text-2xl font-bold" style={{ color: 'var(--text)' }}>
            <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: 'var(--primary)' }} />
            Secure Checkout
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg sm:rounded-2xl shadow-md lg:shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <ShoppingBag className="w-5 h-5" />
              Order Summary
            </h2>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center py-2 sm:py-3 border-b" style={{ color: 'var(--secondary)' }}>
                <span className="text-xs sm:text-sm">Subtotal</span>
                <span className="font-semibold text-sm sm:text-base">${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 sm:py-3 border-b" style={{ color: 'var(--secondary)' }}>
                <span className="text-xs sm:text-sm">Shipping</span>
                <span className="font-semibold text-sm sm:text-base">
                  {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 sm:py-4 text-base sm:text-lg font-bold" style={{ color: 'var(--text)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <span className="block mt-4 sm:mt-6 font-bold text-orange-600 text-sm sm:text-base">
              Please ensure your delivery details are correct:
            </span>
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg space-y-4">
              <div>
                <label className="text-gray-600 text-xs sm:text-sm block mb-1" htmlFor="address">
                  Delivery Address
                </label>
                <input
                  type="text"
                  id="address"
                  value={deliveryInfo.address}
                  onChange={(e) => changeDeliveryInfo("address", e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {deliveryInfoError.address && (
                  <p className="text-xs text-red-600 mt-1">{deliveryInfoError.address}</p>
                )}
              </div>
              <div>
                <label className="text-gray-600 text-xs sm:text-sm block mb-1" htmlFor="postalCode">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  value={deliveryInfo.postalCode}
                  onChange={(e) => changeDeliveryInfo("postalCode", e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {deliveryInfoError.postalCode && (
                  <p className="text-xs text-red-600 mt-1">{deliveryInfoError.postalCode}</p>
                )}
              </div>
              <div>
                <label className="text-gray-600 text-xs sm:text-sm block mb-1" htmlFor="telephone">
                  Telephone
                </label>
                <input
                  type="text"
                  id="telephone"
                  value={deliveryInfo.telephone}
                  onChange={(e) => changeDeliveryInfo("telephone", e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {deliveryInfoError.telephone && (
                  <p className="text-xs text-red-600 mt-1">{deliveryInfoError.telephone}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-lg sm:rounded-2xl shadow-md lg:shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <CreditCard className="w-5 h-5" />
              Payment Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Card Element */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Information
                </label>
                <div className="relative">
                  <div className="border border-gray-300 rounded-lg p-4 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: "16px",
                            color: "#374151",
                            fontFamily: '"Inter", sans-serif',
                            "::placeholder": {
                              color: "#9CA3AF",
                            },
                          },
                          invalid: {
                            color: "#EF4444",
                          },
                        },
                      }}
                    />
                  </div>
                  <div className="absolute top-4 right-4">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{errorMessage}</span>
                </div>
              )}

              {/* Success Message */}
              {paymentStatus === "success" && (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">
                    Payment successful! Redirecting to orders...
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!stripe || isProcessing}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                  !stripe || isProcessing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] shadow-lg"
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Pay Rs. {totalAmount.toFixed(2)}
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Lock className="w-4 h-4" />
                <span>Your payment information is secure and encrypted</span>
              </div>
            </form>

            {/* Test Cards Toggle */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowTestCards(!showTestCards)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {showTestCards ? "Hide" : "Show"} Test Cards
              </button>

              {showTestCards && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Test Card Numbers:
                  </h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p>
                      <strong>Success:</strong> 4242 4242 4242 4242
                    </p>
                    <p>
                      <strong>Decline:</strong> 4000 0000 0000 0002
                    </p>
                    <p>
                      <strong>Require 3DS:</strong> 4000 0025 0000 3155
                    </p>
                    <p className="text-blue-600 mt-2">
                      Use any future date for expiry and any 3 digits for CVC
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            SSL Encrypted
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            PCI Compliant
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Stripe Secured
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

const page = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
};

export default page;
