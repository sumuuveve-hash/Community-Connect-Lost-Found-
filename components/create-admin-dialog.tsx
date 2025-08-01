"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Shield, Mail, Copy } from "lucide-react"

interface CreateAdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  organizations: any[]
  superAdminId: string
}

export function CreateAdminDialog({
  open,
  onOpenChange,
  onSuccess,
  organizations,
  superAdminId,
}: CreateAdminDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organizationId: "",
    permissions: [] as string[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdAdmin, setCreatedAdmin] = useState<any>(null)

  const availablePermissions = [
    { id: "verify_posts", label: "Verify Posts" },
    { id: "manage_users", label: "Manage Users" },
    { id: "view_analytics", label: "View Analytics" },
    { id: "manage_settings", label: "Manage Settings" },
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked ? [...prev.permissions, permission] : prev.permissions.filter((p) => p !== permission),
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }
    if (!formData.organizationId) {
      newErrors.organizationId = "Organization is required"
    }
    if (formData.permissions.length === 0) {
      newErrors.permissions = "At least one permission is required"
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
      const response = await fetch("/api/admin/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          requesterId: superAdminId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCreatedAdmin(data.admin)
        // Don't close dialog yet, show invite details first
      } else {
        const error = await response.json()
        setErrors({ submit: error.message || "Failed to create admin" })
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyInviteCode = () => {
    if (createdAdmin?.inviteCode) {
      navigator.clipboard.writeText(createdAdmin.inviteCode)
      alert("Invite code copied to clipboard!")
    }
  }

  const handleClose = () => {
    if (createdAdmin) {
      onSuccess()
    }
    setFormData({ name: "", email: "", organizationId: "", permissions: [] })
    setErrors({})
    setCreatedAdmin(null)
    onOpenChange(false)
  }

  // Show success screen with invite code
  if (createdAdmin) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg animate-fade-in-up">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Shield className="w-5 h-5" />
              Admin Created Successfully!
            </DialogTitle>
            <DialogDescription>
              The admin account has been created. Share the activation details below with the new admin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-green-800 font-medium">Invite Code</Label>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(createdAdmin.inviteCode)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="bg-white border rounded p-3 font-mono text-lg text-center tracking-wider">
                {createdAdmin.inviteCode}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-blue-800 font-medium">Temporary Password</Label>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(createdAdmin.tempPassword)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="bg-white border rounded p-3 font-mono text-center">{createdAdmin.tempPassword}</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-amber-600" />
                <span className="text-amber-800 font-medium">Activation Instructions</span>
              </div>
              <div className="text-sm text-amber-700 space-y-1">
                <p>
                  <strong>1.</strong> Send the invite code and temporary password to: {createdAdmin.email}
                </p>
                <p>
                  <strong>2.</strong> Direct them to: <code className="bg-white px-1 rounded">/admin/activate</code>
                </p>
                <p>
                  <strong>3.</strong> Expires: {new Date(createdAdmin.inviteExpiry).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md animate-fade-in-up">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 animate-fade-in">
            <Shield className="w-5 h-5 text-green-600" />
            Create Admin
          </DialogTitle>
          <DialogDescription className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            Add a new admin to manage an organization
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="John Smith"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@organization.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
            <Label htmlFor="organization">Organization *</Label>
            <Select
              value={formData.organizationId}
              onValueChange={(value) => handleInputChange("organizationId", value)}
            >
              <SelectTrigger className={errors.organizationId ? "border-red-500" : ""}>
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.organizationId && <p className="text-red-500 text-sm">{errors.organizationId}</p>}
          </div>

          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
            <Label>Permissions *</Label>
            <div className="space-y-2">
              {availablePermissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission.id}
                    checked={formData.permissions.includes(permission.id)}
                    onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                  />
                  <Label htmlFor={permission.id} className="text-sm">
                    {permission.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.permissions && <p className="text-red-500 text-sm">{errors.permissions}</p>}
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-fade-in">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          <DialogFooter className="gap-2 animate-fade-in-up" style={{ animationDelay: "700ms" }}>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? "Creating..." : "Create Admin"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Add the copy function
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  alert("Copied to clipboard!")
}
