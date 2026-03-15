"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthGate } from "@/components/AuthGate";
import DashboardLayout from "@/components/DashboardLayout";
import { QRCodeSVG } from "qrcode.react";

export default function StationPage() {
  const { user } = useAuth();
  const [stationData, setStationData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const stationUrl = `https://litlabs-evlla8c7n-larry-bols-projects.vercel.app/station/${user?.uid}`;
  const embedCode = `<iframe src="${stationUrl}/embed" width="100%" height="600" frameborder="0"></iframe>`;

  useEffect(() => {
    if (user) {
      loadStationData();
    }
  }, [user]);

  async function loadStationData() {
    try {
      const res = await fetch("/api/station/stats");
      if (res.ok) {
        const data = await res.json();
        setStationData(data);
      }
    } catch (err) {
      console.error("Failed to load station data:", err);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AuthGate>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Station</h1>
              <p className="text-slate-300">Your personal branded workspace & portfolio</p>
            </div>
            <a
              href={stationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-semibold transition"
            >
              Visit Station →
            </a>
          </div>

          {/* Station URL */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold mb-4">Your Station URL</h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={stationUrl}
                readOnly
                aria-label="Station URL"
                className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm"
              />
              <button
                onClick={() => copyToClipboard(stationUrl)}
                className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 font-semibold transition"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Share this link to showcase your work, collect followers, and earn referrals
            </p>
          </div>

          {/* QR Code */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold mb-4">QR Code</h2>
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white rounded-lg">
                <QRCodeSVG value={stationUrl} size={150} />
              </div>
              <div className="flex-1">
                <p className="text-slate-300 mb-3">
                  Print this QR code on business cards, flyers, or merch. Anyone who scans
                  it lands on your station and you get credit for referrals.
                </p>
                <button
                  onClick={() => {
                    const canvas = document.querySelector("canvas");
                    if (canvas) {
                      const url = canvas.toDataURL("image/png");
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `litlabs-station-${user?.uid}.png`;
                      a.click();
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 font-semibold transition"
                >
                  Download QR Code
                </button>
              </div>
            </div>
          </div>

          {/* Embed Code */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold mb-4">Embed Your Station</h2>
            <textarea
              id="embed-code"
              value={embedCode}
              readOnly
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm font-mono"
              aria-label="Embed code for station"
            />
            <button
              onClick={() => copyToClipboard(embedCode)}
              className="mt-3 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 font-semibold transition"
            >
              Copy Embed Code
            </button>
            <p className="text-sm text-slate-400 mt-2">
              Add your station to any website or blog
            </p>
          </div>

          {/* Station Stats */}
          {stationData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm text-slate-400 mb-1">Total Visits</p>
                <p className="text-3xl font-bold">{stationData.visits || 0}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm text-slate-400 mb-1">Followers</p>
                <p className="text-3xl font-bold text-emerald-400">{stationData.followers || 0}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm text-slate-400 mb-1">Referrals</p>
                <p className="text-3xl font-bold text-purple-400">{stationData.referrals || 0}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm text-slate-400 mb-1">Earnings</p>
                <p className="text-3xl font-bold text-cyan-400">${stationData.earnings || 0}</p>
              </div>
            </div>
          )}

          {/* Customization */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold mb-4">Customize Your Station</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="display-name-station" className="block text-sm font-medium mb-2">Display Name</label>
                <input
                  id="display-name-station"
                  type="text"
                  placeholder="Your Name or Brand"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700"
                  aria-label="Display name for your station"
                />
              </div>
              <div>
                <label htmlFor="bio-station" className="block text-sm font-medium mb-2">Bio</label>
                <input
                  id="bio-station"
                  type="text"
                  placeholder="What you do..."
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700"
                  aria-label="Your bio description"
                />
              </div>
              <div>
                <label htmlFor="profile-image-station" className="block text-sm font-medium mb-2">Profile Image</label>
                <input
                  id="profile-image-station"
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700"
                  aria-label="Upload profile image"
                />
              </div>
              <div>
                <label htmlFor="cover-image-station" className="block text-sm font-medium mb-2">Cover Image</label>
                <input
                  id="cover-image-station"
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700"
                  aria-label="Upload cover image"
                />
              </div>
            </div>
            <button className="mt-4 px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-semibold transition">
              Save Changes
            </button>
          </div>

          {/* Social Sharing */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold mb-4">Share Your Station</h2>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=Check out my LitLabs Station!&url=${encodeURIComponent(stationUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 font-semibold transition"
              >
                Share on Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(stationUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold transition"
              >
                Share on Facebook
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(stationUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 font-semibold transition"
              >
                Share on LinkedIn
              </a>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: "My LitLabs Station",
                      text: "Check out my creative workspace!",
                      url: stationUrl,
                    });
                  }
                }}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 font-semibold transition"
              >
                Share via...
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGate>
  );
}
