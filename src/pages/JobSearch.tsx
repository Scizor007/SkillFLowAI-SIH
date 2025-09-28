"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon, Briefcase, ChevronLeft, ChevronRight, MapPin, Building, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Add these styles to your globals.css or use inline styles
// @keyframes marquee {
//   0% { transform: translateX(0); }
//   100% { transform: translateX(-50%); }
// }

// .animate-marquee {
//   animation: marquee 30s linear infinite;
// }

// Location mapping with correct GeoIDs
const LOCATION_GEOIDS = {
  "United States": "103644278",
  "India": "102713980",
  // 'Bangalore': '102442950', // Tech hub of India
  // 'Mumbai': '102443405',
  // 'Delhi': '102443413',
  // 'Hyderabad': '102442951', // Major tech center
  // 'Pune': '102442952', // IT and manufacturing hub
  // 'Chennai': '102442953', // Tech and manufacturing center
  // 'Noida': '102443417', // IT hub near Delhi
  // 'Gurgaon': '102443416', // Corporate hub
  // 'Kolkata': '102443406',
  // 'Ahmedabad': '102442949',
  // 'Chandigarh': '102443414',
  // 'Trivandrum': '102442954', // Tech hub in Kerala
  // 'Coimbatore': '102442955',
  // 'Jaipur': '102443404',
  // 'Lucknow': '102443408',
  // 'Bhubaneswar': '102442956', // Emerging tech hub
  // 'Vizag': '102442957',
  "Canada": "103735027",
  "United Kingdom": "103644279",
  "Germany": "103644280",
  "Australia": "103644281",
  Remote: "spurious",
};

// Predefined filter options
const SORT_BY_OPTIONS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
]

const JOB_TYPES = [
  { value: "temporary", label: "Temporary" },
  { value: "contract", label: "Contract" },
  { value: "volunteer", label: "Volunteer" },
  { value: "full-time", label: "Full Time" },
  { value: "part-time", label: "Part Time" },
]

const EXPERIENCE_LEVELS = [
  { value: "internship", label: "Internship" },
  { value: "entry-level", label: "Entry Level" },
  { value: "associate", label: "Associate" },
  { value: "mid-senior-level", label: "Mid Senior Level" },
  { value: "director", label: "Director" },
]

