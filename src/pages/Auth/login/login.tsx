import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import Input from "@/component/Input/input";
import { useLogin } from "@/hook/login";

import {
  EyeIcon,
  LockIcon,
  LogoMark,
  MailIcon,
} from "../../../icons";

type LoginFields = {
  email: string;
  password: string;
};

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const { mutate, isPending } = useLogin();

  const {
    control,
    handleSubmit,
  } = useForm<LoginFields>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFields) => {
    mutate(data, {
      onSuccess: (response) => {
        console.log(response);
        navigate("/dashboard");
      },

      onError: (error) => {
        console.error(error);
      },
    });
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center bg-[#f5fbf8] px-3 py-6 sm:px-5">
      <section className="w-full max-w-[516px] rounded-[15px] bg-white p-5 shadow-lg sm:p-10">
        <header className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-5 sm:text-left">
          <LogoMark className="h-16 w-16 shrink-0 sm:h-20 sm:w-20" />

          <div>
            <h1 className="text-2xl font-extrabold text-[#087948] sm:text-3xl">
              HAMRO SAMUH
            </h1>

            <p className="text-sm font-bold text-[#00ad62] sm:text-base">
              Together We Grow
            </p>
          </div>
        </header>

        <div className="mt-6 text-center sm:mt-8">
          <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
            Welcome Back!
          </h2>

          <p className="text-gray-500">
            Sign in to your account to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-5"
        >
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email is required",
            }}
            render={({ field,}) => (
              <Input
                {...field}
                type="email"
                label="Email"
                placeholder="Enter your email"
                icon={<MailIcon className="h-5 w-5" />}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{
              required: "Password is required",
            }}
            render={({ field}) => (
              <Input
                {...field}
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                label="Password"
                placeholder="Enter your password"
                icon={<LockIcon className="h-5 w-5" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                  >
                    <EyeIcon className="h-5 w-5 text-slate-500" />
                  </button>
                }
              />
            )}
          />

          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm font-bold text-green-600"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-green-600 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LockIcon className="h-5 w-5" />

            {isPending
              ? "Logging in..."
              : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;
