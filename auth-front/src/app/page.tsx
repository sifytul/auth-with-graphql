"use client";
import { useMeQuery } from "@/__generated__/graphql";
import { useState } from "react";
import Users from "./Users";

export default function Home() {
  const [showUser, setShowUser] = useState(false);
  const { data: meData } = useMeQuery();

  return (
    <main className="flex flex-col items-center gap-4 mt-8">
      <h1 className="text-3xl font-semibold">Welcome to Graphql Auth</h1>
      <div className="space-x-4 mt-8">
        <button
          disabled={!meData?.me?.isAdmin}
          className="btn bg-red-100 hover:bg-red-200"
          onClick={() => setShowUser(true)}
        >
          USERS
        </button>
        <button className="btn bg-red-100 hover:bg-red-200">POSTS</button>
      </div>
      {showUser ? <Users /> : null}
    </main>
  );
}
