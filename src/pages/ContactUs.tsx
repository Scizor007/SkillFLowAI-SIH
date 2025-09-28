import { Mail, Phone, User } from 'lucide-react';

export default function ContactUsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 py-16">
      <div className="bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-pop-up relative">
        <div className="flex flex-col gap-6 animate-fade-in">
          <h2 className="text-3xl font-extrabold mb-2 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-slide-in-down">
            Contact Us
          </h2>
          {/* Contact Information */}
          <div className="flex flex-col gap-4 animate-fade-in delay-100">
            <div className="flex items-center space-x-3">
              <User className="text-blue-400" size={20} />
              <div>
                <p className="text-gray-400 text-sm">Name</p>
                <p className="font-medium">SkillFlowAI Support Team</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="text-blue-400" size={20} />
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="font-medium">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="text-blue-400" size={20} />
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="font-medium">support@skillflowai.com</p>
              </div>
            </div>
          </div>
          {/* Contact Form */}
          <div className="mt-6 pt-6 border-t border-gray-700 animate-fade-in delay-200">
            <h3 className="text-lg font-semibold mb-4 text-blue-300">Send us a message</h3>
            <div className="space-y-4">
              <div className="animate-fade-in delay-300">
                <label className="block text-sm text-gray-400 mb-1">Your Name</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-800 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                />
              </div>
              <div className="animate-fade-in delay-400">
                <label className="block text-sm text-gray-400 mb-1">Your Email</label>
                <input 
                  type="email" 
                  className="w-full bg-gray-800 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>
              <div className="animate-fade-in delay-500">
                <label className="block text-sm text-gray-400 mb-1">Message</label>
                <textarea 
                  className="w-full bg-gray-800 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="How can we help you?"
                />
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-all animate-pop-up delay-600">
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}