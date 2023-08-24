import { setAccessToken } from "@/accessToken";
import NavBar from "@/components/Navbar";
import { useEffect, useState } from "react";
import Loading from "./loading";

const Home = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/refresh_token", {
      method: "POST",
      credentials: "include",
    }).then(async (x) => {
      const { accessToken } = await x.json();
      setAccessToken(accessToken);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <Loading />;
  }
  return (
    <div>
      <NavBar />
      {children}
    </div>
  );
};

export default Home;
