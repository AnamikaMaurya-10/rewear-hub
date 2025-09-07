import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useState } from "react";
import { 
  Recycle, 
  Heart, 
  Users, 
  Shirt, 
  ArrowRight, 
  Sparkles,
  Leaf,
  Clock,
  Star,
  TrendingUp
} from "lucide-react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useScroll, useTransform } from "framer-motion";

export default function Landing() {
  const { isAuthenticated, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { scrollYProgress } = useScroll();
  const yLayer1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const yLayer2 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const yLayer3 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const yLayer4 = useTransform(scrollYProgress, [0, 1], [0, -300]);

  const handleGetStarted = () => {
    setIsNavigating(true);
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsNavigating(true);
    const q = searchTerm.trim();
    navigate(q ? `/dashboard?q=${encodeURIComponent(q)}` : "/dashboard");
  };

  const features = [
    {
      icon: <Recycle className="h-8 w-8" />,
      title: "Exchange Mode",
      description: "Swap clothes permanently with others. Give one item, get another. Completely free!",
      color: "text-green-600"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Borrow Mode", 
      description: "Rent clothes for special events. Perfect for parties, festivals, and occasions.",
      color: "text-blue-600"
    },
    {
      icon: <Leaf className="h-8 w-8" />,
      title: "Sustainable Fashion",
      description: "Reduce waste and promote circular fashion. Every exchange saves the planet.",
      color: "text-emerald-600"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Driven",
      description: "Connect with fashion lovers in your area. Build trust through our rating system.",
      color: "text-purple-600"
    }
  ];

  const stats = [
    { number: "10K+", label: "Items Exchanged", icon: <Shirt className="h-5 w-5" /> },
    { number: "5K+", label: "Happy Users", icon: <Heart className="h-5 w-5" /> },
    { number: "2K+", label: "Successful Borrows", icon: <Clock className="h-5 w-5" /> },
    { number: "4.8", label: "Average Rating", icon: <Star className="h-5 w-5" /> }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 relative overflow-hidden">
      {/* Parallax background layers */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-br from-purple-400/30 to-blue-400/30 blur-3xl"
        style={{ y: yLayer1 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-green-400/20 to-blue-400/20 blur-2xl"
        style={{ y: yLayer2 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-2/3 left-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-pink-400/20 to-purple-400/20 blur-2xl"
        style={{ y: yLayer3 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-1/3 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-blue-400/15 to-indigo-400/15 blur-[90px]"
        style={{ y: yLayer4 }}
      />

      {/* Navigation */}
      <motion.nav 
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
              <Button variant="ghost" className="hidden md:inline-flex">
                How it Works
              </Button>
              <Button variant="ghost" className="hidden md:inline-flex">
                Community
              </Button>
              {isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  disabled={isLoggingOut || isNavigating}
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    "Logout"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with center CTAs and 3D feel */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Centered Login Button Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center"
        >
          <div className="pointer-events-auto relative group" style={{ perspective: 1000 }}>
            {/* Depth glow shadow */}
            <div className="absolute -inset-1 translate-y-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 blur-md opacity-50 group-hover:opacity-70 transition-all" />
            <motion.div
              whileHover={{ rotateX: -6, rotateY: 6, y: -3, scale: 1.03 }}
              whileTap={{ y: 2, scale: 0.985 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative"
            >
              {/* Button base (gives a 3D platform look) */}
              <div className="absolute -inset-x-4 -bottom-3 h-3 bg-gradient-to-b from-purple-900/25 to-blue-900/20 rounded-2xl blur-md opacity-80 -z-10" />
              <div className="absolute inset-x-2 -bottom-2 h-2 bg-gradient-to-b from-purple-700/25 to-blue-700/20 rounded-xl blur-sm opacity-90 -z-10" />

              <Button
                onClick={handleGetStarted}
                disabled={isNavigating}
                className="relative h-14 px-9 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg elevation-3 shadow-[0_14px_32px_rgba(79,70,229,0.35),0_6px_14px_rgba(59,130,246,0.25)] border border-white/10 transform-gpu will-change-transform ring-1 ring-white/15"
              >
                {/* Subtle top shine */}
                <span className="pointer-events-none absolute inset-x-0 -top-1 h-1/2 bg-white/10 blur-md rounded-t-2xl" />
                {/* Inner gradient edge for depth */}
                <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />

                {isNavigating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {isAuthenticated ? "Go to Dashboard" : "Login / Get Started"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 perspective-[1200px]">
          <div className="grid grid-cols-1 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Sustainable Fashion Revolution
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
                    Exchange
                  </span>{" "}
                  &{" "}
                  <span className="bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
                    Borrow
                  </span>
                  <br />
                  <span className="text-gray-900">Clothes Easily</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Join the sustainable fashion movement. Exchange clothes permanently or borrow for special occasions. 
                  Reduce waste, save money, and discover new styles.
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search items (e.g., denim jacket, party dress)..."
                    className="pl-10 pr-28 h-12"
                    disabled={isNavigating}
                  />
                  <Button
                    type="submit"
                    disabled={isNavigating}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    {isNavigating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Search"
                    )}
                  </Button>
                </form>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center space-x-2 text-2xl font-bold text-gray-900">
                      {stat.icon}
                      <span>{stat.number}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section with light 3D hover */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900">
              Why Choose <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">ReWear</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of fashion with our innovative exchange and borrow platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, rotateX: -2, rotateY: 1.5, z: 8 }}
                style={{ transformStyle: "preserve-3d" }}
                className="group"
              >
                <Card className="h-full border-0 elevation-2 hover:elevation-4 transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-8 text-center space-y-4">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Ready to Transform Your Wardrobe?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join thousands of fashion enthusiasts who are already exchanging and borrowing clothes sustainably.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={handleGetStarted}
                disabled={isNavigating}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-8 py-6 ripple elevation-3 disabled:opacity-70"
              >
                {isNavigating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {isAuthenticated ? "Go to Dashboard" : "Start Exchanging"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 hover:bg-gray-50 elevation-1"
                disabled={isNavigating}
              >
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Shirt className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">ReWear</span>
              </div>
              <p className="text-gray-400">
                Sustainable fashion through community-driven exchange and borrowing.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ReWear. All rights reserved. Built with sustainability in mind.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}