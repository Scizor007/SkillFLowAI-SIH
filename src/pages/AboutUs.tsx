import React from 'react';
import { User } from 'lucide-react';
import Header from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
}

const AboutUs: React.FC = () => {
  // Team members data
  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "Ayushman Yash Nayak",
      role: "Backend Developer",
      image: "/Ayushman.jpg",
    },
    {
      id: 2,
      name: "Prajwal Upadhyay",
      role: "Frontend Developer",
      image: "/prajwal.jpg",
    },
    {
      id: 3,
      name: "T.Divyasree",
      role: "Frontend Developer",
      image: "/divyashree.jpg",
    },
    {
      id: 4,
      name: "Ruhi Parveen",
      role: "Frontend Developer",
      image: "/ruhi.jpg",
    },{
      id: 5,
      name: "C. Chethana",
      role: "Frontend Developer",
      image: "/chethana.jpg",
    },
    {
      id: 6,  
      name: "Divyansh Tonk",
      role: "Backend Developer",
      image: "/divyansh.jpg",
    }
  ];

  return (
    <>
      <Header />
      <div className="bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 min-h-screen text-white pt-20 flex flex-col justify-between">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-slide-in-down">
            About <span className="text-blue-400">SkillFlowAI</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-8 animate-fade-in delay-150">
            Revolutionizing learning with AI-powered, personalized education for everyone.
          </p>
        </section>

        {/* Decorative Divider */}
        <div className="flex justify-center mb-12">
          <span className="inline-block w-32 h-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-fade-in" />
        </div>

        {/* Mission Section */}
        <section className="container mx-auto px-4 mb-24 animate-slide-in-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-300">Our Mission</h2>
          <div className="bg-gray-800/80 p-6 rounded-xl shadow-lg mb-6 animate-fade-in">
            <p className="text-xl text-blue-100 font-medium">
              At SkillFlowAI, we aim to revolutionize the learning experience by leveraging AI to create personalized educational paths that adapt to individual learning styles, making skill acquisition more efficient and effective for everyone.
            </p>
          </div>
          <p className="text-lg text-gray-300 mb-3 animate-fade-in delay-100">
            SkillFlowAI was founded with a vision to democratize education through technology. We believe that everyone deserves access to high-quality learning materials tailored to their unique needs and preferences.
          </p>
          <p className="text-lg text-gray-300 animate-fade-in delay-200">
            Our platform uses advanced artificial intelligence to analyze learning patterns and generate custom courses that help users master new skills in the most efficient way possible. By combining AI-generated content with skills tracking and job matching, we've created a complete ecosystem for personal and professional growth.
          </p>
        </section>

        {/* Team Section */}
        <section className="container mx-auto px-4 mb-24">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-blue-300 text-center animate-fade-in">Meet Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {teamMembers.map((member, idx) => (
              <div
                key={member.id}
                className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-blue-400/40 animate-pop-up relative group"
                style={{ animationDelay: `${idx * 120}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="h-64 overflow-hidden relative">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                      <User size={64} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-6 text-center relative z-10">
                  <h3 className="text-2xl font-semibold text-blue-400 mb-2 animate-fade-in delay-100 group-hover:text-blue-300 transition-colors duration-300">{member.name}</h3>
                  <p className="text-gray-300 text-lg animate-fade-in delay-200 group-hover:text-gray-200 transition-colors duration-300">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
};

export default AboutUs;