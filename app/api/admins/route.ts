import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo purposes
const admins: any[] = [
  {
    id: "superadmin@system.com",
    email: "superadmin@system.com",
    name: "System Administrator",
    role: "super_admin",
    organizationId: null,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    permissions: ["all"],
  },
  {
    id: "admin1@springfield.edu",
    email: "admin1@springfield.edu",
    name: "John Smith",
    role: "admin",
    organizationId: "org_1",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    permissions: ["verify_posts", "manage_users", "view_analytics"],
  },
  {
    id: "admin2@lincoln.edu",
    email: "admin2@lincoln.edu",
    name: "Sarah Johnson",
    role: "admin",
    organizationId: "org_2",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    permissions: ["verify_posts", "manage_users"],
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const requesterId = searchParams.get("requesterId")
  const organizationId = searchParams.get("organizationId")

  // Check if requester is super admin
  const requester = admins.find((admin) => admin.id === requesterId)
  if (!requester) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  if (requester.role === "super_admin") {
    // Super admin can see all admins
    return NextResponse.json(admins.filter((admin) => admin.role !== "super_admin"))
  } else if (requester.role === "admin" && organizationId) {
    // Regular admin can only see admins from their organization
    return NextResponse.json(admins.filter((admin) => admin.organizationId === organizationId))
  }

  return NextResponse.json([])
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, organizationId, requesterId, permissions } = await request.json()

    // Check if requester is authorized
    const requester = admins.find((admin) => admin.id === requesterId)
    if (!requester || requester.role !== "super_admin") {
      return NextResponse.json({ message: "Unauthorized. Super admin access required." }, { status: 401 })
    }

    // Check if admin already exists
    if (admins.find((admin) => admin.email === email)) {
      return NextResponse.json({ message: "Admin with this email already exists" }, { status: 400 })
    }

    const newAdmin = {
      id: email,
      email,
      name,
      role: "admin",
      organizationId,
      createdAt: new Date().toISOString(),
      status: "pending",
      permissions: permissions || ["verify_posts", "manage_users"],
      inviteCode: generateInviteCode(),
      inviteExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    }

    admins.push(newAdmin)
    return NextResponse.json(newAdmin, { status: 201 })
  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get("adminId")
    const requesterId = searchParams.get("requesterId")

    // Check if requester is super admin
    const requester = admins.find((admin) => admin.id === requesterId)
    if (!requester || requester.role !== "super_admin") {
      return NextResponse.json({ message: "Unauthorized. Super admin access required." }, { status: 401 })
    }

    const adminIndex = admins.findIndex((admin) => admin.id === adminId)
    if (adminIndex === -1) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 })
    }

    // Cannot delete super admin
    if (admins[adminIndex].role === "super_admin") {
      return NextResponse.json({ message: "Cannot delete super admin" }, { status: 400 })
    }

    admins.splice(adminIndex, 1)
    return NextResponse.json({ message: "Admin deleted successfully" })
  } catch (error) {
    console.error("Error deleting admin:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
