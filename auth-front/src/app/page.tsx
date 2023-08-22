"use client";
import { useHelloQuery } from "@/__generated__/graphql";
import { gql } from "@apollo/client";
import Link from "next/link";
import { useState } from "react";
import { Users } from "./Users";

const query = gql`
  query UsersQuery {
    getAllUsers {
      email
      id
      name
    }
  }
`;
export default function Home() {
  const { data, loading } = useHelloQuery();
  const [showUser, setShowUser] = useState(false);

  return (
    <main className="flex flex-col items-center gap-4 mt-8">
      <h1 className="text-3xl font-semibold">Welcome to Graphql Auth</h1>
      <h1>
        {loading ? (
          <div className="loading loading-ring loading-xs"></div>
        ) : (
          data?.hello
        )}
      </h1>
      <div className="space-x-4">
        <button
          className="btn bg-red-100 hover:bg-red-200"
          onClick={() => setShowUser(true)}
        >
          USERS
        </button>
        <button className="btn bg-red-100 hover:bg-red-200">POSTS</button>
        <Link href={"/pollPage"}>
          <button className="btn bg-red-100 hover:bg-red-200">POLL</button>
        </Link>
      </div>
      {showUser ? <Users /> : null}
    </main>
  );
}
