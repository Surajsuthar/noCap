import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
          <form noValidate>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="text-xs text-primary underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </Field>

              <Field className="gap-3 pt-1">
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
                <div className="relative flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <Button variant="outline" type="button" className="w-full">
                  Continue with Google
                </Button>
              </Field>
            </FieldGroup>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            No account?{" "}
            <a
              href="#"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Create one free
            </a>
          </p>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground px-4">
        By signing in you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-foreground">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-foreground">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
