"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function CreatePostPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    contact: "",
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setErrors((prev) => ({ ...prev, photo: "Photo must be less than 5MB" }))
        return
      }
      setPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setErrors((prev) => ({ ...prev, photo: "" }))
    }
  }

  const removePhoto = () => {
    setPhoto(null)
    setPhotoPreview(null)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }
    if (!formData.category) {
      newErrors.category = "Category is required"
    }
    if (!formData.contact.trim()) {
      newErrors.contact = "Contact information is required"
    }
    if (formData.description.length > 200) {
      newErrors.description = "Description must be 200 characters or less"
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
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })
      if (photo) {
        submitData.append("photo", photo)
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        body: submitData,
      })

      if (response.ok) {
        router.push("/")
      } else {
        const error = await response.json()
        setErrors({ submit: error.message || "Failed to create post" })
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b animate-slide-down">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="hover:scale-105 transition-all duration-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="animate-fade-in-left">
              <h1 className="text-2xl font-bold text-gray-900">Post Item</h1>
              <p className="text-gray-600 text-sm">Help your community find lost items</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="animate-fade-in-up hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="animate-fade-in">Create New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Add staggered animations to form fields */}
              <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Lost iPhone 13 Pro"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`transition-all duration-200 focus:scale-105 ${errors.title ? "border-red-500 animate-shake" : ""}`}
                />
                {errors.title && <p className="text-red-500 text-sm animate-fade-in">{errors.title}</p>}
              </div>

              {/* Category */}
              <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lost">Lost Item</SelectItem>
                    <SelectItem value="found">Found Item</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-sm animate-fade-in">{errors.category}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                <Label htmlFor="description">Description ({formData.description.length}/200)</Label>
                <Textarea
                  id="description"
                  placeholder="Provide details about the item, where it was lost/found, etc."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className={`min-h-24 ${errors.description ? "border-red-500 animate-shake" : ""}`}
                  maxLength={200}
                />
                {errors.description && <p className="text-red-500 text-sm animate-fade-in">{errors.description}</p>}
              </div>

              {/* Location */}
              <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Library 2nd floor, Main Street near cafe"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>

              {/* Contact */}
              <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
                <Label htmlFor="contact">Contact Information *</Label>
                <Input
                  id="contact"
                  placeholder="e.g., john@email.com or (555) 123-4567"
                  value={formData.contact}
                  onChange={(e) => handleInputChange("contact", e.target.value)}
                  className={errors.contact ? "border-red-500 animate-shake" : ""}
                />
                {errors.contact && <p className="text-red-500 text-sm animate-fade-in">{errors.contact}</p>}
              </div>

              {/* Photo Upload */}
              <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
                <Label htmlFor="photo">Photo (Optional, max 5MB)</Label>
                {!photoPreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-all duration-300 hover:bg-gray-50 group">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    <input
                      type="file"
                      id="photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="relative animate-fade-in">
                    <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100 hover:scale-105 transition-transform duration-300">
                      <Image src={photoPreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removePhoto}
                      className="absolute top-2 right-2 hover:scale-110 transition-transform duration-200"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {errors.photo && <p className="text-red-500 text-sm animate-fade-in">{errors.photo}</p>}
              </div>

              {/* Submit Button */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-fade-in">
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              )}

              <div className="flex gap-4 animate-fade-in-up" style={{ animationDelay: "700ms" }}>
                <Link href="/" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent hover:scale-105 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Post Item"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
