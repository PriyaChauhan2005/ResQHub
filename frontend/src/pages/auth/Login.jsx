// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import { apiRequest } from "../../utils/api"; 
// import logo from "../../assets/logo.png";

// export default function Login() {
//   const [role, setRole] = useState("victim");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const { login } = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!email || !password) {
//       alert("Please fill all fields");
//       return;
//     }

//     try {
     
//       const payload = await apiRequest("/api/auth/login", {
//         method: "POST",
//         body: JSON.stringify({ email, password }),
//       });

//       const token = payload?.data?.token;
//       const user = payload?.data?.user;

//       if (!token || !user || user.role !== role) {
//         alert("Invalid credentials or role mismatch");
//         return;
//       }

//       // keep existing behavior (unchanged)
//       const stored = JSON.parse(localStorage.getItem("users") || "[]");
//       const idx = stored.findIndex((u) => u.email === user.email);
//       if (idx >= 0) {
//         stored[idx] = { ...stored[idx], ...user };
//       } else {
//         stored.push(user);
//       }
//       localStorage.setItem("users", JSON.stringify(stored));

//       login({ token, user });
//     } catch (err) {
//       const msg =
//         err?.message === "Failed to fetch"
//           ? "Network error. Please try again."
//           : err?.message || "Login failed.";
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
//             Incident Response & Coordination Platform
//           </p>
//         </div>

//         <div className="flex justify-center mb-6 border-b border-gray-700">
//           <button className="px-6 py-2 border-b-2 border-blue-500 text-blue-400">
//             Log In
//           </button>
//           <Link to="/register" className="px-6 py-2 text-gray-400 hover:text-white">
//             Register
//           </Link>
//         </div>

//         <h2 className="text-xl font-semibold mb-6">Secure Portal</h2>

//         <form onSubmit={handleSubmit}>
          
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
//             {["victim", "responder", "admin"].map((r) => (
//               <button
//                 type="button"
//                 key={r}
//                 onClick={() => setRole(r)}
//                 className={`p-2 rounded-lg border text-sm capitalize transition
//                   ${
//                     role === r
//                       ? "border-blue-500 bg-blue-600/20 text-blue-400"
//                       : "border-gray-700 bg-[#132a40]"
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
//               placeholder="name@agency.org"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full p-3 rounded-lg bg-[#132a40] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div className="mb-6">
//             <label className="block text-sm mb-2 text-gray-300">
//               Password
//             </label>
//             <input
//               type="password"
//               placeholder="Enter password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-3 rounded-lg bg-[#132a40] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-blue-600 hover:bg-blue-700 transition-all p-3 rounded-xl font-semibold shadow-lg"
//           >
//             Sign In →
//           </button>

//         </form>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api"; 
import logo from "../../assets/logo.png";

export default function Login() {
  const [role, setRole] = useState("victim");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      // ✅ FIXED: using apiRequest instead of fetch
      const payload = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const token = payload?.data?.token;
      const user = payload?.data?.user;

      if (!token || !user || user.role !== role) {
        alert("Invalid credentials or role mismatch");
        return;
      }

      // keep existing behavior (unchanged)
      const stored = JSON.parse(localStorage.getItem("users") || "[]");
      const idx = stored.findIndex((u) => u.email === user.email);
      if (idx >= 0) {
        stored[idx] = { ...stored[idx], ...user };
      } else {
        stored.push(user);
      }
      localStorage.setItem("users", JSON.stringify(stored));

      login({ token, user });
    } catch (err) {
      const msg =
        err?.message === "Failed to fetch"
          ? "Network error. Please try again."
          : err?.message || "Login failed.";
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
            Incident Response & Coordination Platform
          </p>
        </div>

        <div className="flex justify-center mb-6 border-b border-gray-700">
          <button className="px-6 py-2 border-b-2 border-blue-500 text-blue-400">
            Log In
          </button>
          <Link to="/register" className="px-6 py-2 text-gray-400 hover:text-white">
            Register
          </Link>
        </div>

        <h2 className="text-xl font-semibold mb-6">Secure Portal</h2>

        <form onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {["victim", "responder", "admin"].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={`p-2 rounded-lg border text-sm capitalize transition
                  ${
                    role === r
                      ? "border-blue-500 bg-blue-600/20 text-blue-400"
                      : "border-gray-700 bg-[#132a40]"
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
              placeholder="name@agency.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#132a40] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm mb-2 text-gray-300">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#132a40] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all p-3 rounded-xl font-semibold shadow-lg"
          >
            Sign In →
          </button>

        </form>
      </div>
    </div>
  );
}