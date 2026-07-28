import { useState } from "react";
import illustration from "../assets/9963629.jpg"
import axios from "axios"

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "register") {
      try {
        const responce = await axios.post(
          "http://127.0.0.1:8000/api/register/",
          {
            username,
            email,
            password,
          }
        )

        console.log(responce.data)
        alert(responce.data)
      } catch (error) {
        console.log(error.responce.data)
        alert(error.responce.data)

      }
    } else {
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/login/",
          {
            username,
            password,
          }
        );

        console.log(response.data);
        alert(responce.data)

      } catch (error) {
        console.log(error.response.data);
        alert(error.responce.data)

      }
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel - navy illustration side */}
      <div className="hidden md:flex w-1/2 bg-[#0A2472] flex-col justify-between p-10">
        <div className="flex items-center gap-2 text-white">
          <div className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold">
            L
          </div>
          <span className="font-semibold">Brand</span>
        </div>

        {/* Illustration / flat vector image goes here */}
        <div className="w-full h-64 flex items-end justify-center">
          <img
            src={illustration}
            alt="illustration"
            className="max-h-full object-contain"
          />
        </div>
      </div>

      {/* Right panel - auth form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Tabs */}
          <div className="flex border-b mb-8">
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 py-3 text-sm font-medium ${mode === "register"
                ? "text-[#0A2472] border-b-2 border-[#0A2472]"
                : "text-slate-400"
                }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-3 text-sm font-medium ${mode === "login"
                ? "text-[#0A2472] border-b-2 border-[#0A2472]"
                : "text-slate-400"
                }`}
            >
              Login
            </button>
          </div>

          <h1 className="text-xl font-semibold text-slate-800 mb-6">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border-b border-slate-300 py-2 outline-none focus:border-[#0A2472]"
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-b border-slate-300 py-2 outline-none focus:border-[#0A2472]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-slate-300 py-2 outline-none focus:border-[#0A2472]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0A2472] text-white py-2.5 rounded-md font-medium mt-4"
            >
              {mode === "login" ? "Login" : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}