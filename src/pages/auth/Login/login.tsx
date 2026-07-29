import { useState } from "react";
import { useLogin } from "@/hook/login";
import { useForm } from "react-hook-form";
import { EyeIcon, LockIcon, LogoMark, MailIcon } from "../../../icons";
import { useNavigate } from "react-router-dom";

type LoginFields = {
    email: string;
    password: string;
};

function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const { mutate, isPending } = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFields>({
        defaultValues: {
            email: "",
            password: "",
        },
    });


    const onSubmit = (data: LoginFields) => {

        mutate(data, {

            onSuccess: (response) => {
                console.log("Login successful:", response);
                navigate("/dashboard");
            },

            onError: (error) => {
                console.error("Login failed:", error);
            },

        });

    };


    return (
        <main className="relative isolate flex min-h-screen items-center justify-center bg-[#f5fbf8] px-5">

            <section className="w-full max-w-[516px] rounded-[15px] bg-white p-10 shadow-lg">


                <header className="flex items-center justify-center gap-5">

                    <LogoMark className="h-20 w-20" />

                    <div>
                        <h1 className="text-3xl font-extrabold text-[#087948]">
                            HAMRO SAMUH
                        </h1>

                        <p className="font-bold text-[#00ad62]">
                            Together We Grow
                        </p>

                    </div>

                </header>



                <div className="mt-8 text-center">

                    <h2 className="text-2xl font-bold text-gray-800">
                        Welcome Back!
                    </h2>

                    <p className="text-gray-500">
                        Sign in to your account to continue
                    </p>

                </div>




                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-6"
                >


                    {/* Email */}

                    <div>

                        <label className="mb-2 block font-bold">
                            Email
                        </label>


                        <div className="relative">

                            <MailIcon className="absolute left-4 top-3 h-5 w-5 text-gray-400" />


                            <input

                                type="email"

                                placeholder="Enter your email"

                                className={`
                                    h-12 w-full rounded-md border 
                                    pl-12 outline-none
                                    ${errors.email
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    }
                                `}

                                {...register("email", {
                                    required: "Email is required"
                                })}

                            />


                        </div>


                        {
                            errors.email && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.email.message}
                                </p>
                            )
                        }


                    </div>





                    {/* Password */}

                    <div className="mt-5">


                        <label className="mb-2 block font-bold">
                            Password
                        </label>


                        <div className="relative">


                            <LockIcon className="absolute left-4 top-3 h-5 w-5 text-gray-400" />


                            <input

                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }

                                placeholder="Enter your password"


                                className={`
                                    h-12 w-full rounded-md border 
                                    pl-12 pr-12 outline-none

                                    ${errors.password
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    }
                                `}


                                {...register("password", {
                                    required: "Password is required"
                                })}


                            />



                            <button

                                type="button"

                                className="absolute right-4 top-3"

                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }

                            >

                                <EyeIcon className="h-5 w-5 text-gray-400" />

                            </button>


                        </div>



                        {
                            errors.password && (

                                <p className="mt-1 text-sm text-red-500">
                                    {errors.password.message}
                                </p>

                            )
                        }



                    </div>






                    <div className="mt-5 flex justify-end">

                        <a
                            href="#"
                            className="text-sm font-bold text-green-600"
                        >
                            Forgot Password?
                        </a>

                    </div>
                    <button

                        type="submit"

                        disabled={isPending}

                        className="
                            mt-6 flex h-12 w-full 
                            items-center justify-center
                            gap-2 rounded-md 
                            bg-green-600 
                            font-bold text-white
                            disabled:opacity-50
                        "

                    >

                        <LockIcon className="h-5 w-5" />


                        {
                            isPending
                                ? "Logging in..."
                                : "Login"
                        }


                    </button>



                </form>



            </section>


        </main>
    );
}

export default Login;