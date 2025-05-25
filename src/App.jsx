import Header from "./components/Header";
import ProgressBar from "./components/ProgressBar";
import SocialLinks from "./components/SocialLinks";
import { useState } from "react";

export default function App() {
  const [donationAmount, setDonationAmount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            Kumba Coin
          </h1>
          <p className="text-xl text-center mb-12">
            Making a difference through crypto - Every transaction contributes to charity
          </p>

          <div className="bg-purple-800/30 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Donation Progress</h2>
            <ProgressBar amount={donationAmount} />
          </div>

          <SocialLinks />
        </div>
      </main>
    </div>
  );
}
