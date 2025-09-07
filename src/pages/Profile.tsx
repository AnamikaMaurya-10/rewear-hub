import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { ArrowLeft, Shirt, Package, MessageCircle, Star } from "lucide-react";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const myItems = useQuery(api.items.getMyItems);
  const myRequests = useQuery(api.requests.getMyRequests);

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

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "exchange":
        return "bg-green-100 text-green-700 border-green-200";
      case "borrow":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "both":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 elevation-1"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center elevation-2">
                <Shirt className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-600">Manage your items and requests</p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <Card className="border-0 elevation-2">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-2xl">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900">{user.name || "User"}</h2>
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Trust {user.trustScore || 100}
                  </Badge>
                </div>
                <p className="text-gray-600">{user.email}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="elevation-1"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <Card className="border-0 elevation-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                My Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myItems?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {myItems?.map((item) => (
                    <Card key={item._id} className="elevation-2 border-0">
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
                      <CardContent className="p-4 space-y-2">
                        <div className="font-semibold text-gray-900">{item.title}</div>
                        <div className="flex items-center justify-between">
                          <Badge className={getModeColor(item.mode)}>{item.mode}</Badge>
                          {item.borrowFee && (
                            <span className="text-sm text-gray-700">₹{item.borrowFee}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-600 py-8">
                  You haven’t listed any items yet.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <Card className="border-0 elevation-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                My Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {myRequests?.length ? (
                myRequests.map((request) => (
                  <Card key={request._id} className="elevation-1 border-0">
                    <CardContent className="p-4 flex items-center gap-4">
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
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold">{request.item?.title}</div>
                          <Badge variant="outline">{request.status}</Badge>
                          <Badge className={getModeColor(request.type)}>{request.type}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Owner: {request.owner?.name}
                          {request.fee ? <span className="ml-2 text-green-600">₹{request.fee}</span> : null}
                        </div>
                      </div>
                      {request.status === "accepted" && (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/chat/${request._id}`)}
                          className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                        >
                          Open Chat
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center text-gray-600 py-8">
                  No requests yet. Browse items and send your first request!
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
