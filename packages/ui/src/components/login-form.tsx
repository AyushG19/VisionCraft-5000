import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  IconBrandFacebookFilled,
  IconBrandGithub,
  IconBrandGithubFilled,
  IconBrandGoogle,
  IconBrandGoogleFilled,
} from "@tabler/icons-react";

export function LoginForm({
  className,
  id,
  onGithubLogin,
  onGoogleLogin,
  onFacebookLogin,
  ...props
}: React.ComponentProps<"div"> & {
  onGithubLogin?: () => void;
  onGoogleLogin?: () => void;
  onFacebookLogin?: () => void;
}) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {id === "login" ? "Welcome Back" : "Welcome"}
          </CardTitle>
          <CardDescription>Login with popular Providers</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-6">
              <div className="flex gap-4">
                <Button
                  onClick={onGithubLogin}
                  variant="outline"
                  className="cursor-pointer"
                >
                  <IconBrandGithubFilled />
                  GitHub
                </Button>
                <Button
                  onClick={onGithubLogin}
                  variant="outline"
                  className="cursor-pointer"
                >
                  <IconBrandGoogleFilled />
                  Google
                </Button>
                <Button
                  onClick={onGithubLogin}
                  variant="outline"
                  className="cursor-pointer"
                >
                  <IconBrandFacebookFilled />
                  FaceBook
                </Button>
              </div>
              {/* <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue without password with...
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email (currently not working)</Label>
                  <Input id="email" type="email" placeholder="m@example.com" />
                </div>
                <Button type="submit" className="w-full">
                  {id === "login" ? "Login" : "Sign up"}
                </Button>
              </div>
              <div className="text-center text-sm">
                {id === "login" ? `Don&apos;t` : `Already`} have an account?{" "}
                <a
                  href={id === "login" ? "/signup" : "/login"}
                  className="underline underline-offset-4"
                >
                  {id === "login" ? "Sign up" : "Login"}
                </a>
              </div> */}
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
