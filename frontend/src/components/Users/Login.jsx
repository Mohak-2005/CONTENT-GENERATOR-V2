import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import StatusMessage from "../Alert/StatusMessage";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // ✅ added useQueryClient
import { loginAPI } from "../../apis/user/usersAPI";
import { useAuth } from "../../AuthContext/AuthContext";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const Login = () => {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // ✅ to refetch auth status after login

  // Redirect if user is already logged in (existing session)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const mutation = useMutation({ mutationFn: loginAPI });

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  // ✅ On successful login:
  // 1. Call login() to set isAuthenticated true in context
  // 2. Invalidate checkAuth query so it refetches fresh data
  // 3. Navigate directly to dashboard without waiting for re-render
  useEffect(() => {
    if (mutation.isSuccess) {
      login();
      queryClient.invalidateQueries({ queryKey: ["checkAuth"] });
      navigate("/dashboard"); // ✅ navigate directly here, don't rely on top useEffect
    }
  }, [mutation.isSuccess, navigate]);

  // Show nothing while checking existing session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 m-4">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Login to Your Account
        </h2>

        {/* display loading */}
        {mutation.isPending && (
          <StatusMessage type="loading" message="Loading..." />
        )}
        {/* display error */}
        {mutation.isError && (
          <StatusMessage
            type="error"
            message={mutation?.error?.response?.data?.message}
          />
        )}
        {/* display success */}
        {mutation.isSuccess && (
          <StatusMessage type="success" message="Login success" />
        )}

        {/* Form for login */}
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Email input field */}
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 block mb-2"
            >
              Your Email
            </label>
            <input
              type="email"
              id="email"
              {...formik.getFieldProps("email")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              placeholder="you@example.com"
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 mt-1">{formik.errors.email}</div>
            )}
          </div>

          {/* Password input field */}
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 block mb-2"
            >
              Your Password
            </label>
            <input
              type="password"
              id="password"
              {...formik.getFieldProps("password")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 mt-1">{formik.errors.password}</div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Don't have an account? Register
              </Link>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
