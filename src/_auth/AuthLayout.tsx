import { Outlet, Navigate } from "react-router-dom";

const AuthLayout = () => {
  const isAuthenticated = false;

  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/" />
      ) : (
        <>
          <section className="flex flex-1 justify-center items-center flex-col py-10 p-10">
            <Outlet />
          </section>
          <img
            src="public/assets/images/btig_sideImg2.png"
            alt="logo"
            className="hidden xl:block md:mr-10 lg:mr-18 xl:mr-28"
          />
        </>
        /*<>
        <section class="flex justify-center items-center w-1/2 h-screen">
          <Outlet />
        </section>
      
        <div class="flex justify-center items-center w-1/2 h-screen">
          <img
            src="public/assets/images/btig_sideImg2.png"
            alt="logo"
            class="max-w-full max-h-full"
          />
        </div>
      </>*/
      )}
    </>
  );
};

export default AuthLayout;
