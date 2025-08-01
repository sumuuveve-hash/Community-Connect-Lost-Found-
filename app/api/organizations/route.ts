import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo purposes
const organizations: any[] = [
  {
    id: "org_1",
    name: "Springfield University",
    slug: "springfield-university",
    type: "university",
    address: "123 University Ave, Springfield",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    settings: {
      allowPublicPosts: true,
      requireApproval: true,
      autoExpireDays: 30,
    },
  },
  {
    id: "org_2",
    name: "Lincoln High School",
    slug: "lincoln-high",
    type: "school",
    address: "456 School St, Lincoln",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    settings: {
      allowPublicPosts: false,
      requireApproval: true,
      autoExpireDays: 14,
    },
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const adminId = searchParams.get("adminId")

  // Check if user is super admin
  if (adminId === "superadmin@system.com") {
    return NextResponse.json(organizations)
  }

  // For regular admins, return only their organization
  const adminOrg = organizations.find((org) => org.admins?.some((admin: any) => admin.id === adminId))

  if (adminOrg) {
    return NextResponse.json([adminOrg])
  }

  return NextResponse.json([])
}

export async function POST(request: NextRequest) {
  try {
    const { name, slug, type, address, adminId } = await request.json()

    // Only super admin can create organizations
    if (adminId !== "superadmin@system.com") {
      return NextResponse.json({ message: "Unauthorized. Super admin access required." }, { status: 401 })
    }

    // Check if slug already exists
    if (organizations.find((org) => org.slug === slug)) {
      return NextResponse.json({ message: "Organization slug already exists" }, { status: 400 })
    }

    const newOrg = {
      id: `org_${Date.now()}`,
      name,
      slug,
      type,
      address,
      createdAt: new Date().toISOString(),
      status: "active",
      settings: {
        allowPublicPosts: true,
        requireApproval: true,
        autoExpireDays: 30,
      },
      admins: [],
      users: [],
    }

    organizations.push(newOrg)
    return NextResponse.json(newOrg, { status: 201 })
  } catch (error) {
    console.error("Error creating organization:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
