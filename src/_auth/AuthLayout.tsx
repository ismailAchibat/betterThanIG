import { Outlet, Navigate } from "react-router-dom";

const AuthLayout = () => {
  const isAuthenticated = false;

  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/" />
      ) : (
        <>
          <section className="flex flex-1 justify-center items-center flex-col py-10">
            <Outlet />
          </section>

          <img
            src="public/assets/images/btig_sideImg2.png"
            alt="logo"
            className="hidden xl:block border-2 border-gray-800 rounded-lg"
          />
        </>
      )}
    </>
  );
};

export default AuthLayout;
