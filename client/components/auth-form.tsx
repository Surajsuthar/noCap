"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  useLoginMutation,
  useRegisterMutation,
  useResendMagicLinkMutation,
  useVerifyOtpMutation,
} from "@/hooks/use-auth";
import { authApi } from "@/lib/auth-api";
import { loginSchema, registerSchema } from "@/lib/types";
import { cn } from "@/lib/utils";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";

type LoginValues = z.input<typeof loginSchema>;
type RegisterValues = z.input<typeof registerSchema>;
type LoginChallenge = {
  email: string;
  requestId: string;
};

/* ─── shared "magic link sent" confirmation ─── */
function MagicLinkSent({
  email,
  onResend,
  isResending,
}: {
  email: string;
  onResend: () => void | Promise<void>;
  isResending?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MailCheck className="h-7 w-7" aria-hidden="true" />
      </span>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold tracking-tight">
          Check your inbox
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
          We sent a verification link to {email}. Click it to verify and get
          started.
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full pt-1">
        <p className="text-xs text-muted-foreground">
          Didn't receive it?{" "}
          <button
            type="button"
            onClick={onResend}
            disabled={isResending}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {isResending ? "Resending..." : "Resend link"}
          </button>{" "}
          or check your spam folder.
        </p>
      </div>
    </div>
  );
}

function OtpChallenge({
  challenge,
  error,
  isVerifying,
  isResending,
  onSubmit,
  onResend,
  onChangeEmail,
}: {
  challenge: LoginChallenge;
  error: string | null;
  isVerifying: boolean;
  isResending: boolean;
  onSubmit: (otp: string) => void;
  onResend: () => void;
  onChangeEmail: () => void;
}) {
  const [otp, setOtp] = useState("");

  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold tracking-tight">
          Enter your login code
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
          We sent a 6-digit OTP to {challenge.email}. It expires in 5 minutes.
        </p>
      </div>

      <form
        className="flex w-full flex-col items-center gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (otp.length === 6) {
            onSubmit(otp);
          }
        }}
      >
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <Button
          type="submit"
          className="w-full"
          disabled={isVerifying || otp.length !== 6}
        >
          {isVerifying ? "Verifying..." : "Verify and enter"}
        </Button>
      </form>

      <AuthError message={error} />

      <div className="flex flex-col gap-2 w-full pt-1">
        <p className="text-xs text-muted-foreground">
          Didn't receive it?{" "}
          <button
            type="button"
            onClick={onResend}
            disabled={isResending}
            className="font-medium text-primary underline-offset-4 hover:underline disabled:opacity-60"
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        </p>
        <button
          type="button"
          onClick={onChangeEmail}
          className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Use a different email
        </button>
      </div>
    </div>
  );
}

function AuthError({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
    >
      {message}
    </p>
  );
}

/* ─── Login ─── */
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [challenge, setChallenge] = useState<LoginChallenge | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "" },
  });

  const loginMutation = useLoginMutation((response, variables) => {
    if (!response.data?.request_id) {
      setError("The server did not return a login request id.");
      return;
    }

    setChallenge({
      email: variables.email,
      requestId: String(response.data.request_id),
    });
  });

  const verifyOtpMutation = useVerifyOtpMutation(() => {
    router.replace("/chat");
  });

  async function onSubmit(values: LoginValues) {
    setError(null);

    try {
      await loginMutation.mutateAsync(values);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "We could not send the OTP. Try again.",
      );
    }
  }

  async function verifyOtp(otp: string) {
    if (!challenge) {
      return;
    }

    setError(null);

    try {
      await verifyOtpMutation.mutateAsync({
        identifier: challenge.requestId,
        otp,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "We could not verify that OTP. Try again.",
      );
    }
  }

  async function resendOtp() {
    if (!challenge) {
      return;
    }

    setError(null);

    try {
      await loginMutation.mutateAsync({ email: challenge.email });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "We could not resend the OTP.",
      );
    }
  }

  function continueWithGoogle() {
    window.location.href = authApi.googleOAuthUrl();
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <Card className="w-full">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Sign in to jump into a random video call
          </CardDescription>
        </CardHeader>

        <CardContent>
          {challenge ? (
            <OtpChallenge
              challenge={challenge}
              error={error}
              isResending={loginMutation.isPending}
              isVerifying={verifyOtpMutation.isPending}
              onChangeEmail={() => {
                setChallenge(null);
                setError(null);
              }}
              onResend={resendOtp}
              onSubmit={verifyOtp}
            />
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-4"
              >
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-1">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Sending..." : "Login"}
                  </Button>
                  <div className="relative flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full"
                    onClick={continueWithGoogle}
                  >
                    Continue with Google
                  </Button>
                </div>
                <AuthError message={error} />
              </form>
            </Form>
          )}

          {!challenge && (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              No account?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Create one free
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground px-4">
        By signing in you agree to our{" "}
        <a
          href="/terms"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="/privacy-policy"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}

/* ─── Register ─── */
export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      dob: "",
    },
  });

  const registerMutation = useRegisterMutation((_response, variables) => {
    setSentTo(variables.email);
  });
  const resendMagicLinkMutation = useResendMagicLinkMutation();

  async function onSubmit(values: RegisterValues) {
    setError(null);

    try {
      await registerMutation.mutateAsync(values);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "We could not create your account. Try again.",
      );
    }
  }

  async function resendMagicLink() {
    if (!sentTo) {
      return;
    }

    setError(null);

    try {
      await resendMagicLinkMutation.mutateAsync({ email: sentTo });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "We could not resend the magic link. Try again.",
      );
    }
  }

  function continueWithGoogle() {
    window.location.href = authApi.googleOAuthUrl();
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <Card className="w-full">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold tracking-tight">
            Create your account
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Join NoCap — real conversations, zero filters
          </CardDescription>
        </CardHeader>

        <CardContent>
          {sentTo ? (
            <div className="flex flex-col gap-4">
              <MagicLinkSent
                email={sentTo}
                isResending={resendMagicLinkMutation.isPending}
                onResend={resendMagicLink}
              />
              <AuthError message={error} />
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-4"
              >
                {/* First & Last name row */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Jane"
                            autoComplete="given-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Doe"
                            autoComplete="family-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date of birth */}
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of birth</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          autoComplete="bday"
                          className="scheme-light dark:scheme-dark"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        You must be 18 or older to join.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-1">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending
                      ? "Creating..."
                      : "Create account"}
                  </Button>
                  <div className="relative flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full"
                    onClick={continueWithGoogle}
                  >
                    Continue with Google
                  </Button>
                </div>
                <AuthError message={error} />
              </form>
            </Form>
          )}

          {!sentTo && (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground px-4">
        By creating an account you agree to our{" "}
        <a
          href="/terms"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="/privacy-policy"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
