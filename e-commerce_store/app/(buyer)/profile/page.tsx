"use client";
import { useAuth } from "@/src/hooks/useAuth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import profileService from "@/src/services/profile.service";
import Image from "next/image";
import { pacifico } from "@/src/lib/fonts";
import { useLoading } from "@/src/hooks/useLoading";
import { validateProfileUpdate } from "@/src/services/validation/validation.services";
import { toast, ToastContainer } from "react-toastify";
import ImageUploader from "@/src/components/common/ImageUploader/ImageUploader";
import { UploadFile } from "@/src/hooks/useImageUpload";
import { updateUserProfileObj } from "@/src/types";
import DeleteAccountModal from "@/src/components/buyer/profile/DeleteAccountModal";

interface userProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  address: string | null;
  postalCode: string | null;
}

function Page() {
  const { isAuthenticated, logout, token } = useAuth();
  const [user, setUser] = useState<userProfile | null>(null);
  const [formData, setFormData] = useState<Partial<userProfile>>({});
  const [updateMode, setUpdateMode] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);

  const router = useRouter();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      logout();
      router.push("/auth/login");
    } else if (token && !hasFetched.current) {
      fetchUserProfile();
    }
  }, [isAuthenticated, token]);

  const fetchUserProfile = async () => {
    if (!token || hasFetched.current) return;

    hasFetched.current = true;
    try {
      const res = await profileService.fetchUserProfile(token);
      setUser(res.data);
      setFormData(res.data);
      console.log("Profile data:", res.data);
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      hasFetched.current = false;
      if (
        err.message === "Authentication failed. Please login again." ||
        err.message === "Access denied. Insufficient permissions."
      ) {
        logout();
        router.push("/auth/login");
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log("Submitting form data:", formData, uploadedFiles);
    const errors = await validateProfileUpdate(formData);
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }
    //showLoading("Updating profile...", "profile");

    try {
      setUpdateMode(false);
      const updatedDataObj: updateUserProfileObj = {
        firstName: formData.firstName ?? "",
        lastName: formData.lastName ?? "",
        email: formData.email ?? "",
        phone: formData.phone ?? null,
        avatar: formData.avatar ?? null,
        address: formData.address ?? null,
        postalCode: formData.postalCode ?? null,
        file: uploadedFiles[0]?.file || null,
      };
      if(!token){
        toast.error("User not authenticated");
        return;
      }
      const response = await profileService.updateUserProfile(token, updatedDataObj);
      if (response.success) {
        toast.success("Profile updated successfully!");
        setUser(response.data);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
    //   hideLoading();
    }
  };

  // Handle file changes from ImageUploader
  const handleFilesChange = (files: UploadFile[]) => {
    setUploadedFiles(files);
    console.log("Files changed:", files);
  };

  return (
    <div>
      <style jsx>{`
        .typewriter-text {
          position: relative;
          color: transparent;
        }

        .typewriter-text::after {
          content: "";
          position: absolute;
          left: -3rem;
          color: #374151;
          animation: typewriter 10s infinite;
          font-size: 3rem;
        }

        @keyframes typewriter {
          /* First word: Hello! */
          0% {
            content: "";
          }
          4% {
            content: "H";
          }
          8% {
            content: "He";
          }
          12% {
            content: "Hel";
          }
          16% {
            content: "Hell";
          }
          20% {
            content: "Hello";
          }
          24% {
            content: "Hello!";
          }
          28% {
            content: "Hello!";
          }

          /* Erase Hello! */
          30% {
            content: "Hello";
          }
          31% {
            content: "Hell";
          }
          32% {
            content: "Hel";
          }
          33% {
            content: "He";
          }
          34% {
            content: "H";
          }
          35% {
            content: "";
          }

          /* Second word: Hola! */
          40% {
            content: "H";
          }
          44% {
            content: "Ho";
          }
          48% {
            content: "Hol";
          }
          52% {
            content: "Hola";
          }
          56% {
            content: "Hola!";
          }
          60% {
            content: "Hola!";
          }

          /* Erase Hola! */
          62% {
            content: "Hola";
          }
          63% {
            content: "Hol";
          }
          64% {
            content: "Ho";
          }
          65% {
            content: "H";
          }
          66% {
            content: "";
          }

          /* Third word: Ayubowan! */
          70% {
            content: "A";
          }
          72% {
            content: "Ay";
          }
          74% {
            content: "Ayu";
          }
          76% {
            content: "Ayub";
          }
          78% {
            content: "Ayubo";
          }
          80% {
            content: "Ayubow";
          }
          82% {
            content: "Ayubowa";
          }
          84% {
            content: "Ayubowan";
          }
          86% {
            content: "Ayubowan!";
          }
          90% {
            content: "Ayubowan!";
          }

          /* Erase Ayubowan! */
          91% {
            content: "Ayubowan";
          }
          92% {
            content: "Ayubowa";
          }
          93% {
            content: "Ayubow";
          }
          94% {
            content: "Ayubo";
          }
          95% {
            content: "Ayub";
          }
          96% {
            content: "Ayu";
          }
          97% {
            content: "Ay";
          }
          98% {
            content: "A";
          }
          99% {
            content: "";
          }
          100% {
            content: "";
          }
        }
      `}</style>

      <div className="h-screen flex flex-col">
        {/* Main content area */}
        <div className="flex-1 m-2 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 gap-2">
          {/* Profile Picture and Info Section */}
          <div className="bg-gray-200 flex justify-center items-center text-center flex-col p-4 lg:row-span-2">
            <div className="flex justify-center items-center">
              <Image
                src={
                  user?.avatar ||
                  "https://firebasestorage.googleapis.com/v0/b/champions-stores.appspot.com/o/images%2Fcute-avatar-profile-picture-23yuqpb8wz1dqqqv.jpg?alt=media&token=c9664939-af3c-4641-9d62-5cf83fa41aa5"
                }
                alt="Profile Picture"
                width={150}
                height={150}
                className="rounded-full m-4"
              />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">
                {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
              </h2>
              <div className="h-6">
                <span
                  className={`${pacifico} text-xl text-gray-700 typewriter-text`}
                >
                  Hello!
                </span>
              </div>
            </div>
            <section className="p-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">
                Delivery Information
              </h3>
              <p className="text-gray-700">
                <span className="font-semibold">Email: </span>
                {user ? user.email : "Loading..."}
              </p>
              {user?.phone ? (
                <p className="text-gray-700">
                  <span className="font-semibold">Phone: </span>
                  {user ? user.phone : "Loading..."}
                </p>
              ) : null}
              {user?.address ? (
                <p className="text-gray-700">
                  <span className="font-semibold">Address: </span>
                  {user ? user.address : "Loading..."}
                </p>
              ) : null}
              {user?.postalCode ? (
                <p className="text-gray-700">
                  <span className="font-semibold">Postal Code: </span>
                  {user ? user.postalCode : "Loading..."}
                </p>
              ) : null}
            </section>
          </div>

          {/* Purchase History Section */}
          <div className="bg-green-200 p-4">
            <h3 className="text-lg font-semibold mb-4">Purchase History</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">12</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">$2,459</p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">Nov 15</p>
                <p className="text-sm text-gray-600">Last Order</p>
              </div>
            </div>
          </div>

          {/* Update Profile Section */}
          <div className="bg-blue-200 p-4">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Update Profile</h3>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="switch-2"
                  className="relative inline-flex cursor-pointer items-center"
                >
                  <input
                    id="switch-2"
                    type="checkbox"
                    className="peer sr-only"
                    checked={updateMode}
                    onChange={() => setUpdateMode((prev) => !prev)}
                  />
                  <div className="peer h-6 w-11 rounded-full border bg-slate-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#0060d1] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-green-300"></div>
                </label>
                <span className="text-sm text-gray-700">
                  {updateMode ? "Edit Mode" : "View Mode"}
                </span>
              </div>
            </div>
            <div className="overflow-y-auto">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="lg:flex lg:gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      defaultValue={formData.firstName}
                      disabled={!updateMode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      defaultValue={formData.lastName}
                      disabled={!updateMode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded-md"
                    defaultValue={formData.email}
                    disabled={!updateMode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="lg:flex lg:gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      placeholder="No Phone Number Provided"
                      defaultValue={formData.phone ?? ""}
                      disabled={!updateMode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      defaultValue={formData?.postalCode || ""}
                      disabled={!updateMode}
                      placeholder="No Postal Code Provided"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          postalCode: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    defaultValue={formData?.address || ""}
                    disabled={!updateMode}
                    placeholder="No Address Provided"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className={`p-2 bg-gray-100 w-full ${updateMode ? 'block' : 'hidden'}`}>
                  <ImageUploader
                    maxFiles={1}
                    maxSizeInMB={2}
                    onFilesChange={handleFilesChange}
                    title="Profile Picture"
                    className="max-w-full"
                  />
                </div>

                {updateMode ? (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : null}

                
              </form>
              {!updateMode ? (
                  <DeleteAccountModal token={token ?? ""} />
                ) : null}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Page;
