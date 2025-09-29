import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Search, GraduationCap, Navigation, BookOpen, ChevronRight, ArrowRight, ChevronLeft } from 'lucide-react';

const API_BASE = 'https://colleges-api.onrender.com';

// Fallback static data for states and districts
const STATIC_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const STATIC_DISTRICTS: { [key: string]: string[] } = {
  'Telangana': ['Adilabad', 'Bhadradri Kothagudem', 'Hyderabad', 'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam', 'Komaram Bheem Asifabad', 'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Ranga Reddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal Rural', 'Warangal Urban', 'Yadadri Bhuvanagiri'],
  // Add more states as needed
  'Andhra Pradesh': ['Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna', 'Kurnool', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'Y.S.R. Kadapa'],
  // ... other states
};

interface College {
  Name: string;
  State: string;
  City: string;
  Address_line1: string;
  Address_line2: string;
}

interface ApiResponse {
  colleges: College[] | null;
  count: number;
  currentPage: number;
  pages: number;
}

// Mock fallback colleges for demonstration (since API may return null)
const MOCK_COLLEGES: College[] = [
  {
    Name: 'Osmania University',
    State: 'Telangana',
    City: 'Hyderabad',
    Address_line1: 'Osmania University Main Road, Amberpet',
    Address_line2: 'Tarnaka, Secunderabad, Hyderabad, Telangana 500007'
  },
  {
    Name: 'Nizam College',
    State: 'Telangana',
    City: 'Hyderabad',
    Address_line1: 'Opposite LB Stadium Road, Gun Foundry',
    Address_line2: 'Basheer Bagh, Hyderabad, Telangana 500001'
  },
  {
    Name: 'Indian Institute of Management and Commerce',
    State: 'Telangana',
    City: 'Hyderabad',
    Address_line1: '6-1-91, Adjacent to Telephone Bhavan',
    Address_line2: 'Khairatabad, Hyderabad, Telangana 500004'
  },
  {
    Name: 'St. Francis College for Women',
    State: 'Telangana',
    City: 'Hyderabad',
    Address_line1: '6, Uma Nagar, Begumpet',
    Address_line2: 'Hyderabad, Telangana 500016'
  },
  {
    Name: "St. Ann's College for Women",
    State: 'Telangana',
    City: 'Hyderabad',
    Address_line1: "12-2-823/A/45, St Ann's Road, Santosh Nagar",
    Address_line2: 'Mehdipatnam, Hyderabad, Telangana 500028'
  },
  // Add more mock data as needed
];

