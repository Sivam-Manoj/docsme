"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await axios.get(`/api/auth/verify?token=${token}`);
        setStatus("success");
        setMessage(response.data.message);
      } catch (error: any) {
        setStatus("error");
        setMessage(error.response?.data?.error || "Verification failed");
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <div className="bg-gray-100 p-3 rounded-full">
                <Loader2 className="w-12 h-12 text-gray-600 animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            )}
            {status === "error" && (
              <div className="bg-red-100 p-3 rounded-full">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-3xl font-bold">
            {status === "loading" && "Verifying..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription className="text-base">{message}</CardDescription>
        </CardHeader>
        {status !== "loading" && (
          <CardFooter className="flex flex-col space-y-2">
            {status === "success" && (
              <Link href="/auth/login" className="w-full">
                <Button className="w-full">Sign In to Continue</Button>
              </Link>
            )}
            {status === "error" && (
              <>
                <Link href="/auth/register" className="w-full">
                  <Button className="w-full">Try Again</Button>
                </Link>
                <Link href="/auth/login" className="w-full">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </>
            )}
            <Link href="/" className="text-sm text-center text-gray-500 hover:text-gray-700">
              Back to home
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-100 p-3 rounded-full">
                <Loader2 className="w-12 h-12 text-gray-600 animate-spin" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
