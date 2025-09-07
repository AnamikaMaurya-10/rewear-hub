import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Shirt, IndianRupee, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";

export default function ItemDetail() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { itemId } = useParams();
  const createRequest = useMutation(api.requests.create);

  const item = useQuery(
    api.items.getById,
    itemId ? { itemId: itemId as Id<"items"> } : "skip"
  );

  const [message, setMessage] = useState("");
  const [activeImage, setActiveImage] = useState(0);

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

  const canExchange = item?.mode === "exchange" || item?.mode === "both";
  const canBorrow = item?.mode === "borrow" || item?.mode === "both";

  const getModeColor = (mode?: string) => {
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

  const handleRequest = async (type: "exchange" | "borrow") => {
    if (!item?._id) return;
    if (user._id === item.ownerId) {
      toast.error("You cannot request your own item");
      return;
    }
    if (type === "borrow" && !item.borrowFee) {
      toast.error("Borrow fee is not set for this item");
      return;
    }
    try {
      await createRequest({
        itemId: item._id,
        type,
        message: message || undefined,
      });
      if (type === "borrow") {
        toast.success("Payment Successful (simulated) ✅");
      } else {
        toast.success("Request sent!");
      }
      navigate("/dashboard");
    } catch (e: any) {
      toast.error(e?.message || "Failed to send request");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy link");
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
              onClick={() => navigate(-1)}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center elevation-2">
                <Shirt className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Item Details</h1>
                <p className="text-sm text-gray-600">Explore and request this item</p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-0 elevation-2 overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                {item?.images?.[0] ? (
                  <img
                    src={item.images[activeImage] || item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Shirt className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge className={getModeColor(item?.mode)}>{item?.mode}</Badge>
                </div>
                {item?.borrowFee ? (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white text-gray-700 flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      {item.borrowFee}
                    </Badge>
                  </div>
                ) : null}
              </div>

              {/* Thumbnails */}
              {item?.images && item.images.length > 1 ? (
                <div className="p-3 bg-white/70 backdrop-blur-sm border-t border-gray-100">
                  <div className="flex gap-2 overflow-x-auto">
                    {item.images.map((img, idx) => (
                      <button
                        key={img + idx}
                        onClick={() => setActiveImage(idx)}
                        className={`h-16 w-16 rounded-md overflow-hidden border transition-all ${
                          activeImage === idx ? "ring-2 ring-purple-500 border-transparent" : "border-gray-200"
                        }`}
                        aria-label={`Preview ${idx + 1}`}
                      >
                        <img src={img} alt={`thumb-${idx}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </Card>

            <div className="space-y-6">
              <Card className="border-0 elevation-2">
                <CardHeader>
                  <CardTitle className="text-2xl">{item?.title || "Loading..."}</CardTitle>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge className={getModeColor(item?.mode)}>{item?.mode}</Badge>
                    {item?.borrowFee ? (
                      <Badge className="bg-white text-gray-700 border border-gray-200">
                        <IndianRupee className="h-3 w-3 mr-1" />
                        {item.borrowFee}
                      </Badge>
                    ) : null}
                    <div className="ml-auto">
                      <Button variant="outline" size="sm" onClick={handleShare} className="elevation-1">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{item?.description}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Badge variant="outline" className="text-xs">
                        Size: {item?.size?.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Badge variant="outline" className="text-xs capitalize">
                        Category: {item?.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Badge variant="outline" className="text-xs capitalize">
                        Condition: {item?.condition}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{item?.location || "Local"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-sm">
                      {item?.owner?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-800 font-medium">{item?.owner?.name || "Anonymous"}</p>
                      <p className="text-gray-500">{item?.owner?.email || ""}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 elevation-2">
                <CardHeader>
                  <CardTitle>Request This Item</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Optional message to the owner..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="elevation-1"
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    {canExchange && (
                      <Button
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white ripple"
                        onClick={() => handleRequest("exchange")}
                      >
                        Request Exchange
                      </Button>
                    )}
                    {canBorrow && (
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white ripple"
                        onClick={() => handleRequest("borrow")}
                      >
                        <IndianRupee className="h-4 w-4 mr-2" />
                        Request Borrow
                      </Button>
                    )}
                    {!canExchange && !canBorrow && (
                      <Button disabled className="flex-1">
                        Not available
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    You'll be able to chat once your request is accepted.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}