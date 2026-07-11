import React, { useState, useRef } from "react";
import { PhotoIcon, XMarkIcon, TagIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../../context/AuthContext";
import Button from "../../common/Button/Button";
import toast from "react-hot-toast";

const CreatePost = ({ onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) {
      toast.error("You can attach up to 4 images");
      return;
    }
    setImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) {
      toast.error("Write something or add an image");
      return;
    }
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("content", content.trim());
      images.forEach((img) => formData.append("images", img));
      await onSubmit(formData);
    } catch (err) {
      toast.error("Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Author row */}
      <div className="flex items-center gap-3">
        <img
          src={
            user?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "U")}`
          }
          alt={user?.fullName}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-primary-100"
        />
        <div>
          <p className="font-semibold text-sm text-gray-900">{user?.fullName}</p>
          <p className="text-xs text-gray-400">@{user?.username}</p>
        </div>
      </div>

      {/* Text area */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind? Share a product, a tip, or a deal..."
        rows={4}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-400 placeholder-gray-400"
      />

      {/* Image previews */}
      {previews.length > 0 && (
        <div
          className={`grid gap-2 ${
            previews.length > 1 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {previews.map((src, i) => (
            <div
              key={i}
              className="relative rounded-xl overflow-hidden aspect-video bg-gray-100"
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions row */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= 4}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-500 transition disabled:opacity-40"
          >
            <PhotoIcon className="h-5 w-5" />
            Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>

        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={submitting || (!content.trim() && images.length === 0)}
          >
            {submitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CreatePost;
