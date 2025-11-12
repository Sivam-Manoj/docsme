"use client";

import { useRef } from "react";
import { Upload, X, Image as ImageIcon, FileText } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface FileUploaderProps {
  uploadedImages: File[];
  uploadedPDF: File | null;
  onImagesChange: (images: File[]) => void;
  onPDFChange: (pdf: File | null) => void;
  disabled?: boolean;
}

export function FileUploader({
  uploadedImages,
  uploadedPDF,
  onImagesChange,
  onPDFChange,
  disabled = false,
}: FileUploaderProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (uploadedImages.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    
    const validFiles: File[] = [];
    let totalSize = uploadedImages.reduce((sum, f) => sum + f.size, 0);
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      
      if (totalSize + file.size > 15 * 1024 * 1024) {
        toast.error("Total size exceeds 15MB");
        break;
      }
      
      validFiles.push(file);
      totalSize += file.size;
    }
    
    onImagesChange([...uploadedImages, ...validFiles]);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Clear input first
    if (pdfInputRef.current) pdfInputRef.current.value = '';
    
    if (file.type !== 'application/pdf') {
      toast.error("Please upload a PDF file");
      return;
    }
    
    if (file.size > 15 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`PDF is too large (${sizeMB}MB). Maximum size is 15MB.`);
      return;
    }
    
    onPDFChange(file);
  };

  const removeImage = (index: number) => {
    onImagesChange(uploadedImages.filter((_, i) => i !== index));
  };

  const removePDF = () => {
    onPDFChange(null);
  };

  const hasFiles = uploadedImages.length > 0 || uploadedPDF !== null;
  
  // Calculate total image size
  const totalImageSize = uploadedImages.reduce((sum, f) => sum + f.size, 0);
  const isImageLimitReached = uploadedImages.length >= 5 || totalImageSize >= 15 * 1024 * 1024;

  return (
    <div className="space-y-2">
      {/* Upload Buttons */}
      <div className="flex gap-2">
        {/* Image Upload */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
          disabled={disabled}
        />
        <button
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled || isImageLimitReached}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title={isImageLimitReached ? "Image limit reached (max 5 or 15MB)" : "Upload images (max 5, 15MB total)"}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Images</span>
          <span className="sm:hidden">📷</span>
        </button>

        {/* PDF Upload */}
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          onChange={handlePDFUpload}
          className="hidden"
          disabled={disabled}
        />
        <button
          onClick={() => pdfInputRef.current?.click()}
          disabled={disabled || uploadedPDF !== null}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title={uploadedPDF ? "PDF already uploaded" : "Upload PDF (max 15MB)"}
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PDF</span>
          <span className="sm:hidden">📄</span>
        </button>
      </div>

      {/* Uploaded Files Display */}
      {hasFiles && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg border border-violet-200">
          {/* Images */}
          {uploadedImages.map((file, idx) => {
            const imageUrl = URL.createObjectURL(file);
            return (
              <div
                key={idx}
                className="relative group"
              >
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 border-violet-300 bg-white shadow-sm">
                  <Image
                    src={imageUrl}
                    alt={file.name}
                    fill
                    className="object-cover"
                    onLoad={() => URL.revokeObjectURL(imageUrl)}
                  />
                </div>
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-all"
                  title={`Remove ${file.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* PDF */}
          {uploadedPDF && (
            <div className="relative flex items-center gap-2 px-3 py-2 bg-white rounded-lg border-2 border-pink-300 shadow-sm min-w-0">
              <FileText className="w-4 h-4 text-pink-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-gray-700 truncate block max-w-[120px] sm:max-w-[180px]">
                  {uploadedPDF.name}
                </span>
                <span className="text-[10px] text-gray-500">
                  {(uploadedPDF.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <button
                onClick={removePDF}
                className="absolute -top-1 -right-1 shrink-0 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-all"
                title={`Remove ${uploadedPDF.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      {hasFiles && (
        <p className="text-[10px] text-gray-500 text-center">
          {uploadedImages.length > 0 && `${uploadedImages.length} image${uploadedImages.length > 1 ? 's' : ''}`}
          {uploadedImages.length > 0 && uploadedPDF && ' • '}
          {uploadedPDF && '1 PDF'}
        </p>
      )}
    </div>
  );
}
