"use client";
import { useUpdatePasswordMutation } from "@/__generated__/graphql";
import AlertMessage from "@/components/AlertMessage";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const EditPassword = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const [updatePassword, { data }] = useUpdatePasswordMutation();
  const onSubmit = async (data: any) => {
    console.log(data);
    if (data.newPassword !== data.retypeNewPassword) {
      setError("retypeNewPassword", {
        type: "retypeNewPassword",
        message: "Password didn't match",
      });
      return;
    }
    try {
      const { errors } = await updatePassword({
        variables: {
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        },
      });
    } catch (err) {
      setError("oldPassword", {
        type: "oldPassword",
        message: err?.message as string,
      });
      return;
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="my-4 space-y-2">
          <p>Old Password</p>
          <input
            {...register("oldPassword", {
              required: true,
            })}
            type="password"
            placeholder="Type here"
            className="input input-bordered w-full max-w-sm"
          />{" "}
          {errors.oldPassword && (
            <p className="text-red-600 font-semibold">
              {errors.oldPassword.message as string}
            </p>
          )}
        </div>
        <div className="my-4 space-y-2">
          <p>New Password</p>
          <input
            {...register("newPassword", {
              required: true,
            })}
            type="password"
            placeholder="Type here"
            className="input input-bordered w-full max-w-sm"
          />
        </div>
        <div className="my-4 space-y-2">
          <p className="">Retype New Password</p>
          <input
            {...register("retypeNewPassword")}
            type="password"
            placeholder="Type here"
            className="input input-bordered w-full max-w-sm"
          />
          {errors.retypeNewPassword && (
            <p className="text-red-600 font-semibold">
              {errors.retypeNewPassword.message as string}
            </p>
          )}
        </div>
        <button className="btn bg-red-200 hover:bg-red-300" type="submit">
          Change Password
        </button>
      </form>
      {data && <AlertMessage message={"Your Password has been Changed!"} />}
    </div>
  );
};

export default EditPassword;
