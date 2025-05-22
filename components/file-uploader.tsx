"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  value: string;
  onChange: (value: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  className?: string;
}

export function FileUploader({
  value,
  onChange,
  accept = "image/*",
  maxSize = 5,
  label = "Upload file",
  className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const validateAndProcessFile = (file: File) => {
    setError(null);

    // Check file type
    if (accept !== "*" && !file.type.match(accept.replace("*", ".*"))) {
      setError(`File must be ${accept.replace("*", "any")} type`);
      return;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Convert to base64 for preview and storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    onChange("");
  };

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative rounded-md border">
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <Image
              src={value || "/placeholder.svg"}
              alt="Uploaded file"
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6 rounded-full bg-foreground/10 backdrop-blur-sm hover:bg-foreground/20"
            onClick={removeFile}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-md border border-dashed p-6 transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25",
            "cursor-pointer",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() =>
            document.getElementById(`file-upload-${label}`)?.click()
          }
        >
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="rounded-full bg-primary/10 p-2">
              <Upload className="h-4 w-4 text-primary" />
            </div>
            <div className="text-sm font-medium">{label}</div>
            <p className="text-xs text-muted-foreground">
              Drag & drop or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              Max file size: {maxSize}MB
            </p>
          </div>
          <input
            id={`file-upload-${label}`}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
