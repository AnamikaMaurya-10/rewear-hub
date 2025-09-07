import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Chat() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { requestId } = useParams();
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(
    api.messages.getByRequest,
    requestId ? { requestId: requestId as Id<"requests"> } : "skip"
  );

  const sendMessage = useMutation(api.messages.send);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages?.length]);

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

  const handleSend = async () => {
    if (!text.trim() || !requestId) return;
    try {
      await sendMessage({
        requestId: requestId as Id<"requests">,
        content: text.trim(),
      });
      setText("");
    } catch (e: any) {
      toast.error(e?.message || "Failed to send message");
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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center elevation-2">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Chat</h1>
                <p className="text-sm text-gray-600">Coordinate pickup and details</p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="border-0 elevation-2">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              ref={listRef}
              className="h-[60vh] overflow-y-auto rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-4 elevation-1"
            >
              <div className="space-y-3">
                {messages?.map((m) => {
                  const mine = m.senderId === (user as any)?._id;
                  return (
                    <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm elevation-1 ${
                          mine
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                            : "bg-white text-gray-800"
                        }`}
                      >
                        <div className="text-xs opacity-80 mb-1">
                          {mine ? "You" : m.sender?.name || "User"}
                        </div>
                        <div>{m.content}</div>
                      </div>
                    </div>
                  );
                })}
                {!messages?.length && (
                  <div className="text-center text-gray-500 text-sm py-8">
                    No messages yet. Say hello!
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 elevation-1"
              />
              <Button
                onClick={handleSend}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white ripple"
              >
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}