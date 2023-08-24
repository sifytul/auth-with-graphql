"use client";
import {
  useDeleteUserMutation,
  useGetAllUsersQuery,
} from "@/__generated__/graphql";
import Loading from "./loading";

const Users = () => {
  const { data: users, error, loading } = useGetAllUsersQuery();
  const [deleteUser, { client }] = useDeleteUserMutation();
  if (loading) {
    return <Loading />;
  }
  return (
    <div className="overflow-x-auto">
      {error && <p>{error.message}</p>}
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Email</th>
            <th>Delete User</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {/* row 1 */}
          {users?.getAllUsers?.map((user, index) => (
            <TableRow
              apolloClient={client}
              key={index}
              name={user.name}
              isAdmin={user.isAdmin}
              userId={user.id}
              deleteAction={deleteUser}
              email={user.email}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;

const TableRow = ({
  apolloClient,
  name,
  isAdmin,
  email,
  userId,
  imgUrl = "https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?cs=srgb&dl=pexels-andrea-piacquadio-3777943.jpg&fm=jpg",
  deleteAction,
}: any) => {
  return (
    <tr>
      <td>
        <div className="flex items-center space-x-3">
          <div className="avatar">
            <div className="mask mask-squircle w-12 h-12">
              <img src={imgUrl} alt="Avatar Tailwind CSS Component" />
            </div>
          </div>
          <div>
            <div className="font-bold">{name}</div>
          </div>
        </div>
      </td>
      <td>{isAdmin ? "Admin" : "User"}</td>
      <td>{email}</td>
      <th>
        <button
          disabled={isAdmin}
          className="btn btn-xs"
          onClick={async () => {
            const response = await deleteAction({
              variables: { userId: parseInt(userId) },
              update: () => {
                apolloClient.cache.evict({
                  id: apolloClient.cache.identify({
                    __typename: "User",
                    id: userId,
                  }),
                });
              },
            });
          }}
        >
          ❌
        </button>
      </th>
    </tr>
  );
};