const WORK_TYPES = [
  { value: "at-work", label: "At Work" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
]

// Top job positions for marquee
const TOP_POSITIONS = [
  { title: "Senior Software Engineer", salary: "$150K-$220K" },
  { title: "Product Manager", salary: "$120K-$180K" },
  { title: "DevOps Specialist", salary: "$130K-$190K" },
  { title: "UX/UI Designer", salary: "$90K-$140K" },
  { title: "Data Scientist", salary: "$140K-$200K" },
  { title: "Full Stack Developer", salary: "$100K-$160K" },
  { title: "Machine Learning Engineer", salary: "$160K-$230K" },
  { title: "Cloud Architect", salary: "$170K-$240K" },
]

// Job Listing Interface
interface JobListing {
  id: string
  title: string
  company: string
  location: string
  salary: string
  skills: string[]
  description: string
  link: string
}

const JobSearch = () => {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useState({
    field: "",
    geoid: "103644278", // Default to United States
    page: 1,
    sortBy: "",
    jobType: "",
    experienceLevel: "",
    workType: "",
  })

  const [jobListings, setJobListings] = useState<JobListing[]>([])
  const [searching, setSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // User's skills from their profile
  const userSkills = user?.skills || []

  // Fetch job listings
  const fetchJobListings = async () => {
    if (!searchParams.field.trim()) return

    setSearching(true)

    try {
      // Construct API URL with parameters
      const apiKey = import.meta.env.VITE_SCRAPING_DOG_API_KEY;
      const baseUrl = "https://api.scrapingdog.com/linkedinjobs/"

      const params = new URLSearchParams({
        api_key: apiKey,
        field: searchParams.field,
        geoid: searchParams.geoid,
        page: currentPage.toString(),
        sortBy: searchParams.sortBy,
        jobType: searchParams.jobType,
        expLevel: searchParams.experienceLevel,
        workType: searchParams.workType,
      })

      const response = await fetch(`${baseUrl}?${params.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch job listings")
      }

      const data = await response.json()

      // Transform job listings
      const transformedJobs: JobListing[] = data.map((job: any) => ({
        id: job.job_id || Math.random().toString(36).substr(2, 9),
        title: job.job_position || "Untitled Position",
        company: job.company_name || "Unknown Company",
        location: job.job_location || "Not Specified",
        salary: "Salary not disclosed",
        skills: [], // LinkedIn API doesn't provide skills directly
        description: "Job details available on LinkedIn",
        link: job.job_link || "#",
      }))

      setJobListings(transformedJobs)
    } catch (error) {
      console.error("Error fetching job listings:", error)
      setJobListings([])
    } finally {
      setSearching(false)
    }
  }

  // Update search parameters
  const updateSearchParam = (key: string, value: string) => {
    setSearchParams((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Skills Section */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-primary/10 text-primary p-1.5 rounded-md mr-2">
                <Briefcase className="h-5 w-5" />
              </span>
              Your Skills
            </h2>
            <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              {userSkills.length > 0 ? (
                userSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-1.5 px-3 font-medium">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  Complete courses to earn skills that will appear here.
                </p>
              )}
            </div>
          </div>

          {/* Marquee of Top Positions */}
          <div className="relative overflow-hidden py-4 mb-10 bg-[#0a1429] rounded-lg">
            <div className="flex items-center whitespace-nowrap animate-marquee">
              {TOP_POSITIONS.map((position, index) => (
                <div key={index} className="inline-flex items-center mx-6">
                  <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                  <span className="font-medium text-white">{position.title}</span>
                  <span className="ml-2 text-gray-400">{position.salary}</span>
                </div>
              ))}
              {TOP_POSITIONS.map((position, index) => (
                <div key={`repeat-${index}`} className="inline-flex items-center mx-6">
                  <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                  <span className="font-medium text-white">{position.title}</span>
                  <span className="ml-2 text-gray-400">{position.salary}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Search Section */}
          <Card className="mb-10 border-0 shadow-md overflow-hidden">
            <div className="bg-blue-600 text-white py-8 px-6 text-center">
              <h1 className="text-3xl font-bold mb-3">Find Your Next Career Opportunity</h1>
              <p className="text-white/90 max-w-2xl mx-auto">Search for jobs that match your skills and interests.</p>
            </div>

            <CardContent className="px-6 py-8 bg-gray-900 dark:bg-gray-900 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Job Search Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">Job Title or Keyword</label>
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="e.g., Software Engineer"
                      value={searchParams.field}
                      onChange={(e) => updateSearchParam("field", e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchJobListings()}
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                {/* Location Selector */}
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Select 
                    value={searchParams.geoid}
                    onValueChange={(value) => updateSearchParam("geoid", value)}
                  >
                    <SelectTrigger className="h-10 bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {Object.entries(LOCATION_GEOIDS).map(([location, geoid]) => (
                        <SelectItem key={geoid} value={geoid}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <Select value={searchParams.sortBy} onValueChange={(value) => updateSearchParam("sortBy", value)}>
                    <SelectTrigger className="h-10 bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {SORT_BY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Job Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">Job Type</label>
                  <Select value={searchParams.jobType} onValueChange={(value) => updateSearchParam("jobType", value)}>
                    <SelectTrigger className="h-10 bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {JOB_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium mb-2">Experience Level</label>
                  <Select
                    value={searchParams.experienceLevel}
                    onValueChange={(value) => updateSearchParam("experienceLevel", value)}
                  >
                    <SelectTrigger className="h-10 bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Experience Level" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Work Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">Work Type</label>
                  <Select value={searchParams.workType} onValueChange={(value) => updateSearchParam("workType", value)}>
                    <SelectTrigger className="h-10 bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Work Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {WORK_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search Button */}
              <div className="mt-6">
                <Button
                  onClick={fetchJobListings}
                  disabled={searching}
                  className="w-full h-12 font-medium bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  {searching ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <SearchIcon className="h-5 w-5 mr-2" />
                  )}
                  Search Jobs
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Job Results */}
          {jobListings.length > 0 ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold">Job Opportunities</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage === 1}
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage((prev) => prev - 1)
                        fetchJobListings()
                      }
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    Page {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage === 10}
                    onClick={() => {
                      if (currentPage < 10) {
                        setCurrentPage((prev) => prev + 1)
                        fetchJobListings()
                      }
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {jobListings.map((job) => (
                <Card
                  key={job.id}
                  className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <CardContent className="p-0">
                    <div className="p-6 border-l-4 border-primary">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                          <div className="flex flex-wrap gap-4 mt-2 mb-3 text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-1.5 text-gray-500" />
                              {job.company}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1.5 text-gray-500" />
                              {job.location}
                            </div>
                          </div>
                          <div className="text-lg font-medium text-primary mb-4">{job.salary}</div>
                          <p className="mb-4 text-gray-700 dark:text-gray-300">{job.description}</p>

                          <div className="mb-3">
                            <span className="text-sm font-semibold">Required Skills:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {job.skills.length > 0 ? (
                                job.skills.map((skill, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="bg-primary/5 text-primary border-primary/20"
                                  >
                                    {skill}
                                  </Badge>
                                ))
                              ) : (
                                <Badge variant="secondary">No skills information</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center">
                          <Button className="min-w-[140px] font-medium" onClick={() => window.open(job.link, "_blank")}>
                            Apply Now
                          </Button>
                          <p className="text-xs text-gray-500 mt-2 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Apply on LinkedIn
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searching ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <div className="absolute inset-0 h-12 w-12 rounded-full border-t-2 border-primary/20"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Searching for job opportunities...</p>
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="bg-primary/10 p-4 rounded-full inline-flex mb-6">
                <Briefcase className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-medium mb-3">Start your job search</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Enter a job title, skill, or company name to find opportunities that match your profile.
              </p>
              <Button
                onClick={() => {
                  if (searchParams.field) fetchJobListings()
                }}
                className="px-6"
                disabled={!searchParams.field}
              >
                <SearchIcon className="h-4 w-4 mr-2" />
                Find Jobs
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default JobSearch
