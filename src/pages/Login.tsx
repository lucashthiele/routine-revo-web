import LoginForm from "../features/authentication/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* You can add your logo here */}
        {/* <img className="mx-auto h-12 w-auto" src={logo} alt="Routine Revo" /> */}
        <h1 className="text-center text-4xl font-bold text-blue-600">
          Routine Revo
        </h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-lg bg-white py-8 px-4 shadow sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
