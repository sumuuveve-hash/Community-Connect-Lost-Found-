"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, CheckCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AdminActivationPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    inviteCode: "",
    tempPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    temp: false,
    new: false,
    confirm: false,
  })
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const togglePasswordVisibility = (field: "temp" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.inviteCode.trim()) {
      newErrors.inviteCode = "Invite code is required"
    }
    if (!formData.tempPassword.trim()) {
      newErrors.tempPassword = "Temporary password is required"
    }
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required"
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long"
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(true)
        // Redirect to admin login after 3 seconds
        setTimeout(() => {
          router.push("/admin")
        }, 3000)
      } else {
        const error = await response.json()
        setErrors({ submit: error.message || "Activation failed" })
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <Card className="w-full max-w-md animate-fade-in-up">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Activated!</h2>
            <p className="text-gray-600 mb-4">Your admin account has been successfully activated.</p>
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
            <div className="mt-4">
              <Link href="/admin">
                <Button className="bg-green-600 hover:bg-green-700">Go to Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <Card className="w-full max-w-md animate-fade-in-up hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl animate-fade-in">Activate Admin Account</CardTitle>
          <p className="text-gray-600 animate-fade-in" style={{ animationDelay: "200ms" }}>
            Use your invite code and temporary password to activate your account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                placeholder="Enter your 12-character invite code"
                value={formData.inviteCode}
                onChange={(e) => handleInputChange("inviteCode", e.target.value.toUpperCase())}
                className={`font-mono ${errors.inviteCode ? "border-red-500 animate-shake" : ""}`}
                maxLength={12}
              />
              {errors.inviteCode && <p className="text-red-500 text-sm animate-fade-in">{errors.inviteCode}</p>}
            </div>

            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <Label htmlFor="tempPassword">Temporary Password</Label>
              <div className="relative">
                <Input
                  id="tempPassword"
                  type={showPasswords.temp ? "text" : "password"}
                  placeholder="Enter temporary password"
                  value={formData.tempPassword}
                  onChange={(e) => handleInputChange("tempPassword", e.target.value)}
                  className={errors.tempPassword ? "border-red-500 animate-shake" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility("temp")}
                >
                  {showPasswords.temp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {errors.tempPassword && <p className="text-red-500 text-sm animate-fade-in">{errors.tempPassword}</p>}
            </div>

            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  placeholder="Create a secure password (min 8 characters)"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  className={errors.newPassword ? "border-red-500 animate-shake" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility("new")}
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {errors.newPassword && <p className="text-red-500 text-sm animate-fade-in">{errors.newPassword}</p>}
            </div>

            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={errors.confirmPassword ? "border-red-500 animate-shake" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility("confirm")}
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm animate-fade-in">{errors.confirmPassword}</p>
              )}
            </div>

            {errors.submit && (
              <div
                className="bg-red-50 border border-red-200 rounded-lg p-3 animate-fade-in-up"
                style={{ animationDelay: "700ms" }}
              >
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: "800ms" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Activating Account...
                </>
              ) : (
                "Activate Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center animate-fade-in-up" style={{ animationDelay: "900ms" }}>
            <p className="text-sm text-gray-600">
              Already have an active account?{" "}
              <Link href="/admin" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
