import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button/Button";
import Input from "../../components/common/Input/Input";
import Card from "../../components/common/Card/Card";
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    isSeller: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate("/login");
    } catch (error) {
      setErrors({
        general: error.response?.data?.error || "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8">
        <div>
          <div className="flex justify-center">
            <div className="h-12 w-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join the community of smart shoppers
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              icon={<UserIcon className="h-5 w-5" />}
              required
            />

            <Input
              label="Username"
              type="text"
              name="username"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              icon={<IdentificationIcon className="h-5 w-5" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              icon={<EnvelopeIcon className="h-5 w-5" />}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              icon={<LockClosedIcon className="h-5 w-5" />}
              error={errors.password}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={<LockClosedIcon className="h-5 w-5" />}
              error={errors.confirmPassword}
              required
            />

            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                I want to:
              </label>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !formData.isSeller
                    ? "bg-primary-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, isSeller: false }))
                }
              >
                🛍️ Buyer
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  formData.isSeller
                    ? "bg-primary-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, isSeller: true }))
                }
              >
                🛒 Seller
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{" "}
              <Link
                to="/terms"
                className="text-primary-600 hover:text-primary-500"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-primary-600 hover:text-primary-500"
              >
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            Create Account
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Login
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default Register;
