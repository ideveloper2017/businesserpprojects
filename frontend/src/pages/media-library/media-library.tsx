import {MediaLibrary} from "@/components/media-library/MediaLibrary.tsx";

const MediaLibraryPage = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Media Library</h1>
      <MediaLibrary />
    </div>
  );
};

export default MediaLibraryPage;
