import Hero from './components/Hero';
import VoiceTutor from './components/VoiceTutor';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-purple-50 text-gray-900">
      <Hero />
      <div className="max-w-6xl mx-auto px-4">
        <VoiceTutor />
        <Footer />
      </div>
    </div>
  );
}

export default App;
