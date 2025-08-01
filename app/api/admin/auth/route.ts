import { type NextRequest, NextResponse } from "next/server"

// Simple admin credentials (in production, use proper authentication)
const ADMIN_CREDENTIALS = {
  email: "admin@community.com",
  password: "admin123", // In production, use hashed passwords
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      return NextResponse.json({
        success: true,
        admin: {
          id: "admin@community.com",
          email: "admin@community.com",
          name: "Community Admin",
        },
      })
    }

    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("Error authenticating admin:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
