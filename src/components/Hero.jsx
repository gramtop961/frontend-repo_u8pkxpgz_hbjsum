import Spline from '@splinetool/react-spline';

function Hero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 max-w-3xl text-center px-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
          ZPHS Kuchanpally AI Buddy
        </h1>
        <p className="mt-4 text-gray-600 text-lg md:text-xl">
          Practice English fluency with a friendly voice tutor. Minimal, free, and focused on your progress.
        </p>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/80" />
    </section>
  );
}

export default Hero;