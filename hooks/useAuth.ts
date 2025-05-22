"use client"
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Ivalid email or password");
        return false;
      }
      router.push("/dashboard");
    } catch (error) {
      setError("An unexpected error occurred");
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    isLoading: status === "loading" || isLoading,
    error,
    login,
    logout,
  };
};
