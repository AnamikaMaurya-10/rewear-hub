import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Shirt, 
  Camera,
  MapPin,
  IndianRupee
} from "lucide-react";

export default function AddItem() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const createItem = useMutation(api.items.create);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    size: "",
    condition: "",
    mode: "",
    borrowFee: "",
    borrowDuration: "",
    location: "",
  });

  const [images, setImages] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const remainingSlots = Math.max(0, 5 - images.length);
      const selected = Array.from(files).slice(0, remainingSlots);

      // Optional: basic filter to accept only image files
      const imageFiles = selected.filter((f) => f.type.startsWith("image/"));

      const dataUrls = await Promise.all(imageFiles.map((file) => readFileAsDataURL(file)));
      setImages((prev) => [...prev, ...dataUrls]);
      toast.success(`${dataUrls.length} image${dataUrls.length > 1 ? "s" : ""} added`);
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Failed to load selected images");
    } finally {
      // Reset input so same file selection can be re-chosen if needed
      e.currentTarget.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category || !formData.size || !formData.condition || !formData.mode) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.mode === "borrow" && (!formData.borrowFee || !formData.borrowDuration)) {
      toast.error("Please set borrow fee and duration for borrow mode");
      return;
    }

    setIsSubmitting(true);

    try {
      await createItem({
        title: formData.title,
        description: formData.description,
        images: images,
        category: formData.category as any,
        size: formData.size as any,
        condition: formData.condition,
        mode: formData.mode as any,
        borrowFee: formData.borrowFee ? parseInt(formData.borrowFee) : undefined,
        borrowDuration: formData.borrowDuration ? parseInt(formData.borrowDuration) : undefined,
        location: formData.location || undefined,
      });

      toast.success("Item added successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error("Failed to add item. Please try again.");
    } finally {
      setIsSubmitting(false);
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
                <h1 className="text-xl font-bold text-gray-900">Add New Item</h1>
                <p className="text-sm text-gray-600">Share your clothes with the community</p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="elevation-2 border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shirt className="h-5 w-5 text-purple-600" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Item Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Vintage Denim Jacket"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="elevation-1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger className="elevation-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tops">Tops</SelectItem>
                        <SelectItem value="bottoms">Bottoms</SelectItem>
                        <SelectItem value="dresses">Dresses</SelectItem>
                        <SelectItem value="outerwear">Outerwear</SelectItem>
                        <SelectItem value="shoes">Shoes</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item in detail - brand, material, style, etc."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    className="elevation-1"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="size">Size *</Label>
                    <Select value={formData.size} onValueChange={(value) => handleInputChange("size", value)}>
                      <SelectTrigger className="elevation-1">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xs">XS</SelectItem>
                        <SelectItem value="s">S</SelectItem>
                        <SelectItem value="m">M</SelectItem>
                        <SelectItem value="l">L</SelectItem>
                        <SelectItem value="xl">XL</SelectItem>
                        <SelectItem value="xxl">XXL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                      <SelectTrigger className="elevation-1">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        placeholder="Your area/city"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        className="pl-10 elevation-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="elevation-2 border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5 text-blue-600" />
                  <span>Photos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden elevation-1">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  
                  {images.length < 5 && (
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors elevation-1">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Add Photo</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Add up to 5 photos. First photo will be the main image.
                </p>
              </CardContent>
            </Card>

            {/* Mode Selection */}
            <Card className="elevation-2 border-0">
              <CardHeader>
                <CardTitle>Availability Mode *</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.mode === "exchange"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                    onClick={() => handleInputChange("mode", "exchange")}
                  >
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Shirt className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-green-700">Exchange Only</h3>
                      <p className="text-sm text-gray-600">Permanent swap, completely free</p>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.mode === "borrow"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => handleInputChange("mode", "borrow")}
                  >
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <IndianRupee className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-blue-700">Borrow Only</h3>
                      <p className="text-sm text-gray-600">Rent for events and occasions</p>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.mode === "both"
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                    onClick={() => handleInputChange("mode", "both")}
                  >
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                        <Shirt className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-purple-700">Both</h3>
                      <p className="text-sm text-gray-600">Available for exchange or borrow</p>
                    </div>
                  </div>
                </div>

                {(formData.mode === "borrow" || formData.mode === "both") && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="grid md:grid-cols-2 gap-6 pt-4 border-t"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="borrowFee">Borrow Fee (₹) *</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="borrowFee"
                          type="number"
                          placeholder="50"
                          value={formData.borrowFee}
                          onChange={(e) => handleInputChange("borrowFee", e.target.value)}
                          className="pl-10 elevation-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="borrowDuration">Duration (days) *</Label>
                      <Input
                        id="borrowDuration"
                        type="number"
                        placeholder="3"
                        value={formData.borrowDuration}
                        onChange={(e) => handleInputChange("borrowDuration", e.target.value)}
                        className="elevation-1"
                      />
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="px-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 elevation-2"
              >
                {isSubmitting ? "Adding Item..." : "Add Item"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}