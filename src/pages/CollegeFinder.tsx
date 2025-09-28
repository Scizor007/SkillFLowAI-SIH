import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { MapPin, Search, GraduationCap, Navigation, BookOpen, Users, Star, ChevronRight, ArrowRight } from 'lucide-react';

// Mock data for Hyderabad colleges
const hyderabadColleges = [
  {
    id: 1,
    name: 'Osmania University',
    state: 'Telangana',
    area: 'Hyderabad',
    address: 'Osmania University Campus, Hyderabad-500007',
    lat: 17.4118,
    lng: 78.5274,
    rating: 4.2,
    students: '45,000+',
    established: 1918,
    type: 'Public University',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=250&fit=crop',
    courses: [
      { name: 'University College of Arts and Social Sciences', degree: 'B.A.' },
      { name: 'University College of Law', degree: 'LL.B.' },
      { name: 'University College of Science', degree: 'B.Sc.' },
      { name: 'University College of Commerce and Business Management', degree: 'B.Com.' },
      { name: 'University College of Technology', degree: 'B.Tech.' },
    ],
  },
  {
    id: 2,
    name: 'Nizam College',
    state: 'Telangana',
    area: 'Basheer Bagh, Hyderabad',
    address: 'LB Stadium Road, Gun Foundry, Basheer Bagh, Hyderabad',
    lat: 17.3850,
    lng: 78.4740,
    rating: 4.0,
    students: '8,500+',
    established: 1887,
    type: 'Government College',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=250&fit=crop',
    courses: [
      { name: 'Bachelor of Sciences', degree: 'B.Sc.' },
      { name: 'Bachelor of Commerce', degree: 'B.Com.' },
      { name: 'Bachelor of Arts - Telugu Medium', degree: 'B.A.' },
      { name: 'Bachelor of Arts - English Medium', degree: 'B.A.' },
      { name: 'Bachelor of Business Administration', degree: 'BBA' },
    ],
  },
  {
    id: 3,
    name: 'Indian Institute of Management and Commerce',
    state: 'Telangana',
    area: 'Khairtabad, Hyderabad',
    address: '6-1-91, Adj. Telephone Bhavan, Khairtabad, Hyderabad-50004',
    lat: 17.4061,
    lng: 78.4648,
    rating: 3.8,
    students: '2,200+',
    established: 1995,
    type: 'Private Institute',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop',
    courses: [
      { name: 'B.Com. (Hons)', degree: 'B.Com.' },
      { name: 'B.Com. (Gen)', degree: 'B.Com.' },
      { name: 'B.Com. (Computers)', degree: 'B.Com.' },
      { name: 'BBA', degree: 'BBA' },
      { name: 'M.Com.', degree: 'M.Com.' },
    ],
  },
  {
    id: 4,
    name: 'St. Francis College for Women',
    state: 'Telangana',
    area: 'Begumpet, Hyderabad',
    address: 'Uma Nagar, Begumpet, Hyderabad-500016',
    lat: 17.4370,
    lng: 78.4617,
    rating: 4.3,
    students: '3,500+',
    established: 1959,
    type: 'Private College',
    image: 'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=400&h=250&fit=crop',
    courses: [
      { name: 'PG Courses', degree: 'M.Sc.' },
      { name: 'PG Diploma Courses', degree: 'PG Diploma' },
      { name: 'UG Courses - Sciences', degree: 'B.Sc.' },
      { name: 'UG Courses - Commerce', degree: 'B.Com.' },
      { name: 'UG Courses - Arts', degree: 'B.A.' },
    ],
  },
  {
    id: 5,
    name: "St. Ann's College for Women",
    state: 'Telangana',
    area: 'Mehdipatanam, Hyderabad',
    address: 'Mehdipatanam, Hyderabad-500028',
    lat: 17.3620,
    lng: 78.4370,
    rating: 4.1,
    students: '2,800+',
    established: 1956,
    type: 'Private College',
    image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=250&fit=crop',
    courses: [
      { name: 'B.Sc. (Physical Science)', degree: 'B.Sc.' },
      { name: 'B.Sc. (Biological Sciences)', degree: 'B.Sc.' },
      { name: 'B.A.', degree: 'B.A.' },
      { name: 'BBA', degree: 'BBA' },
      { name: 'B.Com.', degree: 'B.Com.' },
    ],
  },
];

