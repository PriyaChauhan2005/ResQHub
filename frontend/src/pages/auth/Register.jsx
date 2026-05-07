// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { apiRequest } from "../../utils/api"; 
// import logo from "../../assets/logo.png";

// export default function Register() {
//   const [role, setRole] = useState("victim");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [name, setName] = useState("");

//   const navigate = useNavigate();

//   const handleRegister = async (e) => {
//     e.preventDefault();

//     if (!name || !email || !password) {
//       alert("Please fill all fields");
//       return;
//     }

//     if (password.length < 8) {
//       alert("Password must be at least 8 characters");
//       return;
//     }

//     try {
      
//       const payload = await apiRequest("/api/auth/register", {
//         method: "POST",
//         body: JSON.stringify({ name, email, password, role }),
//       });

//       const user = payload?.data?.user;

//       if (user) {
//         const stored = JSON.parse(localStorage.getItem("users") || "[]");
//         const idx = stored.findIndex((u) => u.email === user.email);
//         if (idx >= 0) {
//           stored[idx] = { ...stored[idx], ...user };
//         } else {
//           stored.push(user);
//         }
//         localStorage.setItem("users", JSON.stringify(stored));
//       }

//       alert("Account created successfully.");
//       navigate("/login");
//     } catch (err) {
//       const msg =
//         err?.message === "Failed to fetch"
//           ? "Network error. Please try again."
//           : err?.message || "Registration failed.";
//       alert(msg);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0b1c2d] to-[#091420] text-white flex items-center justify-center px-4 py-10">

//       <div className="w-full max-w-md bg-[#0f2235] rounded-2xl p-6 sm:p-8 shadow-2xl border border-blue-900">

//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-900/40">
//             <img src={logo} alt="ResQHub Logo" className="w-16 mx-auto drop-shadow-lg" />
//           </div>

//           <h1 className="text-2xl font-bold mt-5 tracking-wide">ResQHub</h1>
//           <p className="text-gray-400 text-sm mt-1">
//             Disaster Management & Response
//           </p>
//         </div>

//         <div className="flex justify-center mb-6 border-b border-gray-700">
//           <Link to="/login" className="px-6 py-2 text-gray-400 hover:text-white">
//             Log In
//           </Link>
//           <button className="px-6 py-2 border-b-2 border-blue-500 text-blue-400">
//             Register
//           </button>
//         </div>

//         <h2 className="text-xl font-semibold mb-2">Create Account</h2>
//         <p className="text-gray-400 text-sm mb-6">
//           Join the network to help or request aid.
//         </p>

//         <form onSubmit={handleRegister}>

//           <div className="mb-4">
//             <label className="block text-sm mb-2 text-gray-300">
//               Full Name
//             </label>
//             <input
//               type="text"
//               placeholder="Your Name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="w-full p-3 rounded-lg bg-[#132a40] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
//             {["victim", "responder", "admin"].map((r) => (
//               <button
//                 type="button"
//                 key={r}
//                 onClick={() => setRole(r)}
//                 className={`p-3 sm:p-4 rounded-xl border transition-all capitalize font-medium
//                   ${
//                     role === r
//                       ? "border-blue-500 bg-blue-600/20 text-blue-400"
//                       : "border-gray-700 bg-[#132a40] hover:border-blue-500"
//                   }`}
//               >
//                 {r}
//               </button>
//             ))}
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm mb-2 text-gray-300">
//               Email Address
//             </label>
//             <input
//               type="email"
//               placeholder="name@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full p-3 rounded-lg bg-[#132a40] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div className="mb-2">
//             <label className="block text-sm mb-2 text-gray-300">
//               Password
//             </label>
//             <input
//               type="password"
//               placeholder="Create a secure password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-3 rounded-lg bg-[#132a40] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <p className="text-xs text-gray-500 mb-6">
//             Must be at least 8 characters
//           </p>

//           <button
//             type="submit"
//             className="w-full bg-blue-600 hover:bg-blue-700 transition-all p-3 rounded-xl font-semibold shadow-lg"
//           >
//             Create Account →
//           </button>

//         </form>

//         <p className="text-sm text-gray-400 mt-6 text-center">
//           Already have an account?{" "}
//           <Link to="/login" className="text-blue-400 hover:underline">
//             Log In
//           </Link>
//         </p>

//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../utils/api"; 
import logo from "../../assets/logo.png";

export default function Register() {
  const [role, setRole] = useState("victim");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    try {
      // ✅ FIXED: using apiRequest
      const payload = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      });

      const user = payload?.data?.user;

      if (user) {
        const stored = JSON.parse(localStorage.getItem("users") || "[]");
        const idx = stored.findIndex((u) => u.email === user.email);
        if (idx >= 0) {
          stored[idx] = { ...stored[idx], ...user };
        } else {
          stored.push(user);
        }
        localStorage.setItem("users", JSON.stringify(stored));
      }

      alert("Account created successfully.");
      navigate("/login");
    } catch (err) {
      const msg =
        err?.message === "Failed to fetch"
          ? "Network error. Please try again."
          : err?.message || "Registration failed.";
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1c2d] to-[#091420] text-white flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md bg-[#0f2235] rounded-2xl p-6 sm:p-8 shadow-2xl border border-blue-900">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-900/40">
            <img src={logo} alt="ResQHub Logo" className="w-16 mx-auto drop-shadow-lg" />
          </div>

          <h1 className="text-2xl font-bold mt-5 tracking-wide">ResQHub</h1>
          <p className="text-gray-400 text-sm mt-1">
            Disaster Management & Response
          </p>
        </div>

        <div className="flex justify-center mb-6 border-b border-gray-700">
          <Link to="/login" className="px-6 py-2 text-gray-400 hover:text-white">
            Log In
          </Link>
          <button className="px-6 py-2 border-b-2 border-blue-500 text-blue-400">
            Register
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-2">Create Account</h2>
        <p className="text-gray-400 text-sm mb-6">
          Join the network to help or request aid.
        </p>

        <form onSubmit={handleRegister}>

          <div className="mb-4">
            <label className="block text-sm mb-2 text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#132a40] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {["victim", "responder", "admin"].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={`p-3 sm:p-4 rounded-xl border transition-all capitalize font-medium
                  ${
                    role === r
                      ? "border-blue-500 bg-blue-600/20 text-blue-400"
                      : "border-gray-700 bg-[#132a40] hover:border-blue-500"
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-2 text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#132a40] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm mb-2 text-gray-300">
              Password
            </label>
            <input
              type="password"
              placeholder="Create a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#132a40] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <p className="text-xs text-gray-500 mb-6">
            Must be at least 8 characters
          </p>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all p-3 rounded-xl font-semibold shadow-lg"
          >
            Create Account →
          </button>

        </form>

        <p className="text-sm text-gray-400 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Log In
          </Link>
        </p>

      </div>
    </div>
  );
}