const CollegeFinder: React.FC = () => {
  const [states, setStates] = useState<string[]>(STATIC_STATES);
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('Telangana');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [colleges, setColleges] = useState<College[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [usingLocation, setUsingLocation] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [apiError, setApiError] = useState<boolean>(false);

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    if (selectedState) {
      fetchDistricts(selectedState);
    }
  }, [selectedState]);

  const fetchStates = async () => {
    try {
      const response = await fetch(`${API_BASE}/colleges/states`);
      if (!response.ok) throw new Error('Failed to fetch states');
      const data: string[] = await response.json();
      if (data && data.length > 0) {
        setStates(data);
        setApiError(false);
      } else {
        console.warn('API returned empty states, using fallback');
        setApiError(true);
      }
    } catch (err) {
      console.error('Error fetching states:', err);
      setApiError(true);
      // Use fallback states
    }
  };

  const fetchDistricts = async (state: string) => {
    try {
      const encodedState = encodeURIComponent(state);
      const response = await fetch(`${API_BASE}/colleges/${encodedState}/districts`);
      if (!response.ok) throw new Error('Failed to fetch districts');
      const data: string[] = await response.json();
      if (data && data.length > 0) {
        setDistricts(data);
      } else {
        // Use static districts if API fails
        const staticDists = STATIC_DISTRICTS[state] || [];
        setDistricts(staticDists);
      }
    } catch (err) {
      console.error('Error fetching districts:', err);
      // Use static districts
      const staticDists = STATIC_DISTRICTS[state] || [];
      setDistricts(staticDists);
    }
  };

  const handleSearch = async () => {
    if (!selectedState || !selectedCity) {
      setError('Please select both state and city.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const encodedState = encodeURIComponent(selectedState);
      const encodedCity = encodeURIComponent(selectedCity);
      let url = `${API_BASE}/colleges/${encodedState}/${encodedCity}?page=${currentPage}&limit=10`;
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch colleges');
      const data: ApiResponse = await response.json();
      if (data.colleges && data.colleges.length > 0) {
        setColleges(data.colleges);
        setTotalCount(data.count || 0);
        setTotalPages(data.pages || 1);
        setApiError(false);
      } else {
        // Fallback to mock data filtered by state and city
        console.warn('API returned no colleges, using mock data');
        const filteredMock = MOCK_COLLEGES.filter(
          c => c.State === selectedState && c.City.toLowerCase().includes(selectedCity.toLowerCase())
        );
        setColleges(filteredMock);
        setTotalCount(filteredMock.length);
        setTotalPages(1);
        setApiError(true);
      }
    } catch (err) {
      console.error('Error fetching colleges:', err);
      setApiError(true);
      // Fallback to mock data
      const filteredMock = MOCK_COLLEGES.filter(
        c => c.State === selectedState && c.City.toLowerCase().includes(selectedCity.toLowerCase())
      );
      setColleges(filteredMock);
      setTotalCount(filteredMock.length);
      setTotalPages(1);
      setError('API temporarily unavailable. Showing sample data for ' + selectedCity + ', ' + selectedState + '.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseLocation = () => {
    setUsingLocation(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            const geoResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
            );
            if (!geoResponse.ok) throw new Error('Geocoding failed');
            const geoData = await geoResponse.json();
            const address = geoData.address;
            const state = address.state || 'Telangana'; // Fallback
            const city = address.city || address.county || address.town || 'Hyderabad'; // Fallback
            setSelectedState(state);
            setSelectedCity(city);
            // Wait a bit for districts to load
            setTimeout(() => {
              handleSearch();
            }, 500);
          } catch (err) {
            setError('Failed to determine location. Using default: Telangana, Hyderabad.');
            setSelectedState('Telangana');
            setSelectedCity('Hyderabad');
            setTimeout(() => handleSearch(), 500);
          } finally {
            setUsingLocation(false);
          }
        },
        (err) => {
          setError('Failed to get location: ' + err.message + '. Using default: Telangana, Hyderabad.');
          setSelectedState('Telangana');
          setSelectedCity('Hyderabad');
          setTimeout(() => handleSearch(), 500);
          setUsingLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported. Using default: Telangana, Hyderabad.');
      setSelectedState('Telangana');
      setSelectedCity('Hyderabad');
      setTimeout(() => handleSearch(), 500);
      setUsingLocation(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      handleSearch(); // Re-fetch with new page
    }
  };

  useEffect(() => {
    if (selectedState === 'Telangana') {
      setSelectedCity('Hyderabad');
    }
  }, [selectedState]);

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
              {apiError && (
                <p className="text-sm text-yellow-400 mt-2">API may be temporarily unavailable. Using sample data.</p>
              )}
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-3">
                  <Label htmlFor="state" className="text-lg font-semibold text-gray-300">State</Label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="h-12 text-lg bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="city" className="text-lg font-semibold text-gray-300">City/District</Label>
                  <Select value={selectedCity} onValueChange={setSelectedCity} disabled={districts.length === 0}>
                    <SelectTrigger className="h-12 text-lg bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue placeholder={districts.length === 0 ? "Loading districts..." : "Select City"} />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="search" className="text-lg font-semibold text-gray-300">College Name (Optional)</Label>
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., Osmania"
                    className="h-12 text-lg bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleSearch} 
                  disabled={loading || !selectedState || !selectedCity}
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
                  disabled={colleges.length === 0}
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

        {/* Pagination */}
        {totalPages > 1 && colleges.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8 flex justify-center items-center gap-4">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-slate-600 bg-transparent text-gray-300 hover:bg-slate-800 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <span className="text-white font-semibold">
              Page {currentPage} of {totalPages} ({totalCount} total)
            </span>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-slate-600 bg-transparent text-gray-300 hover:bg-slate-800 hover:text-white"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Map Section (Simplified without real coords) */}
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
                  <div className="relative h-full w-full bg-gradient-to-br from-slate-700 to-slate-800">
                    {/* Simulated grid and markers with random positions */}
                    <div className="absolute inset-0 opacity-20">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={`v-${i}`}
                          className="absolute w-px bg-slate-600"
                          style={{ left: `${(i + 1) * 5}%`, height: '100%' }}
                        />
                      ))}
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={`h-${i}`}
                          className="absolute h-px bg-slate-600"
                          style={{ top: `${(i + 1) * 8}%`, width: '100%' }}
                        />
                      ))}
                    </div>
                    {/* User location marker */}
                    <div
                      className="absolute z-20 flex items-center justify-center"
                      style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                    >
                      <div className="relative">
                        <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-slate-600">
                          You are here
                        </div>
                      </div>
                    </div>
                    {/* College markers with random positions */}
                    {colleges.map((college, index) => (
                      <div
                        key={`${college.Name}-${index}`}
                        className="absolute z-10 group cursor-pointer"
                        style={{
                          left: `${(index * 15 + Math.random() * 20) % 90 + 5}%`,
                          top: `${(index * 20 + Math.random() * 15) % 80 + 10}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <div className="relative">
                          <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg hover:bg-blue-400 transition-colors group-hover:scale-110 transform duration-200">
                            <GraduationCap className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                          </div>
                          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                            <div className="bg-slate-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl border border-slate-600 max-w-xs">
                              <h4 className="font-bold text-blue-400 mb-1">{college.Name}</h4>
                              <p className="text-gray-300 text-xs mb-2">{college.City}, {college.State}</p>
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Legend */}
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
                Found {totalCount} institutions in {selectedCity}, {selectedState}
                {apiError && ' (Sample Data)'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {colleges.map((college, index) => (
                <Card 
                  key={`${college.Name}-${index}`} 
                  className="group bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/30 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl shadow-xl overflow-hidden"
                >
                  <div className="relative">
                    <div className="w-full h-48 bg-gradient-to-br from-blue-900 to-slate-800 flex items-center justify-center">
                      <GraduationCap className="w-16 h-16 text-blue-400 opacity-50" />
                    </div>
                  </div>
                  
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {college.Name}
                    </CardTitle>
                    <div className="flex items-center text-gray-400 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {college.City}, {college.State}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <Separator className="bg-slate-700" />
                    
                    <div>
                      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        Address
                      </h4>
                      <p className="text-gray-300 text-sm">
                        {college.Address_line1}, {college.Address_line2}
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 transform hover:scale-105"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${college.Name}, ${college.City}, ${college.State}`)}`, '_blank')}
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