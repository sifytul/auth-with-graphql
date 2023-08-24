"use client";
import { ReactNode, useState } from "react";
import EditName from "./EditName";
import EditPassword from "./EditPassword";

const EditProfile = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<string>();
  return (
    <div className="flex flex-col justify-center items-center mt-20 space-y-4">
      <h1 className="text-2xl font-semibold font-mono">
        I am
        <img
          src="https://image.spreadshirtmedia.com/image-server/v1/products/T1459A839PA3861PT28D1025820966W8333H10000/views/1,width=550,height=550,appearanceId=839,backgroundColor=F2F2F2/project-zorgo-hacker-watching-you-anonymous-mask-sticker.jpg"
          className="h-40 w-40"
        />
      </h1>
      <div className="space-x-4">
        <button
          className="btn bg-red-100 hover:bg-red-200 tracking-wide"
          onClick={() => setState("editName")}
        >
          Edit Name ✏️
        </button>
        <button
          className="btn bg-red-100 hover:bg-red-200 tracking-wide"
          onClick={() => setState("editPassword")}
        >
          Edit Password ✏️
        </button>
      </div>
      <div>
        {state === "editName" ? (
          <EditName />
        ) : state === "editPassword" ? (
          <EditPassword />
        ) : null}
      </div>
    </div>
  );
};

export default EditProfile;
