import { type NextRequest, NextResponse } from "next/server"

// Import from other files (in production, this would be a database)
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
const credentials: any = {
  "superadmin@system.com": "SuperAdmin2024!",
}

export async function POST(request: NextRequest) {
  try {
    const { inviteCode, tempPassword, newPassword, confirmPassword } = await request.json()

    // Validate input
    if (!inviteCode || !tempPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ message: "Passwords do not match" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Find pending admin
    const pendingAdminIndex = pendingAdmins.findIndex(
      (admin) =>
        admin.inviteCode === inviteCode && admin.tempPassword === tempPassword && admin.status === "pending_activation",
    )

    if (pendingAdminIndex === -1) {
      return NextResponse.json({ message: "Invalid invite code or temporary password" }, { status: 400 })
    }

    const pendingAdmin = pendingAdmins[pendingAdminIndex]

    // Check if invite has expired
    if (new Date() > new Date(pendingAdmin.inviteExpiry)) {
      return NextResponse.json({ message: "Invite code has expired" }, { status: 400 })
    }

    // Activate admin
    const activatedAdmin = {
      ...pendingAdmin,
      id: pendingAdmin.email, // Use email as final ID
      status: "active",
      activatedAt: new Date().toISOString(),
      // Remove sensitive activation data
      inviteCode: undefined,
      tempPassword: undefined,
      inviteExpiry: undefined,
      activationRequired: undefined,
    }

    // Move from pending to active
    admins.push(activatedAdmin)
    pendingAdmins.splice(pendingAdminIndex, 1)

    // Set new password
    credentials[activatedAdmin.email] = newPassword

    return NextResponse.json({
      success: true,
      admin: {
        id: activatedAdmin.id,
        email: activatedAdmin.email,
        name: activatedAdmin.name,
        role: activatedAdmin.role,
        organizationId: activatedAdmin.organizationId,
        status: activatedAdmin.status,
      },
      message: "Admin account activated successfully",
    })
  } catch (error) {
    console.error("Error activating admin:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
