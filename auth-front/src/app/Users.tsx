"use client";
import { useGetAllUsersQuery } from "@/__generated__/graphql";

export const Users = () => {
  const { data: users, error } = useGetAllUsersQuery();
  return (
    <div>
      <div>
        {error && <p>{error.message}</p>}
        {users?.getAllUsers?.map((item) => (
          <>
            <li>{item.id}</li>
            <li>{item.email}</li>
            <br />
          </>
        ))}
      </div>
    </div>
  );
};
