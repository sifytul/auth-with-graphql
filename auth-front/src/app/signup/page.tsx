"use client";
import { useRegisterMutation } from "@/__generated__/graphql";
import { setAccessToken } from "@/accessToken";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const SignUp = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const [registerUser] = useRegisterMutation();
  const onSubmit = async (data: any) => {
    const response = await registerUser({
      variables: data,
    });
    if (
      response.data?.createUser.errors &&
      response.data.createUser.errors[0].field === "Email"
    ) {
      setError("email", {
        type: "email",
        message: response.data.createUser.errors[0].message,
      });
      return;
    }
    setAccessToken(response.data?.createUser.success?.accessToken || "");
    router.push("/");
  };
  return (
    <div style={{ width: "50%", margin: "2rem auto" }}>
      <h1 className=" text-3xl text-stone-600 font-bold">Sign Up</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="my-4 space-y-2">
          <p>Name</p>
          <input
            {...register("name")}
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-sm"
          />
        </div>
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
              {errors?.email.message as string}
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
        </div>
        <button className="btn" type="submit">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUp;
