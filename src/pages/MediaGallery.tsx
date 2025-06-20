import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Media types
type MediaItem = {
  id: number;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption?: string;
  alt?: string;
  uploadedAt: string;
  size: number;
  dimensions?: { width: number; height: number };
  tags?: string[];
  location?: string;
  album?: string;
  isPublic: boolean;
  views: number;
  likes: number;
  shares: number;
};

type Album = {
  id: number;
  name: string;
  description: string;
  coverImage: string;
  mediaCount: number;
  createdAt: string;
  isPublic: boolean;
  tags?: string[];
};

// Mock data
const mockAlbums: Album[] = [
  {
    id: 1,
    name: "Summer Adventures",
    description: "Photos from my summer travels and adventures",
    coverImage: "https://via.placeholder.com/300x200/6366f1/fff?text=Summer+Adventures",
    mediaCount: 24,
    createdAt: "2024-06-15",
    isPublic: true,
    tags: ["summer", "travel", "adventures"]
  },
  {
    id: 2,
    name: "Food Adventures",
    description: "Delicious meals and culinary experiences",
    coverImage: "https://via.placeholder.com/300x200/f59e0b/fff?text=Food+Adventures",
    mediaCount: 18,
    createdAt: "2024-06-10",
    isPublic: true,
    tags: ["food", "restaurants", "cooking"]
  },
  {
    id: 3,
    name: "Private Collection",
    description: "Personal photos and memories",
    coverImage: "https://via.placeholder.com/300x200/ef4444/fff?text=Private+Collection",
    mediaCount: 12,
    createdAt: "2024-06-05",
    isPublic: false,
    tags: ["personal", "memories"]
  }
];

const mockMedia: MediaItem[] = [
  {
    id: 1,
    type: 'image',
    url: "https://via.placeholder.com/400x300/6366f1/fff?text=Beach+Sunset",
    thumbnail: "https://via.placeholder.com/200x150/6366f1/fff?text=Thumbnail",
    caption: "Beautiful sunset at the beach",
    alt: "Beach sunset",
    uploadedAt: "2024-06-15",
    size: 2048576,
    dimensions: { width: 400, height: 300 },
    tags: ["beach", "sunset", "summer"],
    location: "Miami Beach, FL",
    album: "Summer Adventures",
    isPublic: true,
    views: 156,
    likes: 23,
    shares: 8
  },
  {
    id: 2,
    type: 'image',
    url: "https://via.placeholder.com/400x300/f59e0b/fff?text=Pizza",
    thumbnail: "https://via.placeholder.com/200x150/f59e0b/fff?text=Thumbnail",
    caption: "Amazing pizza from local pizzeria",
    alt: "Delicious pizza",
    uploadedAt: "2024-06-14",
    size: 1536000,
    dimensions: { width: 400, height: 300 },
    tags: ["pizza", "food", "restaurant"],
    location: "Brooklyn, NY",
    album: "Food Adventures",
    isPublic: true,
    views: 89,
    likes: 15,
    shares: 3
  },
  {
    id: 3,
    type: 'video',
    url: "https://via.placeholder.com/400x300/ef4444/fff?text=Video+Thumbnail",
    thumbnail: "https://via.placeholder.com/200x150/ef4444/fff?text=Video",
    caption: "Fun times with friends",
    alt: "Video thumbnail",
    uploadedAt: "2024-06-13",
    size: 5242880,
    dimensions: { width: 400, height: 300 },
    tags: ["friends", "fun", "party"],
    location: "Central Park, NYC",
    album: "Private Collection",
    isPublic: false,
    views: 45,
    likes: 8,
    shares: 1
  },
  {
    id: 4,
    type: 'image',
    url: "https://via.placeholder.com/400x300/10b981/fff?text=Mountain+View",
    thumbnail: "https://via.placeholder.com/200x150/10b981/fff?text=Thumbnail",
    caption: "Breathtaking mountain view",
    alt: "Mountain landscape",
    uploadedAt: "2024-06-12",
    size: 3072000,
    dimensions: { width: 400, height: 300 },
    tags: ["mountains", "nature", "landscape"],
    location: "Rocky Mountains, CO",
    album: "Summer Adventures",
    isPublic: true,
    views: 234,
    likes: 34,
    shares: 12
  }
];

