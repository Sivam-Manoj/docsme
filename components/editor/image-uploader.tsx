"use client";

import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploaderProps {
  onInsert: (imageData: { src: string; alt: string; caption?: string }) => void;
  onClose: () => void;
}

export function ImageUploader({ onInsert, onClose }: ImageUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageCaption, setImageCaption] = useState<string>("");
  const [imageWidth, setImageWidth] = useState<string>("100%");
  const [imageAlign, setImageAlign] = useState<"left" | "center" | "right">("center");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInsert = () => {
    if (!selectedImage || !imagePreview) {
      toast.error("Please select an image");
      return;
    }

    // Pass image data object instead of HTML
    onInsert({
      src: imagePreview,
      alt: imageCaption || 'Image',
      caption: imageCaption || undefined
    });
    
    toast.success("Image inserted successfully!");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold">Insert Image</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="text-sm font-bold text-gray-900 mb-3 block">Select Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {!selectedImage || !imagePreview ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-6 py-8 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-3"
              >
                <Upload className="w-12 h-12 text-blue-500" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700">Click to upload image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                </div>
              </button>
            ) : (
              <div className="relative border-2 border-blue-300 rounded-xl overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                  unoptimized
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Caption */}
          {selectedImage && (
            <>
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Caption (Optional)</label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="e.g., Figure 1: Sales growth over time"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                />
              </div>

              {/* Width */}
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Width</label>
                <div className="grid grid-cols-4 gap-2">
                  {["100%", "75%", "50%", "25%"].map((width) => (
                    <button
                      key={width}
                      onClick={() => setImageWidth(width)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                        imageWidth === width
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {width}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alignment */}
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Alignment</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "left", label: "Left" },
                    { value: "center", label: "Center" },
                    { value: "right", label: "Right" },
                  ].map((align) => (
                    <button
                      key={align.value}
                      onClick={() => setImageAlign(align.value as any)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                        imageAlign === align.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {align.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex gap-3 rounded-b-2xl">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleInsert}
            disabled={!selectedImage}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Insert Image
          </Button>
        </div>
      </div>
    </div>
  );
}
