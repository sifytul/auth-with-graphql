"use client";
import { useChangePasswordMutation } from "@/__generated__/graphql";
import { setAccessToken } from "@/accessToken";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const ForgotPassswordToken = () => {
  const router = useRouter();
  const params = useParams();
  const [modalState, setModalState] = useState({
    password: "",
    error: "",
  });

  const [changePassword, { error, client }] = useChangePasswordMutation();
  const modalClickHandler = async (e: any) => {
    e.preventDefault();
    const { data } = await changePassword({
      variables: {
        password: modalState.password,
        token: params.token as string,
      },
    });
    if (data) {
      client.resetStore();
      setAccessToken(data.changePassword.data?.accessToken!);
      router.push("/");
    }
  };
  return (
    <div className="flex justify-center items-center">
      <div className="my-4 space-y-2">
        <input
          onChange={(e) => {
            setModalState({ ...modalState, password: e.target.value });
          }}
          value={modalState.password}
          type="text"
          placeholder="Type New Password..."
          className="input input-bordered w-full max-w-sm"
        />
        {error && <p className="text-red-600 font-semibold">{error.message}</p>}{" "}
        <button
          disabled={!modalState.password}
          className="btn"
          onClick={modalClickHandler}
        >
          Change Password
        </button>
        <Link className="hover:underline italic ml-2" href="/forgotPassword">
          Get a new token
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassswordToken;
