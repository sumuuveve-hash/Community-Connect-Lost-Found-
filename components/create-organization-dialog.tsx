"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Building2 } from "lucide-react"

interface CreateOrganizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  superAdminId: string
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
  onSuccess,
  superAdminId,
}: CreateOrganizationDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "",
    address: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }

    // Auto-generate slug from name
    if (field === "name") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Organization name is required"
    }
    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required"
    }
    if (!formData.type) {
      newErrors.type = "Organization type is required"
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
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
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          adminId: superAdminId,
        }),
      })

      if (response.ok) {
        onSuccess()
        setFormData({ name: "", slug: "", type: "", address: "" })
        setErrors({})
      } else {
        const error = await response.json()
        setErrors({ submit: error.message || "Failed to create organization" })
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({ name: "", slug: "", type: "", address: "" })
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md animate-fade-in-up">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 animate-fade-in">
            <Building2 className="w-5 h-5 text-blue-600" />
            Create Organization
          </DialogTitle>
          <DialogDescription className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            Add a new organization to the system
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <Label htmlFor="name">Organization Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Springfield University"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              placeholder="springfield-university"
              value={formData.slug}
              onChange={(e) => handleInputChange("slug", e.target.value)}
              className={errors.slug ? "border-red-500" : ""}
            />
            {errors.slug && <p className="text-red-500 text-sm">{errors.slug}</p>}
          </div>

          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
            <Label htmlFor="type">Organization Type *</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="university">University</SelectItem>
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="college">College</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="community">Community</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
          </div>

          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              placeholder="123 University Ave, Springfield"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
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
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Creating..." : "Create Organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
