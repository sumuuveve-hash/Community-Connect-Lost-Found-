import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo purposes
const invites: any[] = [
  {
    id: "inv_1",
    code: "SPRING2024USER",
    email: "student1@springfield.edu",
    organizationId: "org_1",
    invitedBy: "admin1@springfield.edu",
    type: "user",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    usedAt: null,
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const organizationId = searchParams.get("organizationId")
  const adminId = searchParams.get("adminId")

  if (organizationId && adminId) {
    return NextResponse.json(invites.filter((invite) => invite.organizationId === organizationId))
  }

  return NextResponse.json([])
}

export async function POST(request: NextRequest) {
  try {
    const { email, organizationId, invitedBy, type = "user" } = await request.json()

    // Generate unique invite code
    const code = generateUniqueInviteCode()

    const newInvite = {
      id: `inv_${Date.now()}`,
      code,
      email,
      organizationId,
      invitedBy,
      type,
      status: "pending",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      usedAt: null,
    }

    invites.push(newInvite)

    // In a real app, you would send an email here
    console.log(`Invite sent to ${email} with code: ${code}`)

    return NextResponse.json(newInvite, { status: 201 })
  } catch (error) {
    console.error("Error creating invite:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

function generateUniqueInviteCode(): string {
  let code
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase()
  } while (invites.some((invite) => invite.code === code && invite.status === "pending"))
  return code
}
