"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle, XCircle, Clock, User, MapPin, Phone, Calendar, LogOut, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Post {
  id: string
  title: string
  description: string
  category: "lost" | "found"
  location: string
  contact: string
  photoURL?: string
  timestamp: string
  status: "open" | "pending_verification" | "closed"
  proof?: {
    description: string
    submittedBy: string
    timestamp: string
  }
  verification?: {
    status: "approved" | "rejected"
    adminId: string
    timestamp: string
    notes: string
  }
}

interface Admin {
  id: string
  email: string
  name: string
}

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [verificationNotes, setVerificationNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (admin) {
      fetchPosts()
    }
  }, [admin])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/posts")
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      })

      if (response.ok) {
        const data = await response.json()
        setAdmin(data.admin)
        setLoginForm({ email: "", password: "" })
      } else {
        alert("Invalid credentials")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (postId: string, action: "approve" | "reject") => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/verify/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          adminId: admin?.id,
          notes: verificationNotes,
        }),
      })

      if (response.ok) {
        await fetchPosts()
        setSelectedPost(null)
        setVerificationNotes("")
      } else {
        const error = await response.json()
        alert(error.message || "Verification failed")
      }
    } catch (error) {
      console.error("Verification error:", error)
      alert("Verification failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const pendingPosts = posts.filter((post) => post.status === "pending_verification")
  const recentVerifications = posts
    .filter((post) => post.verification)
    .sort((a, b) => new Date(b.verification!.timestamp).getTime() - new Date(a.verification!.timestamp).getTime())
    .slice(0, 5)

  // Login form
  if (!admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md animate-fade-in-up hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl animate-fade-in">Admin Login</CardTitle>
            <p className="text-gray-600 animate-fade-in" style={{ animationDelay: "200ms" }}>
              Community Connect Administration
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@community.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <p>
                <strong>Demo Credentials:</strong>
              </p>
              <p>Email: admin@community.com</p>
              <p>Password: admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 text-sm">Community Connect Administration</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {admin.name}</span>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Site
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => setAdmin(null)}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { title: "Pending Verification", value: pendingPosts.length, color: "orange", icon: Clock },
            { title: "Total Posts", value: posts.length, color: "blue", icon: Shield },
            {
              title: "Resolved Items",
              value: posts.filter((p) => p.status === "closed").length,
              color: "green",
              icon: CheckCircle,
            },
          ].map((stat, index) => (
            <Card
              key={stat.title}
              className="animate-fade-in-up hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className={`text-3xl font-bold text-${stat.color}-600 animate-count-up`}>{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 text-${stat.color}-600 animate-pulse`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Verifications */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Verifications</h2>
            {pendingPosts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No posts pending verification</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingPosts.map((post, index) => (
                  <Card
                    key={post.id}
                    className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-900">{post.title}</CardTitle>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          PENDING
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {post.photoURL && (
                        <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={post.photoURL || "/placeholder.svg"}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <p className="text-gray-600 text-sm">{post.description}</p>

                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{post.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{post.contact}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(post.timestamp)}</span>
                        </div>
                      </div>

                      {post.proof && (
                        <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-2 text-blue-700">
                            <User className="w-4 h-4" />
                            <span className="font-medium text-sm">Submitted Proof</span>
                          </div>
                          <p className="text-sm text-blue-600">{post.proof.description}</p>
                          <div className="text-xs text-blue-600">
                            By: {post.proof.submittedBy} • {formatDate(post.proof.timestamp)}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedPost(post)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Review & Verify
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Verifications */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Verifications</h2>
            {recentVerifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent verifications</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {recentVerifications.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{post.title}</h3>
                        <Badge
                          variant={post.verification?.status === "approved" ? "default" : "destructive"}
                          className={
                            post.verification?.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {post.verification?.status?.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{post.description}</p>
                      {post.verification?.notes && (
                        <p className="text-xs text-gray-500 italic">"{post.verification.notes}"</p>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        {formatDate(post.verification?.timestamp || "")} • {post.verification?.adminId}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Verification Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Verify Post Resolution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedPost.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{selectedPost.description}</p>
                <div className="text-xs text-gray-500">
                  {selectedPost.category.toUpperCase()} • {selectedPost.location} • {formatDate(selectedPost.timestamp)}
                </div>
              </div>

              {selectedPost.proof && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Submitted Proof</h4>
                  <p className="text-blue-700 text-sm mb-2">{selectedPost.proof.description}</p>
                  <div className="text-xs text-blue-600">
                    Submitted by: {selectedPost.proof.submittedBy} • {formatDate(selectedPost.proof.timestamp)}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Verification Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this verification..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="min-h-20"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPost(null)
                    setVerificationNotes("")
                  }}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleVerification(selectedPost.id, "reject")}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Processing..." : "Reject"}
                </Button>
                <Button
                  onClick={() => handleVerification(selectedPost.id, "approve")}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Processing..." : "Approve"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
