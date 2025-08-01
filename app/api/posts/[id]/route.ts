import { type NextRequest, NextResponse } from "next/server"

// Import the posts array from the main route (in a real app, this would be a database)
// For demo purposes, we'll recreate the posts array here
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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { status, proof } = await request.json()

    // Find the post
    const postIndex = posts.findIndex((post) => post.id === id)

    if (postIndex === -1) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    // Validate status
    if (!["open", "pending_verification", "closed"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status. Must be 'open', 'pending_verification', or 'closed'" },
        { status: 400 },
      )
    }

    // If setting to pending verification, require proof
    if (status === "pending_verification") {
      if (!proof || !proof.description || !proof.submittedBy) {
        return NextResponse.json(
          {
            message: "Proof is required when submitting for verification. Must include description and submittedBy.",
          },
          { status: 400 },
        )
      }

      // Add timestamp to proof
      proof.timestamp = new Date().toISOString()
    }

    // Update the post status
    posts[postIndex].status = status
    posts[postIndex].updatedAt = new Date().toISOString()

    if (status === "pending_verification" && proof) {
      posts[postIndex].proof = proof
    }

    return NextResponse.json(posts[postIndex])
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
