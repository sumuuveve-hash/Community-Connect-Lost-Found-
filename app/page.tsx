"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, MapPin, Phone, Calendar, Check, ChevronsUpDown, Shield, User, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ClosePostDialog } from "@/components/close-post-dialog"

interface Post {
  id: string
  title: string
  description: string
  category: "lost" | "found"
  location: string
  contact: string
  photoURL?: string
  timestamp: string
  status: "open" | "pending_verification" | "closed"
  proof?: {
    description: string
    submittedBy: string
    timestamp: string
  }
  verification?: {
    status: "approved" | "rejected"
    adminId: string
    timestamp: string
    notes: string
  }
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("")
  const [locationOpen, setLocationOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts")
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || post.category === categoryFilter
    const matchesLocation = locationFilter === "" || post.location.toLowerCase().includes(locationFilter.toLowerCase())
    const matchesStatus = statusFilter === "all" || post.status === statusFilter
    return matchesSearch && matchesCategory && matchesLocation && matchesStatus
  })

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getUniqueLocations = () => {
    const locations = posts.map((post) => post.location).filter((location) => location && location.trim() !== "")
    return [...new Set(locations)].sort()
  }

  const handleClosePost = (post: Post) => {
    setSelectedPost(post)
    setCloseDialogOpen(true)
  }

  const confirmClosePost = async (proof: { description: string; submittedBy: string }) => {
    if (!selectedPost) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${selectedPost.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "pending_verification",
          proof,
        }),
      })

      if (response.ok) {
        await fetchPosts()
        setCloseDialogOpen(false)
        setSelectedPost(null)
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to submit for verification")
      }
    } catch (error) {
      console.error("Error submitting post for verification:", error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto mb-4"></div>
            <div className="animate-ping absolute top-0 left-1/2 transform -translate-x-1/2 rounded-full h-16 w-16 border-4 border-blue-400 opacity-20"></div>
          </div>
          <p className="text-gray-600 animate-pulse">Loading posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="animate-fade-in-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-300">
                Community Connect
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">Lost & Found Hub</p>
            </div>
            <div className="flex gap-2 animate-fade-in-right">
              <Link href="/admin/activate">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent hover:scale-105 transition-all duration-200 hover:shadow-md"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Activate Admin
                </Button>
              </Link>
              <Link href="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent hover:scale-105 transition-all duration-200 hover:shadow-md"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
              <Link href="/create">
                <Button className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200 hover:shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Item
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 animate-fade-in-up hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors duration-200" />
              <Input
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="lost">Lost Items</SelectItem>
                <SelectItem value="found">Found Items</SelectItem>
              </SelectContent>
            </Select>
            <Popover open={locationOpen} onOpenChange={setLocationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={locationOpen}
                  className="w-full sm:w-48 justify-between bg-transparent"
                >
                  {locationFilter
                    ? locationFilter.length > 20
                      ? `${locationFilter.substring(0, 20)}...`
                      : locationFilter
                    : "Filter by location..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full sm:w-48 p-0">
                <Command>
                  <CommandInput
                    placeholder="Type or search location..."
                    value={locationFilter}
                    onValueChange={setLocationFilter}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {locationFilter ? (
                        <div className="p-2">
                          <p className="text-sm text-muted-foreground mb-2">No matching locations found.</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setLocationOpen(false)
                            }}
                            className="w-full text-left justify-start"
                          >
                            {'Use "' + locationFilter + '"'}
                          </Button>
                        </div>
                      ) : (
                        "No locations found."
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value=""
                        onSelect={() => {
                          setLocationFilter("")
                          setLocationOpen(false)
                        }}
                      >
                        <Check className={`mr-2 h-4 w-4 ${locationFilter === "" ? "opacity-100" : "opacity-0"}`} />
                        All Locations
                      </CommandItem>
                      {getUniqueLocations().map((location) => (
                        <CommandItem
                          key={location}
                          value={location}
                          onSelect={(currentValue) => {
                            setLocationFilter(currentValue === locationFilter ? "" : currentValue)
                            setLocationOpen(false)
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${locationFilter === location ? "opacity-100" : "opacity-0"}`}
                          />
                          {location}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending_verification">Pending Verification</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-6">
              {posts.length === 0
                ? "Be the first to post a lost or found item!"
                : "Try adjusting your search or filter criteria."}
            </p>
            <Link href="/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Post First Item
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <Card
                key={post.id}
                className={`hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up ${
                  post.status === "closed" ? "opacity-75 bg-gray-50" : ""
                } ${post.status === "pending_verification" ? "border-orange-200 bg-orange-50" : ""}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">{post.title}</CardTitle>
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant={post.category === "lost" ? "destructive" : "default"}
                        className={post.category === "lost" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
                      >
                        {post.category.toUpperCase()}
                      </Badge>
                      {post.status === "closed" && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                          RESOLVED
                        </Badge>
                      )}
                      {post.status === "pending_verification" && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          PENDING
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {post.photoURL && (
                    <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100">
                      <Image src={post.photoURL || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                    </div>
                  )}

                  <p className="text-gray-600 text-sm line-clamp-3">{post.description}</p>

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{post.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span className="truncate">{post.contact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.timestamp)}</span>
                    </div>
                  </div>

                  {post.status === "pending_verification" && post.proof && (
                    <div className="pt-2 border-t bg-orange-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 text-orange-700">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium text-sm">Awaiting Admin Verification</span>
                      </div>
                      <p className="text-xs text-orange-600 line-clamp-2">{post.proof.description}</p>
                      <div className="flex items-center gap-2 text-xs text-orange-600">
                        <User className="w-3 h-3" />
                        <span>Submitted by: {post.proof.submittedBy}</span>
                      </div>
                      <div className="text-xs text-orange-600">Submitted: {formatDate(post.proof.timestamp)}</div>
                    </div>
                  )}

                  {post.status === "closed" && post.proof && (
                    <div className="pt-2 border-t bg-green-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 text-green-700">
                        <Shield className="w-4 h-4" />
                        <span className="font-medium text-sm">Resolution Verified</span>
                      </div>
                      <p className="text-xs text-green-600 line-clamp-2">{post.proof.description}</p>
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <User className="w-3 h-3" />
                        <span>Verified by: {post.proof.submittedBy}</span>
                      </div>
                      <div className="text-xs text-green-600">Resolved: {formatDate(post.proof.timestamp)}</div>
                      {post.verification && (
                        <div className="text-xs text-green-600">
                          Admin verified: {formatDate(post.verification.timestamp)}
                        </div>
                      )}
                    </div>
                  )}

                  {post.status === "open" && (
                    <div className="pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClosePost(post)}
                        className="w-full text-green-600 border-green-200 hover:bg-green-50 hover:scale-105 transition-all duration-200 hover:shadow-md"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Mark as Found/Resolved
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <ClosePostDialog
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
        onConfirm={confirmClosePost}
        postTitle={selectedPost?.title || ""}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
