import { type NextRequest, NextResponse } from "next/server"

// Built-in system users
const users: any[] = [
  {
    id: "superadmin@system.com",
    email: "superadmin@system.com",
    name: "System Administrator",
    role: "super_admin",
    organizationId: null,
    status: "active",
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
    isBuiltIn: true,
  },
]

// Built-in credentials - super admin is pre-created in the system
const credentials: any = {
  "superadmin@system.com": "SuperAdmin2024!",
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, inviteCode } = await request.json()

    // If invite code is provided, handle invite-based registration
    if (inviteCode) {
      return handleInviteLogin(email, password, inviteCode)
    }

    // Regular login
    if (credentials[email] && credentials[email] === password) {
      const user = users.find((u) => u.email === email)
      if (user && user.status === "active") {
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organizationId,
          },
        })
      }
    }

    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("Error authenticating user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

async function handleInviteLogin(email: string, password: string, inviteCode: string) {
  // In a real app, you would validate the invite code from the database
  // For demo purposes, we'll simulate this
  const validInvite = {
    code: inviteCode,
    email: email,
    organizationId: "org_1",
    status: "pending",
  }

  if (validInvite && validInvite.status === "pending") {
    // Create new user account
    const newUser = {
      id: email,
      email,
      name: email.split("@")[0], // Use email prefix as default name
      role: "user",
      organizationId: validInvite.organizationId,
      status: "active",
      joinedAt: new Date().toISOString(),
    }

    users.push(newUser)
    credentials[email] = password

    // Mark invite as used
    validInvite.status = "used"

    return NextResponse.json({
      success: true,
      user: newUser,
      message: "Account created successfully",
    })
  }

  return NextResponse.json({ message: "Invalid or expired invite code" }, { status: 400 })
}
