"use client";

import { useCallback, useRef, useState, DragEvent, ChangeEvent, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImagePlus, X, Loader2, GripVertical } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import {
  deleteImageOptions,
  reorderImagesOptions,
  uploadImage,
} from "@/data-access/images";
import { Effect } from "effect";
import { LiveLayer } from "@/lib/effect-query";

// ============================================================================
// Types
// ============================================================================

export interface ImageItem {
  id: number;
  url: string;
  order: number;
  isUploading?: boolean;
  tempId?: string;
}

interface ImageUploadProps {
  /** Place ID for uploading images */
  placeId: number | null;
  /** Current images */
  images: ImageItem[];
  /** Callback when images change */
  onImagesChange: (images: ImageItem[]) => void;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Maximum number of images allowed */
  maxImages?: number;
}

// ============================================================================
// Sortable Image Component
// ============================================================================

interface SortableImageProps {
  image: ImageItem;
  index: number;
  onRemove: () => void;
  disabled?: boolean;
  isFirst: boolean;
  totalImages: number;
}

function SortableImage({
  image,
  index,
  onRemove,
  disabled,
  isFirst,
  totalImages,
}: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative overflow-hidden rounded-xl ${
        isFirst && totalImages > 1 ? "col-span-3 aspect-[4/3]" : "aspect-square"
      } ${image.isUploading ? "opacity-60" : ""}`}
    >
      <Image
        src={image.url}
        alt={`Photo ${index + 1}`}
        fill
        className="object-cover"
        unoptimized={image.url.startsWith("blob:")}
      />

      {/* Drag handle */}
      {!disabled && !image.isUploading && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-2 top-2 cursor-grab rounded-full bg-white/95 p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-gray-700" />
        </div>
      )}

      {/* Upload indicator */}
      {image.isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      )}

      {/* Remove button */}
      {!image.isUploading && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="absolute right-2 top-2 rounded-full bg-white/95 p-2 shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
        >
          <X className="h-4 w-4 text-gray-700" />
        </button>
      )}

      {/* Main photo badge */}
      {isFirst && (
        <div className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-900">
          Main photo
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main ImageUpload Component
// ============================================================================

export function ImageUpload({
  placeId,
  images,
  onImagesChange,
  disabled,
  maxImages = 6,
}: ImageUploadProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputMoreRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  // Keep a ref to current images for async callbacks
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Delete mutation
  const { mutate: deleteImageMutation } = useMutation({
    ...deleteImageOptions,
    onSuccess: (_, imageId) => {
      onImagesChange(imagesRef.current.filter((img) => img.id !== imageId));
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
    onError: () => {
      toast.error("Failed to delete image");
    },
  });

  // Reorder mutation
  const { mutate: reorderImagesMutation } = useMutation({
    ...reorderImagesOptions,
    onError: () => {
      toast.error("Failed to reorder images");
    },
  });

  const canAddMore = images.length < maxImages;
  const isUploading = uploadingCount > 0;
  const remainingSlots = maxImages - images.length;

  /**
   * Handle file selection (from input or drag-drop)
   */
  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!placeId) {
        toast.error("Please save the place first before uploading images");
        return;
      }

      const fileArray = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      const currentRemainingSlots = maxImages - imagesRef.current.length;
      const filesToUpload = fileArray.slice(0, currentRemainingSlots);

      if (filesToUpload.length === 0) return;

      setUploadingCount((c) => c + filesToUpload.length);

      // Add optimistic previews
      const tempImages: ImageItem[] = filesToUpload.map((file, i) => ({
        id: -(Date.now() + i), // Negative temp ID
        url: URL.createObjectURL(file),
        order: imagesRef.current.length + i,
        isUploading: true,
        tempId: `temp-${Date.now()}-${i}`,
      }));

      onImagesChange([...imagesRef.current, ...tempImages]);

      // Upload each file
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const tempImage = tempImages[i];

        try {
          const result = await Effect.runPromise(
            uploadImage(placeId, file).pipe(Effect.provide(LiveLayer))
          );

          // Replace temp image with real one
          const updated = imagesRef.current.map((img) =>
            img.tempId === tempImage.tempId
              ? {
                  id: result.id,
                  url: result.url,
                  order: result.order,
                }
              : img
          );
          onImagesChange(updated);
        } catch (error) {
          console.error("Upload failed:", error);
          // Remove failed upload
          const filtered = imagesRef.current.filter(
            (img) => img.tempId !== tempImage.tempId
          );
          onImagesChange(filtered);
          toast.error(`Failed to upload ${file.name}`);
        } finally {
          URL.revokeObjectURL(tempImage.url);
          setUploadingCount((c) => c - 1);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
    [placeId, maxImages, onImagesChange, queryClient]
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    // Reset input so same file can be selected again
    if (inputRef.current) inputRef.current.value = "";
    if (inputMoreRef.current) inputMoreRef.current.value = "";
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!disabled && canAddMore && placeId) {
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
    if (disabled || !canAddMore || !placeId) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  /**
   * Handle drag end for reordering
   */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);

      const reordered = arrayMove(images, oldIndex, newIndex).map(
        (img, index) => ({ ...img, order: index })
      );

      // Optimistic update
      onImagesChange(reordered);

      // Persist to server
      if (placeId) {
        reorderImagesMutation({
          placeId,
          imageOrder: reordered
            .filter((img) => img.id > 0) // Only real images
            .map((img) => ({ id: img.id, order: img.order })),
        });
      }
    },
    [images, placeId, onImagesChange, reorderImagesMutation]
  );

  /**
   * Handle image removal
   */
  const handleRemove = useCallback(
    (imageId: number) => {
      if (imageId < 0) {
        // Temp image, just remove from state
        onImagesChange(images.filter((img) => img.id !== imageId));
      } else {
        // Real image, delete from server
        deleteImageMutation(imageId);
      }
    },
    [images, onImagesChange, deleteImageMutation]
  );

  // ============================================================================
  // Render: Empty State
  // ============================================================================

  if (images.length === 0) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed transition-all ${
          isDragging
            ? "border-[#fd5564] bg-red-50"
            : "border-gray-300 bg-gray-50 hover:border-[#fd5564] hover:bg-red-50/50"
        } ${disabled || !placeId ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          id="image-upload"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
          disabled={disabled || isUploading || !placeId}
        />
        <label
          htmlFor="image-upload"
          className={`flex flex-col items-center justify-center px-6 py-16 ${
            disabled || !placeId ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <div className="mb-4 rounded-full bg-gradient-to-br from-[#fd5564] to-[#ff8a5b] p-5">
            <ImagePlus className="h-10 w-10 text-white" />
          </div>
          <p className="text-center text-lg font-semibold text-gray-900">
            {isDragging ? "Drop them here" : "Upload photos"}
          </p>
          <p className="mt-1 text-center text-sm text-gray-500">
            {placeId
              ? "Tap to browse or drag and drop"
              : "Save the place first to upload images"}
          </p>
        </label>
      </div>
    );
  }

  // ============================================================================
  // Render: Image Grid with DnD
  // ============================================================================

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map((img) => img.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-3 gap-3">
            {images.map((image, index) => (
              <SortableImage
                key={image.id}
                image={image}
                index={index}
                isFirst={index === 0}
                totalImages={images.length}
                onRemove={() => handleRemove(image.id)}
                disabled={disabled || isUploading}
              />
            ))}

            {/* Add more button */}
            {canAddMore && placeId && (
              <label
                htmlFor="image-upload-more"
                className={`flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-[#fd5564] hover:bg-red-50/50 ${
                  disabled || isUploading
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
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
                  disabled={disabled || isUploading}
                />
                <ImagePlus className="h-6 w-6 text-gray-400" />
                <span className="mt-1 text-xs text-gray-500">Add more</span>
              </label>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <p className="text-center text-xs text-gray-500">
        Drag to reorder. First photo is the main image. Add up to {maxImages}{" "}
        photos.
      </p>
    </div>
  );
}

// ============================================================================
// Legacy Interface for Create Flow (before place exists)
// ============================================================================

export interface PendingImage {
  file: File;
  preview: string;
  id: string;
}

interface ImageUploadPendingProps {
  /** Pending files (for create flow before place exists) */
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

/**
 * ImageUpload variant for the create flow (before place ID exists).
 * Files are stored locally and uploaded after place creation.
 */
export function ImageUploadPending({
  files,
  onFilesChange,
  disabled,
  maxImages = 6,
}: ImageUploadPendingProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputMoreRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<PendingImage[]>([]);

  // Sync previews with files prop
  useEffect(() => {
    const currentFiles = new Set(files);
    const existingFiles = new Set(previews.map((p) => p.file));

    // Clean up old previews
    previews
      .filter((p) => !currentFiles.has(p.file))
      .forEach((p) => URL.revokeObjectURL(p.preview));

    // Create previews for new files
    const newFiles = files.filter((f) => !existingFiles.has(f));
    if (newFiles.length > 0) {
      const newPreviews = newFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9),
      }));
      const keptPreviews = previews.filter((p) => currentFiles.has(p.file));
      setPreviews([...keptPreviews, ...newPreviews]);
    } else if (previews.some((p) => !currentFiles.has(p.file))) {
      // Some previews were removed
      setPreviews(previews.filter((p) => currentFiles.has(p.file)));
    }

    // Cleanup on unmount
    return () => {
      // Don't revoke all URLs on unmount as we might still need them
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const canAddMore = files.length < maxImages;
  const remainingSlots = maxImages - files.length;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const filesToAdd = newFiles.slice(0, remainingSlots);
      onFilesChange([...files, ...filesToAdd]);
    }
    if (inputRef.current) inputRef.current.value = "";
    if (inputMoreRef.current) inputMoreRef.current.value = "";
  };

  const removeFile = (id: string) => {
    const preview = previews.find((p) => p.id === id);
    if (preview) {
      URL.revokeObjectURL(preview.preview);
      onFilesChange(files.filter((f) => f !== preview.file));
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!disabled && canAddMore) setIsDragging(true);
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
      const filesToAdd = newFiles.slice(0, remainingSlots);
      onFilesChange([...files, ...filesToAdd]);
    }
  };

  // Empty state
  if (previews.length === 0) {
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
          id="image-upload-pending"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
          disabled={disabled}
        />
        <label
          htmlFor="image-upload-pending"
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

  // Grid with previews
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {previews.map((image, index) => {
          const isFirst = index === 0;
          return (
            <div
              key={image.id}
              className={`group relative overflow-hidden rounded-xl ${
                isFirst && previews.length > 1
                  ? "col-span-3 aspect-[4/3]"
                  : "aspect-square"
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
            htmlFor="image-upload-pending-more"
            className={`flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-[#fd5564] hover:bg-red-50/50 ${
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          >
            <input
              ref={inputMoreRef}
              type="file"
              id="image-upload-pending-more"
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
