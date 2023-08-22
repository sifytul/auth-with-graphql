"use client";
import { useLogoutMutation, useMeQuery } from "@/__generated__/graphql";
import { setAccessToken } from "@/accessToken";
import Link from "next/link";
import { useRouter } from "next/navigation";

const NavBar = () => {
  const router = useRouter();
  let { data, error } = useMeQuery();
  let [logout, { client }] = useLogoutMutation();
  console.log("me data => ", data);

  return (
    <div className="navbar bg-red-100">
      <div className="flex-1">
        <Link href={"/"} className="btn btn-ghost normal-case text-xl">
          Auth-With-GraphQL
        </Link>
      </div>
      <div className="flex-none gap-2">
        <div className="form-control">
          <input
            type="text"
            placeholder="Search"
            className="input input-bordered w-24 md:w-auto"
          />
        </div>
        {data?.me ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img src="https://media.istockphoto.com/id/1034357476/photo/indoor-photo-of-handsome-european-guy-pictured-isolated-on-grey-background-standing-close-to.jpg?s=612x612&w=0&k=20&c=3F-nSSoTbe6IhXeCn-tZHCUTx-DT58YOs1-9vGv__es=" />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
            >
              <li>
                <a className="justify-between">
                  Profile
                  <span className="badge">New</span>
                </a>
              </li>
              <li>
                <a>Settings</a>
              </li>
              <li>
                <a
                  onClick={async () => {
                    await logout();
                    setAccessToken("");
                    await client.resetStore();
                  }}
                >
                  Logout
                </a>
              </li>
            </ul>
          </div>
        ) : (
          <div>
            <div className="space-x-4">
              <Link href={"/signup"}>
                <button className="btn">Sign Up</button>
              </Link>
              <Link href={"/login"}>
                <button className="btn">Log In</button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;
