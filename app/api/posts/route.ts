import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo purposes
// In production, this would be replaced with a real database
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
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
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
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
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
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
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
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    status: "open",
  },
]

export async function GET() {
  // Sort posts by timestamp (newest first)
  const sortedPosts = posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return NextResponse.json(sortedPosts)
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const location = formData.get("location") as string
    const contact = formData.get("contact") as string
    const photo = formData.get("photo") as File | null

    // Validation
    if (!title || !category || !contact) {
      return NextResponse.json({ message: "Title, category, and contact are required" }, { status: 400 })
    }

    if (description && description.length > 200) {
      return NextResponse.json({ message: "Description must be 200 characters or less" }, { status: 400 })
    }

    // Handle photo upload (in production, you'd upload to cloud storage)
    let photoURL: string | undefined
    if (photo && photo.size > 0) {
      if (photo.size > 5 * 1024 * 1024) {
        return NextResponse.json({ message: "Photo must be less than 5MB" }, { status: 400 })
      }

      // For demo purposes, we'll use a placeholder URL
      // In production, you'd upload to a service like Vercel Blob, Cloudinary, etc.
      photoURL = `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(title)}`
    }

    const newPost = {
      id: Date.now().toString(),
      title,
      description: description || "",
      category,
      location: location || "",
      contact,
      photoURL,
      timestamp: new Date().toISOString(),
      status: "open",
    }

    posts.unshift(newPost) // Add to beginning of array

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
