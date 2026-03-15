import { useState } from 'react';
import { Share2, Loader2, Check } from 'lucide-react';

interface ShareButtonProps {
  projectId: string | null;
  title: string;
  description: string;
  generatedCode: any;
  onShared?: () => void;
}

export function ShareButton({
  projectId,
  title,
  description,
  generatedCode,
  onShared,
}: ShareButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleShare = async () => {
    if (!projectId) {
      setError("No project ID available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          author_name: "Litree420",
          title: title || "Untitled Creation",
          content: description || "Generated with LiTreeLab Studio",
          post_type: "app",
          code_snapshot: generatedCode,
          tags: ["ai-generated", "metaverse"],
        }),
      });

      if (!response.ok) throw new Error(await response.text());

      setSuccess(true);
      onShared?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to share");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="share-button-container">
      <button
        onClick={handleShare}
        disabled={loading || success}
        className={`share-button ${success ? 'success' : loading ? 'loading' : ''}`}
      >
        {success ? (
          <><Check size={18} /> Shared to Feed!</>
        ) : loading ? (
          <><Loader2 size={18} className="spin" /> Publishing...</>
        ) : (
          <><Share2 size={18} /> Share to LiTLab Network</>
        )}
      </button>
      {error && <p className="share-error">{error}</p>}
    </div>
  );
}
