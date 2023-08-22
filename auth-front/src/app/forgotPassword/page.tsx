"use client";
import { useForgotPasswordMutation } from "@/__generated__/graphql";
import { useState } from "react";

const ForgotPassword = () => {
  const [modalState, setModalState] = useState({
    email: "",
    error: "",
    success: false,
  });
  const [forgotPassword] = useForgotPasswordMutation();

  const modalClickHandler = async (e: any) => {
    e.preventDefault();
    const { data } = await forgotPassword({
      variables: { email: modalState.email },
    });
    if (data) {
      setModalState({
        ...modalState,
        success: true,
      });
    }
  };
  return (
    <div className="flex justify-center items-center">
      <div className="mx-auto my-4 space-y-2">
        <input
          onChange={(e) => {
            setModalState({ ...modalState, email: e.target.value });
          }}
          value={modalState.email}
          type="text"
          placeholder="Type Email here..."
          className="input input-bordered w-full max-w-sm"
        />
        {modalState.error && (
          <p className="text-red-600 font-semibold">{modalState.error}</p>
        )}{" "}
        <button
          disabled={!modalState.email}
          className="btn"
          onClick={modalClickHandler}
        >
          Send Email
        </button>
      </div>
      {modalState.success && (
        <div className="toast toast-top toast-end">
          <div className="alert alert-success">
            <span>Email sent successfully.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
