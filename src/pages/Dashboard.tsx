import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Filter, Heart, Clock, MapPin, Star, Shirt, Package, MessageCircle, TrendingUp, Crosshair, LocateIcon, Menu, Sun, Moon, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q");
    if (q) setSearchQuery(q);
  }, [location.search]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMode, setSelectedMode] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Distance filter state
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);

  // Known city coordinates for seeded data
  const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
    Mumbai: { lat: 19.076, lon: 72.8777 },
    Delhi: { lat: 28.6139, lon: 77.209 },
    Bengaluru: { lat: 12.9716, lon: 77.5946 },
    Hyderabad: { lat: 17.385, lon: 78.4867 },
    Pune: { lat: 18.5204, lon: 73.8567 },
    Chennai: { lat: 13.0827, lon: 80.2707 },
    Kolkata: { lat: 22.5726, lon: 88.3639 },
    Jaipur: { lat: 26.9124, lon: 75.7873 },
  };

  function toRad(deg: number) {
    return (deg * Math.PI) / 180;
  }

  function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast("Geolocation is not supported by your browser");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocLoading(false);
        toast("Location set! Filtering by distance.");
      },
      (err) => {
        console.error(err);
        setLocLoading(false);
        toast("Failed to get your location. Please allow permission and try again.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Map "all" sentinel to previous empty-string behavior expected by backend filters
  const normalize = (v: string) => (v === "all" ? "" : v);

  // Build args for query: omit keys when "all" is selected
  const args: any = {};
  if (selectedCategory !== "all") args.category = selectedCategory;
  if (selectedMode !== "all") args.mode = selectedMode;
  if (selectedSize !== "all") args.size = selectedSize;

  const items = useQuery(api.items.getAvailable, args);
  const myItems = useQuery(api.items.getMyItems);
  const myRequests = useQuery(api.requests.getMyRequests);
  const itemRequests = useQuery(api.requests.getMyItemRequests);

  const itemsLoading = items === undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const filteredItems = items?.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Apply distance filter if we have userLocation
  const distanceFilteredItems = (userLocation
    ? filteredItems.filter((item) => {
        const city = (item.location || "").trim();
        const coords = CITY_COORDS[city as keyof typeof CITY_COORDS];
        if (!coords) return false;
        const d = distanceKm(userLocation, coords);
        return d <= radiusKm;
      })
    : filteredItems
  );

  const handleItemClick = (itemId: string) => {
    navigate(`/item/${itemId}`);
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "exchange": return "bg-green-100 text-green-700 border-green-200";
      case "borrow": return "bg-blue-100 text-blue-700 border-blue-200";
      case "both": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "accepted": return "bg-green-100 text-green-700 border-green-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      case "completed": return "bg-blue-100 text-blue-700 border-blue-200";
      case "returned": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Add navigation/dark mode/mobile menu/chat loading states
  const [isNavigatingAdd, setIsNavigatingAdd] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);
  const toggleDarkMode = () => setIsDark((d) => !d);

  // Add: styled classes for theme toggle
  const themeToggleClasses = isDark
    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-md hover:shadow-lg"
    : "bg-white text-gray-700 hover:bg-accent ring-1 ring-border";

  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 elevation-1 dark:bg-black/40 dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center elevation-2">
                <Shirt className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ReWear
              </span>
            </div>
            
            {/* Desktop actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Dark mode toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                className={`shrink-0 rounded-full transition-all duration-300 ${themeToggleClasses}`}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Button
                onClick={() => {
                  setIsNavigatingAdd(true);
                  navigate("/add-item");
                }}
                disabled={isNavigatingAdd}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white ripple elevation-2"
              >
                {isNavigatingAdd ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Opening...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate("/profile")}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="hidden md:inline">{user.name || "User"}</span>
              </Button>

              <Button
                variant="outline"
                disabled={isLoggingOut}
                onClick={async () => {
                  try {
                    setIsLoggingOut(true);
                    await signOut();
                    navigate("/");
                  } finally {
                    setIsLoggingOut(false);
                  }
                }}
              >
                {isLoggingOut ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-pulse" />
                    Logging out...
                  </>
                ) : (
                  "Logout"
                )}
              </Button>
            </div>

            {/* Mobile actions */}
            <div className="md:hidden flex items-center gap-2">
              {/* Dark mode toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                className={`rounded-full transition-all duration-300 ${themeToggleClasses}`}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {/* Hamburger */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMobileMenuOpen((v: boolean) => !v)}
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 dark:border-white/10 bg-white/90 dark:bg-black/60 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2">
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsNavigatingAdd(true);
                  navigate("/add-item");
                }}
                disabled={isNavigatingAdd}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                {isNavigatingAdd ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Opening...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/profile");
                }}
                className="w-full"
              >
                Profile
              </Button>
              <Button
                variant="outline"
                disabled={isLoggingOut}
                onClick={async () => {
                  try {
                    setIsLoggingOut(true);
                    await signOut();
                    setMobileMenuOpen(false);
                    navigate("/");
                  } finally {
                    setIsLoggingOut(false);
                  }
                }}
                className="w-full"
              >
                {isLoggingOut ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-pulse" />
                    Logging out...
                  </>
                ) : (
                  "Logout"
                )}
              </Button>
            </div>
          </div>
        )}
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name || "Fashion Lover"}! 👋
          </h1>
          <p className="text-gray-600">
            Discover amazing clothes to exchange or borrow from your community
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="elevation-2 border-0 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-500 rounded-xl">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">My Items</p>
                  <p className="text-2xl font-bold text-green-700">{myItems?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="elevation-2 border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">My Requests</p>
                  <p className="text-2xl font-bold text-blue-700">{myRequests?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="elevation-2 border-0 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-500 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 font-medium">Incoming</p>
                  <p className="text-2xl font-bold text-purple-700">{itemRequests?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="elevation-2 border-0 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-500 rounded-xl">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-orange-600 font-medium">Trust Score</p>
                  <p className="text-2xl font-bold text-orange-700">{user.trustScore || 100}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="browse" className="space-y-6">
          {/* Make tabs scrollable on mobile */}
          <TabsList className="flex w-full overflow-x-auto gap-2 bg-white elevation-1 p-1 rounded-lg">
            <TabsTrigger value="browse" className="whitespace-nowrap flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">
              Browse Items
            </TabsTrigger>
            <TabsTrigger value="my-items" className="whitespace-nowrap flex-shrink-0">My Items</TabsTrigger>
            <TabsTrigger value="requests" className="whitespace-nowrap flex-shrink-0">My Requests</TabsTrigger>
            <TabsTrigger value="incoming" className="whitespace-nowrap flex-shrink-0">Incoming</TabsTrigger>
          </TabsList>

          {/* Browse Items Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="elevation-2 border-0">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search for clothes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    {/* Stack filters on mobile, 3 columns from sm+ */}
                    <div className="grid w-full grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Category */}
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="tops">Tops</SelectItem>
                          <SelectItem value="bottoms">Bottoms</SelectItem>
                          <SelectItem value="dresses">Dresses</SelectItem>
                          <SelectItem value="outerwear">Outerwear</SelectItem>
                          <SelectItem value="shoes">Shoes</SelectItem>
                          <SelectItem value="accessories">Accessories</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Mode */}
                      <Select value={selectedMode} onValueChange={setSelectedMode}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Modes</SelectItem>
                          <SelectItem value="exchange">Exchange</SelectItem>
                          <SelectItem value="borrow">Borrow</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Size */}
                      <Select value={selectedSize} onValueChange={setSelectedSize}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sizes</SelectItem>
                          <SelectItem value="xs">XS</SelectItem>
                          <SelectItem value="s">S</SelectItem>
                          <SelectItem value="m">M</SelectItem>
                          <SelectItem value="l">L</SelectItem>
                          <SelectItem value="xl">XL</SelectItem>
                          <SelectItem value="xxl">XXL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Distance filter row */}
                    <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">Distance</Badge>
                        <Select
                          value={String(radiusKm)}
                          onValueChange={(v) => setRadiusKm(parseInt(v))}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Radius (km)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 km</SelectItem>
                            <SelectItem value="10">10 km</SelectItem>
                            <SelectItem value="25">25 km</SelectItem>
                            <SelectItem value="50">50 km</SelectItem>
                            <SelectItem value="100">100 km</SelectItem>
                          </SelectContent>
                        </Select>
                        {userLocation ? (
                          <span className="text-xs text-green-600">Location set ✓</span>
                        ) : (
                          <span className="text-xs text-gray-500">Set your location</span>
                        )}
                      </div>
                      <div className="flex justify-start sm:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={requestLocation}
                          disabled={locLoading}
                          className="whitespace-nowrap"
                        >
                          {locLoading ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-pulse" />
                              Getting location...
                            </>
                          ) : (
                            <>
                              <Crosshair className="h-4 w-4 mr-2" />
                              Use my location
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Items Grid */}
            {itemsLoading ? (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="h-full border-0 elevation-2 overflow-hidden">
                    <Skeleton className="aspect-square w-full" />
                    <CardContent className="p-3 sm:p-4 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-12 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                        <div className="ml-auto">
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Skeleton className="h-7 w-7 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              >
                {distanceFilteredItems.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ y: -5 }}
                    className="group cursor-pointer"
                    onClick={() => handleItemClick(item._id)}
                  >
                    <Card className="h-full border-0 elevation-2 hover:elevation-4 transition-all duration-300 overflow-hidden">
                      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Shirt className="h-16 w-16 text-gray-400" />
                          </div>
                        )}

                        {/* Hover gradient overlay */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Mode badge (top-left) */}
                        <div className="absolute top-3 left-3">
                          <Badge className={getModeColor(item.mode)}>
                            {item.mode === "exchange" && "Exchange"}
                            {item.mode === "borrow" && "Borrow"}
                            {item.mode === "both" && "Both"}
                          </Badge>
                        </div>

                        {/* Price badge (top-right) */}
                        {item.borrowFee && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-white text-gray-700 shadow-sm">
                              ₹{item.borrowFee}
                            </Badge>
                          </div>
                        )}

                        {/* Favorite button (non-functional UI) */}
                        <button
                          aria-label="favorite"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-white/80 backdrop-blur-md text-gray-700 hover:text-rose-600 shadow-sm flex items-center justify-center transition-colors"
                        >
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <CardContent className="p-3 sm:p-4 space-y-3">
                        <div>
                          {/* Slightly smaller title on mobile */}
                          <h3 className="font-semibold text-base sm:text-lg text-gray-900 line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        {/* Details chips */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {item.size.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {item.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {item.condition}
                          </Badge>
                          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-2xs">
                            <MapPin className="h-3 w-3" />
                            {item.location || "Local"}
                          </span>
                        </div>

                        {/* Owner */}
                        <div className="flex items-center gap-2 pt-1">
                          <div className="relative">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-[11px] ring-2 ring-white">
                              {item.owner?.name?.[0]?.toUpperCase() || "U"}
                            </div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {item.owner?.name || "Anonymous"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {distanceFilteredItems.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Shirt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600">
                  {userLocation
                    ? "Try increasing the distance or adjusting your search."
                    : "Set your location to filter by distance, or adjust your filters."}
                </p>
              </motion.div>
            )}
          </TabsContent>

          {/* My Items Tab */}
          <TabsContent value="my-items" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Items</h2>
              <Button
                onClick={() => {
                  setIsNavigatingAdd(true);
                  navigate("/add-item");
                }}
                disabled={isNavigatingAdd}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                {isNavigatingAdd ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Opening...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Item
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myItems?.map((item) => (
                <Card key={item._id} className="elevation-2 border-0 hover:elevation-3 transition-all duration-300">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Shirt className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge className={item.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-3 sm:p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={getModeColor(item.mode)}>
                        {item.mode}
                      </Badge>
                      {item.borrowFee && (
                        <span className="text-sm font-medium text-gray-700">₹{item.borrowFee}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {myItems?.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No items yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your first item to exchange or lend</p>
                <Button
                  onClick={() => {
                    setIsNavigatingAdd(true);
                    navigate("/add-item");
                  }}
                  disabled={isNavigatingAdd}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {isNavigatingAdd ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Opening...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Item
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* My Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Requests</h2>
            
            <div className="space-y-4">
              {myRequests?.map((request) => (
                <Card key={request._id} className="elevation-2 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {request.item?.images?.[0] ? (
                          <img
                            src={request.item.images[0]}
                            alt={request.item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Shirt className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{request.item?.title}</h3>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                          <Badge className={getModeColor(request.type)}>
                            {request.type}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">Owner: {request.owner?.name}</p>
                        {request.message && (
                          <p className="text-sm text-gray-500 italic">"{request.message}"</p>
                        )}
                        {request.fee && (
                          <p className="text-sm font-medium text-green-600 mt-2">Fee: ₹{request.fee}</p>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2">
{request.status === "accepted" && (
  <Button
    size="sm"
    onClick={() => {
      setChatLoadingId(request._id);
      navigate(`/chat/${request._id}`);
    }}
    disabled={chatLoadingId === request._id}
    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white disabled:opacity-70"
  >
    {chatLoadingId === request._id ? (
      <>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Opening...
      </>
    ) : (
      <>
        <MessageCircle className="h-4 w-4 mr-2" />
        Chat
      </>
    )}
  </Button>
)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {myRequests?.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests yet</h3>
                <p className="text-gray-600">Browse items and make your first request</p>
              </div>
            )}
          </TabsContent>

          {/* Incoming Requests Tab */}
          <TabsContent value="incoming" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Incoming Requests</h2>
            
            <div className="space-y-4">
              {itemRequests?.map((request) => (
                <Card key={request._id} className="elevation-2 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {request.item?.images?.[0] ? (
                          <img
                            src={request.item.images[0]}
                            alt={request.item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Shirt className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{request.item?.title}</h3>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                          <Badge className={getModeColor(request.type)}>
                            {request.type}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">Requested by: {request.requester?.name}</p>
                        {request.message && (
                          <p className="text-sm text-gray-500 italic">"{request.message}"</p>
                        )}
                        {request.fee && (
                          <p className="text-sm font-medium text-green-600 mt-2">Fee: ₹{request.fee}</p>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        {request.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {/* Handle accept */}}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {/* Handle reject */}}
                            >
                              Reject
                            </Button>
                          </>
                        )}
{request.status === "accepted" && (
  <Button
    size="sm"
    onClick={() => {
      setChatLoadingId(request._id);
      navigate(`/chat/${request._id}`);
    }}
    disabled={chatLoadingId === request._id}
    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white disabled:opacity-70"
  >
    {chatLoadingId === request._id ? (
      <>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Opening...
      </>
    ) : (
      <>
        <MessageCircle className="h-4 w-4 mr-2" />
        Chat
      </>
    )}
  </Button>
)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {itemRequests?.length === 0 && (
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No incoming requests</h3>
                <p className="text-gray-600">Add more items to receive requests from other users</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}