export default function MediaGallery() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'albums' | 'photos' | 'videos'>('albums');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'views'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // New album form state
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDescription, setNewAlbumDescription] = useState("");
  const [newAlbumTags, setNewAlbumTags] = useState<string[]>([]);
  const [newAlbumPublic, setNewAlbumPublic] = useState(true);

  // Upload form state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadAlbum, setUploadAlbum] = useState<number | null>(null);
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [uploadLocation, setUploadLocation] = useState("");

  const filteredMedia = mockMedia.filter(media => {
    const matchesSearch = media.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         media.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTags = filterTags.length === 0 || 
                       filterTags.every(tag => media.tags?.includes(tag));
    return matchesSearch && matchesTags;
  });

  const sortedMedia = [...filteredMedia].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      case 'name':
        return (a.caption || '').localeCompare(b.caption || '');
      case 'size':
        return b.size - a.size;
      case 'views':
        return b.views - a.views;
      default:
        return 0;
    }
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCreateAlbum = () => {
    if (!newAlbumName.trim()) return;
    
    const newAlbum: Album = {
      id: Date.now(),
      name: newAlbumName,
      description: newAlbumDescription,
      coverImage: "https://via.placeholder.com/300x200/6366f1/fff?text=New+Album",
      mediaCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      isPublic: newAlbumPublic,
      tags: newAlbumTags
    };
    
    // In a real app, you'd add this to your albums array
    console.log('Created album:', newAlbum);
    setShowCreateAlbumModal(false);
    setNewAlbumName("");
    setNewAlbumDescription("");
    setNewAlbumTags([]);
    setNewAlbumPublic(true);
  };

  const handleUploadMedia = () => {
    if (uploadFiles.length === 0) return;
    
    // In a real app, you'd upload the files and add them to your media array
    console.log('Uploading files:', uploadFiles);
    setShowUploadModal(false);
    setUploadFiles([]);
    setUploadAlbum(null);
    setUploadTags([]);
    setUploadLocation("");
  };

  const handleAddTag = (tag: string) => {
    if (tag && !newAlbumTags.includes(tag.toLowerCase())) {
      setNewAlbumTags([...newAlbumTags, tag.toLowerCase()]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewAlbumTags(newAlbumTags.filter(tag => tag !== tagToRemove));
  };

  const handleShareMedia = (media: MediaItem) => {
    alert(`Sharing ${media.caption || 'media'}...`);
  };

  const handleDownloadMedia = (media: MediaItem) => {
    alert(`Downloading ${media.caption || 'media'}...`);
  };

  const handleDeleteMedia = (media: MediaItem) => {
    if (confirm(`Are you sure you want to delete "${media.caption || 'this media'}"?`)) {
      alert(`Deleted ${media.caption || 'media'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Media Gallery</h1>
              <p className="text-gray-600">Manage your photos and videos</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCreateAlbumModal(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                📁 New Album
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                📤 Upload
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('albums')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'albums' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📁 Albums ({mockAlbums.length})
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'photos' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📷 Photos ({mockMedia.filter(m => m.type === 'image').length})
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'videos' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🎥 Videos ({mockMedia.filter(m => m.type === 'video').length})
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
                <option value="views">Sort by Views</option>
              </select>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {viewMode === 'grid' ? '📋' : '🔲'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'albums' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockAlbums.map(album => (
              <div
                key={album.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedAlbum(album)}
              >
                <div className="relative">
                  <img
                    src={album.coverImage}
                    alt={album.name}
                    className="w-full h-48 object-cover"
                  />
                  {!album.isPublic && (
                    <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                      🔒 Private
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{album.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{album.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{album.mediaCount} items</span>
                    <span>{album.createdAt}</span>
                  </div>
                  {album.tags && album.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {album.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {(activeTab === 'photos' || activeTab === 'videos') && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-4'}>
            {sortedMedia
              .filter(media => activeTab === 'photos' ? media.type === 'image' : media.type === 'video')
              .map(media => (
                <div
                  key={media.id}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                  onClick={() => { setSelectedMedia(media); setShowMediaModal(true); }}
                >
                  <div className={`relative ${viewMode === 'list' ? 'w-32 h-24' : 'w-full h-48'}`}>
                    <img
                      src={media.thumbnail || media.url}
                      alt={media.alt || media.caption}
                      className="w-full h-full object-cover"
                    />
                    {media.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-50 text-white text-2xl rounded-full w-12 h-12 flex items-center justify-center">
                          ▶️
                        </div>
                      </div>
                    )}
                    {!media.isPublic && (
                      <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                        🔒
                      </div>
                    )}
                  </div>
                  <div className={`p-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                      {media.caption || 'Untitled'}
                    </h4>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>📅 {media.uploadedAt}</div>
                      <div>📏 {formatFileSize(media.size)}</div>
                      <div>👁️ {media.views} views</div>
                      {media.location && <div>📍 {media.location}</div>}
                    </div>
                    {media.tags && media.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {media.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="inline-block px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                        {media.tags.length > 2 && (
                          <span className="text-xs text-gray-400">+{media.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Media Modal */}
      {showMediaModal && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowMediaModal(false)}
              className="absolute top-4 right-4 z-10 text-white text-2xl hover:text-gray-300"
            >
              ✕
            </button>
            
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="flex">
                <div className="flex-1">
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.alt || selectedMedia.caption}
                    className="w-full h-96 object-cover"
                  />
                </div>
                <div className="w-80 p-6 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {selectedMedia.caption || 'Untitled'}
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Uploaded:</span> {selectedMedia.uploadedAt}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {formatFileSize(selectedMedia.size)}
                    </div>
                    <div>
                      <span className="font-medium">Views:</span> {selectedMedia.views}
                    </div>
                    <div>
                      <span className="font-medium">Likes:</span> {selectedMedia.likes}
                    </div>
                    <div>
                      <span className="font-medium">Shares:</span> {selectedMedia.shares}
                    </div>
                    {selectedMedia.location && (
                      <div>
                        <span className="font-medium">Location:</span> {selectedMedia.location}
                      </div>
                    )}
                    {selectedMedia.album && (
                      <div>
                        <span className="font-medium">Album:</span> {selectedMedia.album}
                      </div>
                    )}
                  </div>

                  {selectedMedia.tags && selectedMedia.tags.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedMedia.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex space-x-2">
                    <button
                      onClick={() => handleShareMedia(selectedMedia)}
                      className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      📤 Share
                    </button>
                    <button
                      onClick={() => handleDownloadMedia(selectedMedia)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      💾 Download
                    </button>
                    <button
                      onClick={() => handleDeleteMedia(selectedMedia)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Album Modal */}
      {showCreateAlbumModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Create New Album</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Album Name *
                  </label>
                  <input
                    type="text"
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                    placeholder="Enter album name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newAlbumDescription}
                    onChange={(e) => setNewAlbumDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                    rows={3}
                    placeholder="Describe your album"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {newAlbumTags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-purple-500 hover:text-purple-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Add a tag"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          handleAddTag(input.value);
                          input.value = '';
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add a tag"]') as HTMLInputElement;
                        if (input.value) {
                          handleAddTag(input.value);
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="public-album"
                    checked={newAlbumPublic}
                    onChange={(e) => setNewAlbumPublic(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="public-album" className="text-sm text-gray-700">
                    Make album public
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateAlbumModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAlbum}
                  disabled={!newAlbumName.trim()}
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Album
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Upload Media</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Files
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-2">📁</div>
                    <p className="text-gray-600">Drag and drop files here or click to browse</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="mt-2 inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 cursor-pointer"
                    >
                      Choose Files
                    </label>
                  </div>
                  {uploadFiles.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      {uploadFiles.length} file(s) selected
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Album (Optional)
                  </label>
                  <select
                    value={uploadAlbum || ''}
                    onChange={(e) => setUploadAlbum(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="">No album</option>
                    {mockAlbums.map(album => (
                      <option key={album.id} value={album.id}>{album.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={uploadLocation}
                    onChange={(e) => setUploadLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                    placeholder="Where was this taken?"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadMedia}
                  disabled={uploadFiles.length === 0}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 