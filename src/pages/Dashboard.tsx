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
import { 
  Plus, 
  Search, 
  Filter, 
  Heart, 
  Clock, 
  MapPin, 
  Star,
  Shirt,
  Package,
  MessageCircle,
  TrendingUp
} from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMode, setSelectedMode] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("all");

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 elevation-1"
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
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate("/add-item")}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white ripple elevation-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
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
            </div>
          </div>
        </div>
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
          <TabsList className="grid w-full grid-cols-4 bg-white elevation-1">
            <TabsTrigger value="browse" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">
              Browse Items
            </TabsTrigger>
            <TabsTrigger value="my-items">My Items</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="incoming">Incoming</TabsTrigger>
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
                    
                    <div className="flex gap-4">
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-40">
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

                      <Select value={selectedMode} onValueChange={setSelectedMode}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Modes</SelectItem>
                          <SelectItem value="exchange">Exchange</SelectItem>
                          <SelectItem value="borrow">Borrow</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={selectedSize} onValueChange={setSelectedSize}>
                        <SelectTrigger className="w-24">
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
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Items Grid */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredItems.map((item, index) => (
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
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Shirt className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge className={getModeColor(item.mode)}>
                          {item.mode === "exchange" && "Exchange"}
                          {item.mode === "borrow" && "Borrow"}
                          {item.mode === "both" && "Both"}
                        </Badge>
                      </div>
                      {item.borrowFee && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-white text-gray-700">
                            ₹{item.borrowFee}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {item.size.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{item.location || "Local"}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-xs">
                          {item.owner?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <span className="text-sm text-gray-600">{item.owner?.name || "Anonymous"}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {filteredItems.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Shirt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </motion.div>
            )}
          </TabsContent>

          {/* My Items Tab */}
          <TabsContent value="my-items" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Items</h2>
              <Button
                onClick={() => navigate("/add-item")}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
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
                  
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
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
                  onClick={() => navigate("/add-item")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Item
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
                            onClick={() => navigate(`/chat/${request._id}`)}
                            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat
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
                            onClick={() => navigate(`/chat/${request._id}`)}
                            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat
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