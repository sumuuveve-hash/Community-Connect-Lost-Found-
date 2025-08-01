"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Check, AlertCircle } from "lucide-react"

interface ClosePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (proof: { description: string; submittedBy: string }) => Promise<void>
  postTitle: string
  isSubmitting?: boolean
}

export function ClosePostDialog({
  open,
  onOpenChange,
  onConfirm,
  postTitle,
  isSubmitting = false,
}: ClosePostDialogProps) {
  const [formData, setFormData] = useState({
    description: "",
    submittedBy: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.description.trim()) {
      newErrors.description = "Proof description is required"
    }
    if (formData.description.length < 10) {
      newErrors.description = "Please provide more detailed proof (at least 10 characters)"
    }
    if (!formData.submittedBy.trim()) {
      newErrors.submittedBy = "Contact information is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onConfirm(formData)
      // Reset form on success
      setFormData({ description: "", submittedBy: "" })
      setErrors({})
    } catch (error) {
      setErrors({ submit: "Failed to close post. Please try again." })
    }
  }

  const handleClose = () => {
    setFormData({ description: "", submittedBy: "" })
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md animate-fade-in-up">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 animate-fade-in">
            <Check className="w-5 h-5 text-green-600 animate-bounce" />
            Mark as Found/Resolved
          </DialogTitle>
          <DialogDescription className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            Please provide proof that this item has been found/resolved: <strong>{postTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0 animate-pulse" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Verification Required</p>
              <p>Please provide details about how the item was found/resolved to help prevent false closures.</p>
            </div>
          </div>

          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <Label htmlFor="description">Proof Description *</Label>
            <Textarea
              id="description"
              placeholder="e.g., Found the item and contacted the owner. They confirmed it matches their description and provided additional details that weren't in the post..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`min-h-24 transition-all duration-200 focus:scale-105 ${errors.description ? "border-red-500 animate-shake" : ""}`}
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{errors.description && <span className="text-red-500">{errors.description}</span>}</span>
              <span>{formData.description.length}/500</span>
            </div>
          </div>

          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
            <Label htmlFor="submittedBy">Your Contact Information *</Label>
            <Input
              id="submittedBy"
              placeholder="e.g., your.email@example.com or (555) 123-4567"
              value={formData.submittedBy}
              onChange={(e) => handleInputChange("submittedBy", e.target.value)}
              className={errors.submittedBy ? "border-red-500 animate-shake" : ""}
            />
            {errors.submittedBy && <p className="text-red-500 text-sm">{errors.submittedBy}</p>}
          </div>

          {errors.submit && (
            <div
              className="bg-red-50 border border-red-200 rounded-lg p-3 animate-fade-in-up"
              style={{ animationDelay: "600ms" }}
            >
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          <DialogFooter className="gap-2 animate-fade-in-up" style={{ animationDelay: "700ms" }}>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="hover:scale-105 transition-transform duration-200 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 hover:scale-105 transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Submitting...
                </>
              ) : (
                "Confirm & Close Post"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
