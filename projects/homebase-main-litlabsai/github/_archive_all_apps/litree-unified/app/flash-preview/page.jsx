import FlashUIPreview from '../../components/FlashUIPreview';
import FlashNav from '../../components/FlashNav';

export default function FlashPreviewPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <FlashNav />
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-hc-purple via-white to-hc-bright-gold">
              FLASH UI SYSTEM
            </h1>
            <p className="text-gray-400 text-lg font-medium max-w-2xl mx-auto">
              Premium design language for the LiTreeLab'Studio™ ecosystem. Glassmorphism, gold
              accents, and high-performance layouts.
            </p>
          </div>
          <FlashUIPreview />
        </div>
      </div>
    </div>
  );
}
