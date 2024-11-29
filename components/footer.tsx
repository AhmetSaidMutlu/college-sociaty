import Link from 'next/link'
import { Facebook, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About CIBSOC</h3>
            <p className="text-sm">Advancing the field of Cyber-Informed Business Systems and Operations Continuity</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm hover:underline">Home</Link></li>
              <li><Link href="/" className="text-sm hover:underline">About Us</Link></li>
              <li><Link href="/" className="text-sm hover:underline">Resources</Link></li>
              <li><Link href="/" className="text-sm hover:underline">Events</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-sm">Email: info@cibsoc.co.uk</p>
            <p className="text-sm">Phone: +44 123 456 7890</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-blue-400">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-white hover:text-blue-400">
                <Twitter size={24} />
              </a>
              <a href="#" className="text-white hover:text-blue-400">
                <Linkedin size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-sm">&copy; 2023 CIBSOC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

