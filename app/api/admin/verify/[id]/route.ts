import { type NextRequest, NextResponse } from "next/server"

// Import the posts array (in a real app, this would be a database)
const posts: any[] = [
  {
    id: "1",
    title: "Lost iPhone 13 Pro",
    description:
      "Black iPhone 13 Pro with a blue case. Lost near the library on campus. Has a small crack on the screen.",
    category: "lost",
    location: "University Library, 2nd Floor",
    contact: "john.doe@email.com",
    photoURL: "/placeholder.svg?height=300&width=400",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "open",
  },
  {
    id: "2",
    title: "Found Set of Keys",
    description:
      "Found a set of keys with a Toyota keychain and several house keys. Found in the parking lot near Building A.",
    category: "found",
    location: "Parking Lot, Building A",
    contact: "(555) 123-4567",
    photoURL: "/placeholder.svg?height=300&width=400",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: "pending_verification",
    proof: {
      description:
        "I found these keys and contacted the owner. They confirmed the Toyota keychain and described the other keys perfectly.",
      submittedBy: "finder@email.com",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    id: "3",
    title: "Lost Wallet",
    description:
      "Brown leather wallet with ID and credit cards. Lost somewhere between the cafeteria and the main entrance.",
    category: "lost",
    location: "Between Cafeteria and Main Entrance",
    contact: "sarah.wilson@email.com",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: "closed",
    proof: {
      description: "Found the wallet and verified ID matches the description. Owner confirmed receipt.",
      submittedBy: "finder@email.com",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    verification: {
      status: "approved",
      adminId: "admin@community.com",
      timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
      notes: "Proof verified. Legitimate resolution.",
    },
  },
  {
    id: "4",
    title: "Found Airpods",
    description: "White Apple AirPods found in the study room. They were left on table 5.",
    category: "found",
    location: "Study Room, Table 5",
    contact: "mike.chen@email.com",
    photoURL: "/placeholder.svg?height=300&width=400",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: "open",
  },
]

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { action, adminId, notes } = await request.json()

    // Simple admin authentication check (in production, use proper auth)
    if (!adminId || !adminId.includes("admin")) {
      return NextResponse.json({ message: "Unauthorized. Admin access required." }, { status: 401 })
    }

    // Find the post
    const postIndex = posts.findIndex((post) => post.id === id)

    if (postIndex === -1) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    const post = posts[postIndex]

    // Check if post is pending verification
    if (post.status !== "pending_verification") {
      return NextResponse.json({ message: "Post is not pending verification" }, { status: 400 })
    }

    // Validate action
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ message: "Invalid action. Must be 'approve' or 'reject'" }, { status: 400 })
    }

    // Create verification record
    const verification = {
      status: action === "approve" ? "approved" : "rejected",
      adminId,
      timestamp: new Date().toISOString(),
      notes: notes || "",
    }

    // Update post based on action
    if (action === "approve") {
      posts[postIndex].status = "closed"
    } else {
      posts[postIndex].status = "open"
      // Remove proof if rejected
      delete posts[postIndex].proof
    }

    posts[postIndex].verification = verification
    posts[postIndex].updatedAt = new Date().toISOString()

    return NextResponse.json(posts[postIndex])
  } catch (error) {
    console.error("Error verifying post:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
