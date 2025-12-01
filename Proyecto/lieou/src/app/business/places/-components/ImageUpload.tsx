"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useRef, useState, DragEvent, useEffect } from "react";

interface ImagePreview {
  file: File;
  preview: string;
  id: string;
}

export interface ExistingImage {
  id: number;
  url: string;
}

interface ImageUploadProps {
  /** New files to upload */
  files: File[];
  onFilesChange: (files: File[]) => void;
  /** Existing images from the server */
  existingImages?: ExistingImage[];
  onRemoveExisting?: (id: number) => void;
  disabled?: boolean;
  maxImages?: number;
}

export function ImageUpload({
  files,
  onFilesChange,
  existingImages = [],
  onRemoveExisting,
  disabled,
  maxImages = 6,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputMoreRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<ImagePreview[]>([]);

  // Calculate how many total images we have and how many more we can add
  const totalImages = existingImages.length + previews.length;
  const canAddMore = totalImages < maxImages;
  const remainingSlots = maxImages - existingImages.length;

  // Sync previews with files prop
  useEffect(() => {
    // Clean up old previews that are no longer in files
    const currentFiles = new Set(files);
    const toRevoke = previews.filter((p) => !currentFiles.has(p.file));
    toRevoke.forEach((p) => URL.revokeObjectURL(p.preview));

    // Create previews for new files
    const existingFiles = new Set(previews.map((p) => p.file));
    const newFiles = files.filter((f) => !existingFiles.has(f));
    const newPreviews: ImagePreview[] = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    // Keep existing previews for files still in value
    const keptPreviews = previews.filter((p) => currentFiles.has(p.file));

    setPreviews([...keptPreviews, ...newPreviews]);

    // Cleanup on unmount
    return () => {
      newPreviews.forEach((p) => URL.revokeObjectURL(p.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const totalAllowed = remainingSlots - files.length;
      const filesToAdd = newFiles.slice(0, totalAllowed);
      onFilesChange([...files, ...filesToAdd]);
    }
    // Reset input so same file can be selected again if deleted
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    if (inputMoreRef.current) {
      inputMoreRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    const preview = previews.find((p) => p.id === id);
    if (preview) {
      URL.revokeObjectURL(preview.preview);
      const newFiles = files.filter((f) => f !== preview.file);
      onFilesChange(newFiles);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!disabled && canAddMore) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || !canAddMore) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const newFiles = Array.from(droppedFiles).filter((f) =>
        f.type.startsWith("image/")
      );
      const totalAllowed = remainingSlots - files.length;
      const filesToAdd = newFiles.slice(0, totalAllowed);
      onFilesChange([...files, ...filesToAdd]);
    }
  };

  // No images at all - show empty upload state
  if (existingImages.length === 0 && previews.length === 0) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed transition-all ${
          isDragging
            ? "border-[#fd5564] bg-red-50"
            : "border-gray-300 bg-gray-50 hover:border-[#fd5564] hover:bg-red-50/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          id="image-upload"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
          disabled={disabled}
        />
        <label
          htmlFor="image-upload"
          className={`flex flex-col items-center justify-center px-6 py-16 ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <div className="mb-4 rounded-full bg-gradient-to-br from-[#fd5564] to-[#ff8a5b] p-5">
            <ImagePlus className="h-10 w-10 text-white" />
          </div>
          <p className="text-center text-lg font-semibold text-gray-900">
            {isDragging ? "Drop them here" : "Upload photos"}
          </p>
          <p className="mt-1 text-center text-sm text-gray-500">
            Tap to browse or drag and drop
          </p>
        </label>
      </div>
    );
  }

  // Has images - show grid with existing + new + add more button
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {/* Existing images from server */}
        {existingImages.map((image, index) => {
          const isFirst = index === 0;
          const isOnlyImageSection = previews.length === 0;
          return (
            <div
              key={`existing-${image.id}`}
              className={`group relative overflow-hidden rounded-xl ${
                isFirst && (existingImages.length > 1 || !isOnlyImageSection)
                  ? "col-span-3 aspect-[4/3]"
                  : "aspect-square"
              }`}
            >
              <Image
                src={image.url}
                alt={`Photo ${index + 1}`}
                fill
                className="object-cover"
              />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(image.id)}
                  disabled={disabled}
                  className="absolute right-2 top-2 rounded-full bg-white/95 p-2 shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
                >
                  <X className="h-4 w-4 text-gray-700" />
                </button>
              )}
              {isFirst && (
                <div className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-900">
                  Main photo
                </div>
              )}
            </div>
          );
        })}

        {/* New file previews */}
        {previews.map((image, index) => {
          const globalIndex = existingImages.length + index;
          const isFirst = globalIndex === 0;
          return (
            <div
              key={`new-${image.id}`}
              className={`group relative overflow-hidden rounded-xl ${
                isFirst ? "col-span-3 aspect-[4/3]" : "aspect-square"
              }`}
            >
              <Image
                src={image.preview}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => removeFile(image.id)}
                disabled={disabled}
                className="absolute right-2 top-2 rounded-full bg-white/95 p-2 shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
              >
                <X className="h-4 w-4 text-gray-700" />
              </button>
              {isFirst && (
                <div className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-900">
                  Main photo
                </div>
              )}
            </div>
          );
        })}

        {/* Add more button */}
        {canAddMore && (
          <label
            htmlFor="image-upload-more"
            className={`flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-[#fd5564] hover:bg-red-50/50 ${
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          >
            <input
              ref={inputMoreRef}
              type="file"
              id="image-upload-more"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
              disabled={disabled}
            />
            <ImagePlus className="h-6 w-6 text-gray-400" />
            <span className="mt-1 text-xs text-gray-500">Add more</span>
          </label>
        )}
      </div>
      <p className="text-center text-xs text-gray-500">
        First photo will be the main image. Add up to {maxImages} photos.
      </p>
    </div>
  );
}
