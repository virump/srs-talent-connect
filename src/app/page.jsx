import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="text-center max-w-3xl mx-auto px-4">
        <h1 className="text-5xl font-bold mb-6">Welcome to SRS</h1>
        <p className="text-xl text-gray-600 mb-12">
          Your one-stop platform for courses, internships, and career growth. Join our community of learners and professionals.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Learn</h3>
            <p className="text-gray-600">Access quality courses from industry experts</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Practice</h3>
            <p className="text-gray-600">Get hands-on experience with real projects</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Grow</h3>
            <p className="text-gray-600">Find internships and job opportunities</p>
          </div>
        </div>
      </div>
    </main>
  )
}
