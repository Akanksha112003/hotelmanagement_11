import React, { useRef } from "react";
import { Upload, Image as ImageIcon, Trash2, Link as LinkIcon, Building2 } from "lucide-react";

export default function LogoUploader({ logoUrl, onChange }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-[#F8F7F4] p-6 rounded-2xl border border-[#17384F]/10">
      {/* Live Preview Box */}
      <div className="relative w-28 h-28 rounded-2xl bg-white border border-[#17384F]/15 flex items-center justify-center overflow-hidden shadow-sm shrink-0 group">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Hotel Logo Preview"
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={`w-full h-full items-center justify-center text-[#D9B77A] bg-[#17384F] flex flex-col gap-1 ${
            logoUrl ? "hidden" : "flex"
          }`}
        >
          <Building2 className="w-8 h-8 text-[#D9B77A]" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#D9B77A]/80">No Logo</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 space-y-3 w-full">
        <div>
          <h4 className="text-sm font-bold text-[#17384F]">Property Brand Logo</h4>
          <p className="text-xs text-[#17384F]/60">
            Upload an image file (PNG, JPG, SVG) or paste a direct image URL. Recommended size: 400×400px.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-[#17384F] hover:bg-[#1E6F8E] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm"
          >
            <Upload className="w-4 h-4 text-[#D9B77A]" /> Upload File
          </button>

          {logoUrl && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-red-200 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          )}
        </div>

        {/* Direct Image URL input */}
        <div className="relative">
          <LinkIcon className="w-3.5 h-3.5 text-[#17384F]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="url"
            placeholder="Or enter logo image URL (https://...)"
            value={logoUrl}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white border border-[#17384F]/10 rounded-xl pl-9 pr-4 py-2 text-xs text-[#17384F] outline-none focus:border-[#D9B77A] transition-all"
          />
        </div>
      </div>
    </div>
  );
}
