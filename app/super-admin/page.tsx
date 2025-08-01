"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Building2, Plus, Trash2, Eye, LogOut, Crown, School, MapPin, Clock } from "lucide-react"
import Link from "next/link"
import { CreateOrganizationDialog } from "@/components/create-organization-dialog"
import { CreateAdminDialog } from "@/components/create-admin-dialog"

interface Organization {
  id: string
  name: string
  slug: string
  type: string
  address: string
  createdAt: string
  status: string
  settings: {
    allowPublicPosts: boolean
    requireApproval: boolean
    autoExpireDays: number
  }
}

interface Admin {
  id: string
  email: string
  name: string
  role: string
  organizationId: string
  createdAt: string
  status: string
  permissions: string[]
}

interface SuperAdmin {
  id: string
  email: string
  name: string
  role: string
}

export default function SuperAdminDashboard() {
  const [superAdmin, setSuperAdmin] = useState<SuperAdmin | null>(null)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [pendingAdmins, setPendingAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [createOrgOpen, setCreateOrgOpen] = useState(false)
  const [createAdminOpen, setCreateAdminOpen] = useState(false)

  useEffect(() => {
    if (superAdmin) {
      fetchOrganizations()
      fetchAdmins()
    }
  }, [superAdmin])

  const fetchOrganizations = async () => {
    try {
      const response = await fetch(`/api/organizations?adminId=${superAdmin?.id}`)
      const data = await response.json()
      setOrganizations(data)
    } catch (error) {
      console.error("Error fetching organizations:", error)
    }
  }

  const fetchAdmins = async () => {
    try {
      // Fetch active admins
      const activeResponse = await fetch(`/api/admin/create?requesterId=${superAdmin?.id}&type=active`)
      const activeData = await activeResponse.json()
      setAdmins(activeData)

      // Fetch pending admins
      const pendingResponse = await fetch(`/api/admin/create?requesterId=${superAdmin?.id}&type=pending`)
      const pendingData = await pendingResponse.json()
      setPendingAdmins(pendingData)
    } catch (error) {
      console.error("Error fetching admins:", error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user.role === "super_admin") {
          setSuperAdmin(data.user)
          setLoginForm({ email: "", password: "" })
        } else {
          alert("Super admin access required")
        }
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

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm("Are you sure you want to delete this admin?")) return

    try {
      const response = await fetch(`/api/admins?adminId=${adminId}&requesterId=${superAdmin?.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchAdmins()
      } else {
        const error = await response.json()
        alert(error.message || "Failed to delete admin")
      }
    } catch (error) {
      console.error("Error deleting admin:", error)
      alert("Failed to delete admin")
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getOrganizationName = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId)
    return org ? org.name : "Unknown Organization"
  }

  // Login form
  if (!superAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md animate-fade-in-up hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle className="text-2xl animate-fade-in">Super Admin Login</CardTitle>
            <p className="text-gray-600 animate-fade-in" style={{ animationDelay: "200ms" }}>
              System Administration Portal
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="superadmin@system.com"
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
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <p>
                <strong>Demo Credentials:</strong>
              </p>
              <p>Email: superadmin@system.com</p>
              <p>Password: superadmin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
                <p className="text-gray-600 text-sm">System Administration Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {superAdmin.name}</span>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Site
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => setSuperAdmin(null)}>
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
            { title: "Organizations", value: organizations.length, color: "blue", icon: Building2 },
            { title: "Active Admins", value: admins.length, color: "green", icon: Shield },
            { title: "Pending Admins", value: pendingAdmins.length, color: "orange", icon: Clock },
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
          {pendingAdmins.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Pending Admin Activations
              </h3>
              <div className="space-y-3">
                {pendingAdmins.map((admin) => (
                  <Card key={admin.id} className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{admin.name}</h4>
                          <p className="text-sm text-gray-600">{admin.email}</p>
                          <p className="text-xs text-orange-600">Expires: {formatDate(admin.inviteExpiry)}</p>
                        </div>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          PENDING
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {/* Organizations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Organizations</h2>
              <Button
                onClick={() => setCreateOrgOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Organization
              </Button>
            </div>

            <div className="space-y-4">
              {organizations.map((org, index) => (
                <Card
                  key={org.id}
                  className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          {org.type === "university" ? (
                            <Building2 className="w-5 h-5 text-blue-600" />
                          ) : (
                            <School className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{org.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{org.type}</p>
                        </div>
                      </div>
                      <Badge
                        variant={org.status === "active" ? "default" : "secondary"}
                        className={org.status === "active" ? "bg-green-100 text-green-800" : ""}
                      >
                        {org.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{org.address}</span>
                    </div>
                    <div className="text-xs text-gray-500">Created: {formatDate(org.createdAt)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Admins */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Organization Admins</h2>
              <Button
                onClick={() => setCreateAdminOpen(true)}
                className="bg-green-600 hover:bg-green-700 hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Admin
              </Button>
            </div>

            <div className="space-y-4">
              {admins.map((admin, index) => (
                <Card
                  key={admin.id}
                  className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{admin.name}</h3>
                          <p className="text-sm text-gray-600">{admin.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={admin.status === "active" ? "default" : "secondary"}
                          className={
                            admin.status === "active" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                          }
                        >
                          {admin.status.toUpperCase()}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{getOrganizationName(admin.organizationId)}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {admin.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">Created: {formatDate(admin.createdAt)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <CreateOrganizationDialog
        open={createOrgOpen}
        onOpenChange={setCreateOrgOpen}
        onSuccess={() => {
          fetchOrganizations()
          setCreateOrgOpen(false)
        }}
        superAdminId={superAdmin.id}
      />

      <CreateAdminDialog
        open={createAdminOpen}
        onOpenChange={setCreateAdminOpen}
        onSuccess={() => {
          fetchAdmins()
          setCreateAdminOpen(false)
        }}
        organizations={organizations}
        superAdminId={superAdmin.id}
      />
    </div>
  )
}
