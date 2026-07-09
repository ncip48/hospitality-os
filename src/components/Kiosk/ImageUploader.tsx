// ImageUploader.tsx
import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
    previewUrl: string | null;
    fileName?: string;
    onFileSelect: (file: File) => void;
    onRemove: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ previewUrl, fileName, onFileSelect, onRemove }) => {
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateAndProcessFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload a valid image file.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB.');
            return;
        }
        onFileSelect(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndProcessFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndProcessFile(e.dataTransfer.files[0]);
        }
    };

    if (previewUrl) {
        return (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img src={previewUrl} alt="Preview" className="w-full max-h-80 object-contain" />
                <button
                    onClick={onRemove}
                    className="absolute top-3 right-3 p-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-3 h-3" />
                    {fileName}
                </div>
            </div>
        );
    }

    return (
        <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${dragActive ? 'border-[#2596be] bg-[#2596be]/5' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'}`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDrop={handleDrop}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-3 pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-700">Drag & drop or click to upload</p>
                    <p className="text-xs text-slate-400 mt-1">Supported: JPG, PNG, WEBP (Max 5MB)</p>
                </div>
            </div>
        </div>
    );
};