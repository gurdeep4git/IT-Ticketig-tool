import { useRef, useState } from "react";
import styles from "./LoginForm.module.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const LoginForm = () => {
  const {setUser} = useAuth()
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [apiState, setApiState] = useState<{
    loading: boolean;
    error: string | null;
  }>({ loading: false, error: null });
  const navigate = useNavigate();
  

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!emailRef.current?.value.trim()) {
      errors.email = "This is required";
    } else if (!/^\S+@\S+\.\S+$/.test(emailRef.current.value)) {
      errors.email = "Enter a valid email";
    }
    if (!passwordRef.current?.value.trim()) {
      errors.password = "This is required";
    }
    return errors;
  };

  const handleLogin = (event) => {
    event.preventDefault();
    const newErrors = validate();

    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    login();
  };

  const login = async () => {
    setApiState({ loading: true, error: null });
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailRef.current?.value,
          password: passwordRef.current?.value,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        // server-side errors
        setApiState({
          loading: false,
          error: data?.detail ?? "Login failed",
        });
        return;
      }

      const response = await res.json();
      setApiState({ loading: false, error: null });
      // prefer server-provided `user` object, fallback to whole response
      const user = response.data;
      setUser(user);
      navigate("/dashboard");

    } catch (error) {
      // Network failure
      setApiState({
        loading: false,
        error: "Something went wrong. Try again.",
      });
    }
  };

  return (
    <>
      <form onSubmit={handleLogin}>
        
          <div>
            <h2 className="card-title mb-2">Login</h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Email</label>
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="Type here"
                  className="input input-bordered w-full border border-gray-400"
                />
                {errors.email && (
                  <span style={{ color: "red" }}>{errors.email}</span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Password</label>
                <input
                  ref={passwordRef}
                  type="password"
                  placeholder="Type here"
                  className="input input-bordered w-full border border-gray-400"
                />
                {errors.password && (
                  <span style={{ color: "red" }}>{errors.password}</span>
                )}
              </div>
            </div>

            {apiState.error && <span style={{ color: "red" }}>{apiState.error}</span>}

            <div className="card-actions justify-end mt-4">
              <button type="submit" className="btn btn-primary">
                {!apiState.loading ? "Login" : "Loading..."}
              </button>
            </div>
          </div>
      </form>
    </>
  );
};
