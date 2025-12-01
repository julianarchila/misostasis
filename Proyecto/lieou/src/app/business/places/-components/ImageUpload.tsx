"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useRef } from "react";

interface ImageUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      onChange([...value, ...newFiles]);
    }
    // Reset input so same file can be selected again if deleted
    if (inputRef.current) {
        inputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange(newFiles);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          Add Images
        </Button>
        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
        <span className="text-sm text-muted-foreground">
          {value.length} image{value.length !== 1 ? "s" : ""} selected
        </span>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative group aspect-square rounded-md overflow-hidden border bg-muted">
               <Image 
                 src={URL.createObjectURL(file)} 
                 alt="Preview" 
                 fill
                 className="object-cover"
                 unoptimized
               />
               <Button
                 type="button"
                 variant="destructive"
                 size="icon"
                 className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                 onClick={() => removeFile(index)}
                 disabled={disabled}
               >
                 <X className="h-3 w-3" />
               </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
