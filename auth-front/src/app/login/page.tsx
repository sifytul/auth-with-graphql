"use client";
import { MeDocument, MeQuery, useLoginMutation } from "@/__generated__/graphql";
import { setAccessToken } from "@/accessToken";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const LogIn = () => {
  const router = useRouter();
  const {
    register,
    formState: { errors, isLoading },
    handleSubmit,
    setError,
  } = useForm();
  const [login] = useLoginMutation();

  const onSubmit = async (data: any) => {
    const response = await login({
      variables: data,
      update: (store, { data }) => {
        if (!data) {
          return null;
        }
        store.writeQuery<MeQuery>({
          query: MeDocument,
          data: {
            __typename: "Query",
            me: data.login.data?.user as any,
          },
        });
      },
    });

    if (response.data?.login.errors) {
      if (response.data?.login.errors[0].field === "email") {
        setError("email", {
          type: "email",
          message: response.data.login.errors[0].message,
        });
        return;
      } else if (response.data?.login.errors[0].field === "password") {
        setError("password", {
          type: "password",
          message: response.data.login.errors[0].message,
        });
        return;
      } else {
        setError("email", {
          type: "email",
          message: response.data.login.errors[0].message,
        });
        setError("password", {
          type: "password",
          message: response.data.login.errors[0].message,
        });
        return;
      }
    }
    setAccessToken(response.data?.login.data?.accessToken!);
    router.push("/");
  };

  return (
    <div style={{ width: "50%", margin: "2rem auto" }}>
      <h1 className=" text-3xl text-stone-600 font-bold">Welcome Back!!!</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="my-4 space-y-2">
          <p>Email</p>
          <input
            {...register("email")}
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-sm"
          />
          {errors.email && (
            <p className="text-red-600 font-semibold">
              {errors.email.message as string}
            </p>
          )}
        </div>
        <div className="my-4 space-y-2">
          <p className="">Password</p>
          <input
            {...register("password")}
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-sm"
          />
          {errors.password && (
            <p className="text-red-600 font-semibold">
              {errors.password.message as string}
            </p>
          )}
        </div>
        <div className="flex space-x-2 items-center ">
          <button className="btn" type="submit">
            LOG IN
          </button>

          {/* The button to open modal */}
          <Link
            href="/forgotPassword"
            className="italic font-semibold hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LogIn;