const CollegeFinder: React.FC = () => {
  const [state, setState] = useState('Telangana');
  const [area, setArea] = useState('Hyderabad');
  const [colleges, setColleges] = useState<typeof hyderabadColleges>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingLocation, setUsingLocation] = useState(false);
  const [userPosition] = useState<[number, number]>([17.3850, 78.4564]);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      const filtered = hyderabadColleges.filter(
        (college) =>
          college.state.toLowerCase().includes(state.toLowerCase()) &&
          college.area.toLowerCase().includes(area.toLowerCase())
      );
      setColleges(filtered);
      setLoading(false);
      if (filtered.length === 0) {
        setError('No colleges found for the given location.');
      }
    }, 800);
  };

  const handleUseLocation = () => {
    setUsingLocation(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState('Telangana');
          setArea('Hyderabad');
          handleSearch();
          setUsingLocation(false);
        },
        (err) => {
          setError('Failed to get location: ' + err.message);
          setUsingLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setUsingLocation(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-blue-400 fill-current' : 'text-gray-600'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="p-6 bg-blue-600/20 backdrop-blur-sm rounded-full border border-blue-500/30">
                <GraduationCap className="w-16 h-16 text-blue-400" />
              </div>
            </div>
            <p className="text-blue-400 font-medium mb-4 tracking-wider uppercase text-sm">
              Discover Your Future
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Find the Perfect
              <span className="block bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent">
                College Near Your City
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover top educational institutions near your city with our AI-powered college finder. 
              Compare programs, explore campuses, and start your academic journey.
            </p>
          </div>
        </div>

        {/* Floating UI Elements */}
        <div className="absolute top-20 left-10 w-32 h-24 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 transform rotate-12 opacity-60"></div>
        <div className="absolute bottom-20 right-10 w-40 h-28 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 transform -rotate-6 opacity-60"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Search Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                <Search className="w-8 h-8 text-blue-400" />
                Search Colleges
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-3">
                  <Label htmlFor="state" className="text-lg font-semibold text-gray-300">State</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g., Telangana"
                    className="h-12 text-lg bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="area" className="text-lg font-semibold text-gray-300">Area/City</Label>
                  <Input
                    id="area"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g., Hyderabad"
                    className="h-12 text-lg bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleSearch} 
                  disabled={loading}
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  {loading ? 'Searching...' : 'Get Started'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleUseLocation} 
                  disabled={usingLocation}
                  className="h-12 px-8 border-slate-600 bg-transparent text-gray-300 hover:bg-slate-800 hover:text-white font-semibold text-lg transition-all duration-300"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  {usingLocation ? 'Getting Location...' : 'Use Location'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowMap(!showMap)}
                  className="h-12 px-8 border-slate-600 bg-transparent text-gray-300 hover:bg-slate-800 hover:text-white font-semibold text-lg transition-all duration-300"
                >
                  <Navigation className="mr-2 h-5 w-5" />
                  {showMap ? 'Hide Map' : 'Show Map'}
                </Button>
              </div>
              {error && (
                <div className="mt-6 p-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg backdrop-blur-sm">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Map Section */}
        {showMap && colleges.length > 0 && (
          <div className="max-w-6xl mx-auto mb-16">
            <Card className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 shadow-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-blue-400" />
                  Colleges Near You
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96 w-full rounded-lg overflow-hidden bg-slate-800">
                  <div style={{ height: '100%', width: '100%' }}>
                    <div className="relative h-full w-full bg-slate-800 border border-slate-700 rounded">
                      {/* Simulated Map with College Markers */}
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800">
                        {/* Grid pattern to simulate map */}
                        <div className="absolute inset-0 opacity-20">
                          {Array.from({ length: 20 }).map((_, i) => (
                            <div
                              key={`v-${i}`}
                              className="absolute w-px bg-slate-600"
                              style={{
                                left: `${(i + 1) * 5}%`,
                                height: '100%',
                              }}
                            />
                          ))}
                          {Array.from({ length: 12 }).map((_, i) => (
                            <div
                              key={`h-${i}`}
                              className="absolute h-px bg-slate-600"
                              style={{
                                top: `${(i + 1) * 8}%`,
                                width: '100%',
                              }}
                            />
                          ))}
                        </div>
                        
                        {/* User location marker */}
                        <div
                          className="absolute z-20 flex items-center justify-center"
                          style={{
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          <div className="relative">
                            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-slate-600">
                              You are here
                            </div>
                          </div>
                        </div>

                        {/* College markers */}
                        {colleges.map((college, index) => {
                          // Calculate relative positions based on lat/lng differences
                          const centerLat = 17.3850;
                          const centerLng = 78.4564;
                          const latDiff = (college.lat - centerLat) * 1000; // Scale factor
                          const lngDiff = (college.lng - centerLng) * 1000; // Scale factor
                          
                          const x = 50 + lngDiff * 2; // Center at 50% + offset
                          const y = 50 - latDiff * 2; // Center at 50% + offset (inverted for screen coords)
                          
                          return (
                            <div
                              key={college.id}
                              className="absolute z-10 group cursor-pointer"
                              style={{
                                left: `${Math.max(5, Math.min(95, x))}%`,
                                top: `${Math.max(5, Math.min(95, y))}%`,
                                transform: 'translate(-50%, -50%)',
                              }}
                            >
                              <div className="relative">
                                <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg hover:bg-blue-400 transition-colors group-hover:scale-110 transform duration-200">
                                  <GraduationCap className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                
                                {/* Popup on hover */}
                                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                                  <div className="bg-slate-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl border border-slate-600 max-w-xs">
                                    <h4 className="font-bold text-blue-400 mb-1">{college.name}</h4>
                                    <p className="text-gray-300 text-xs mb-2">{college.address}</p>
                                    <div className="space-y-1">
                                      {college.courses.slice(0, 3).map((course, idx) => (
                                        <div key={idx} className="text-xs text-gray-400">
                                          {course.name} ({course.degree})
                                        </div>
                                      ))}
                                    </div>
                                    <div className="flex items-center mt-2 gap-1">
                                      {renderStars(college.rating)}
                                      <span className="text-xs text-gray-400 ml-1">{college.rating}</span>
                                    </div>
                                  </div>
                                  {/* Arrow pointing down */}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Map legend */}
                        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm p-3 rounded-lg border border-slate-600">
                          <h4 className="text-white font-semibold text-sm mb-2">Legend</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-gray-300 text-xs">Your Location</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-gray-300 text-xs">Colleges ({colleges.length})</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Map controls */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                          <button className="w-8 h-8 bg-slate-900/90 backdrop-blur-sm border border-slate-600 rounded text-white hover:bg-slate-800 transition-colors">
                            +
                          </button>
                          <button className="w-8 h-8 bg-slate-900/90 backdrop-blur-sm border border-slate-600 rounded text-white hover:bg-slate-800 transition-colors">
                            −
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Section */}
        {colleges.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Top Colleges Near Your City
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Found {colleges.length} excellent institutions personalized to your educational goals
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {colleges.map((college) => (
                <Card 
                  key={college.id} 
                  className="group bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/30 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl shadow-xl overflow-hidden"
                >
                  <div className="relative">
                    <img 
                      src={college.image} 
                      alt={college.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-700/50">
                      <span className="text-sm font-semibold text-gray-300">{college.type}</span>
                    </div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-700/50">
                      {renderStars(college.rating)}
                      <span className="text-sm font-semibold text-gray-300 ml-2">{college.rating}</span>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {college.name}
                    </CardTitle>
                    <div className="flex items-center text-gray-400 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {college.area}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-400">{college.students}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-green-400" />
                        <span className="text-gray-400">Est. {college.established}</span>
                      </div>
                    </div>

                    <Separator className="bg-slate-700" />
                    
                    <div>
                      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-blue-400" />
                        Available Courses
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {college.courses.slice(0, 4).map((course, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg text-sm border border-slate-700/30">
                            <span className="text-gray-300">{course.name}</span>
                            <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold border border-blue-500/30">
                              {course.degree}
                            </span>
                          </div>
                        ))}
                        {college.courses.length > 4 && (
                          <p className="text-sm text-gray-500 text-center pt-2">
                            +{college.courses.length - 4} more courses available
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 transform hover:scale-105"
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${college.lat},${college.lng}`, '_blank')}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Get Directions
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-slate-600 bg-transparent text-gray-300 hover:bg-slate-800 hover:text-white"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-4 bg-slate-900/80 backdrop-blur-sm px-8 py-6 rounded-2xl shadow-2xl border border-slate-700/50">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xl font-semibold text-white">Finding your perfect colleges...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeFinder;