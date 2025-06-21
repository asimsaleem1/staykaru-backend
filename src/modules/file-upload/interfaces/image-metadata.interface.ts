export interface ImageMetadata {
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  uploadedAt: Date;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface UploadResult {
  success: boolean;
  images: ImageMetadata[];
  errors?: string[];
}

export interface ImageProcessingOptions {
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  };
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  generateThumbnail?: boolean;
}
