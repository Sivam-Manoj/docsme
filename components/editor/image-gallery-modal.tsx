"use client";

import { useState, useEffect } from "react";
import { X, Upload, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
}

interface UserImage {
  _id: string;
  url: string;
  filename: string;
  uploadedAt: string;
}

export function ImageGalleryModal({
  isOpen,
  onClose,
  onSelectImage,
}: ImageGalleryModalProps) {
  const [images, setImages] = useState<UserImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Fetch user's images
  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/user/images");
      setImages(response.data.images || []);
    } catch (error) {
      console.error("Failed to fetch images:", error);
      toast.error("Failed to load images");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post("/api/user/images/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Image uploaded successfully!");
        setImages([response.data.image, ...images]);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.error || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await axios.delete(`/api/user/images/${imageId}`);
      setImages(images.filter((img) => img._id !== imageId));
      toast.success("Image deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete image");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="bg-violet-100 p-2 rounded-lg">
                <ImageIcon className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Image Gallery</h2>
                <p className="text-sm text-gray-500">Select or upload an image</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Upload Area */}
          <div className="p-6 border-b">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-violet-500 bg-violet-50"
                  : "border-gray-300 hover:border-violet-400"
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                  <p className="text-sm text-gray-600">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Drop an image here or click to upload
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                  <label className="cursor-pointer">
                    <Button size="sm" className="mt-2" asChild>
                      <span>Choose File</span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Gallery */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No images yet. Upload your first image!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image._id}
                    className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-violet-500 cursor-pointer transition-all"
                    onClick={() => {
                      onSelectImage(image.url);
                      onClose();
                      toast.success("Image added to document");
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(image._id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all transform scale-90 group-hover:scale-100"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
