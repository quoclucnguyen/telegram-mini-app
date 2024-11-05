import { useState } from "react";

export default function LuckyWheelPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <LuckyWheel />
    </div>
  );
}

const LuckyWheel: React.FC = () => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleSpin = () => {
    if (spinning) return; // Prevent multiple spins at once

    setSpinning(true);
    const randomSpin = Math.floor(Math.random() * 360) + 360 * 5; // Random spin between 5 to 6 full turns
    setRotation(rotation + randomSpin);

    // Reset spinning after the animation
    setTimeout(() => setSpinning(false), 3000);
  };

  const prizes = [
    "$50",
    "$100",
    "Free Item",
    "Try Again",
    "$200",
    "Gift Card",
    "Bonus Points",
    "Lucky Draw",
  ];

  return (
    <div className="flex flex-col items-center mt-10 space-y-6">
      <div className="relative w-64 h-64">
        <div
          className="absolute inset-0 rounded-full border-4 border-gray-300"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: "transform 3s ease-out",
          }}
        >
          {prizes.map((prize, index) => (
            <div
              key={index}
              className="absolute w-32 h-32 bg-indigo-500 text-white flex items-center justify-center text-center rounded-tr-full"
              style={{
                transform: `rotate(${
                  index * (360 / prizes.length)
                }deg) translate(50%, -50%)`,
                transformOrigin: "0% 100%",
              }}
            >
              {prize}
            </div>
          ))}
        </div>
        {/* Arrow */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500" />
      </div>

      <button
        className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300"
        onClick={handleSpin}
        disabled={spinning}
      >
        {spinning ? "Spinning..." : "Spin the Wheel"}
      </button>
    </div>
  );
};
