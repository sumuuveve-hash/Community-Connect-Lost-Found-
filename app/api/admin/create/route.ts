import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo purposes
const admins: any[] = [
  {
    id: "superadmin@system.com",
    email: "superadmin@system.com",
    name: "System Administrator",
    role: "super_admin",
    organizationId: null,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    permissions: ["all"],
    isBuiltIn: true,
  },
]

const pendingAdmins: any[] = []

export async function POST(request: NextRequest) {
  try {
    const { email, name, organizationId, permissions, requesterId } = await request.json()

    // Verify requester is super admin
    const requester = admins.find((admin) => admin.id === requesterId && admin.role === "super_admin")
    if (!requester) {
      return NextResponse.json({ message: "Unauthorized. Super admin access required." }, { status: 401 })
    }

    // Validate input
    if (!email || !name || !organizationId) {
      return NextResponse.json({ message: "Email, name, and organization are required" }, { status: 400 })
    }

    // Check if admin already exists
    if (admins.find((admin) => admin.email === email) || pendingAdmins.find((admin) => admin.email === email)) {
      return NextResponse.json({ message: "Admin with this email already exists" }, { status: 400 })
    }

    // Generate secure invite code and temporary password
    const inviteCode = generateSecureInviteCode()
    const tempPassword = generateTempPassword()

    const newAdmin = {
      id: `pending_${Date.now()}`,
      email,
      name,
      role: "admin",
      organizationId,
      createdAt: new Date().toISOString(),
      status: "pending_activation",
      permissions: permissions || ["verify_posts", "manage_users", "view_analytics"],
      inviteCode,
      tempPassword,
      inviteExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      createdBy: requesterId,
      activationRequired: true,
    }

    pendingAdmins.push(newAdmin)

    // In production, send email with invite code and temp password
    console.log(`
      New Admin Invitation:
      Email: ${email}
      Invite Code: ${inviteCode}
      Temporary Password: ${tempPassword}
      Expires: ${new Date(newAdmin.inviteExpiry).toLocaleDateString()}
    `)

    return NextResponse.json({
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        organizationId: newAdmin.organizationId,
        status: newAdmin.status,
        inviteCode: newAdmin.inviteCode,
        tempPassword: newAdmin.tempPassword,
        inviteExpiry: newAdmin.inviteExpiry,
      },
    })
  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const requesterId = searchParams.get("requesterId")
  const type = searchParams.get("type") // 'active' or 'pending'

  // Verify requester is super admin
  const requester = admins.find((admin) => admin.id === requesterId && admin.role === "super_admin")
  if (!requester) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  if (type === "pending") {
    return NextResponse.json(pendingAdmins)
  }

  // Return active admins (excluding super admin)
  return NextResponse.json(admins.filter((admin) => admin.role !== "super_admin"))
}

function generateSecureInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%"
  let result = ""
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
