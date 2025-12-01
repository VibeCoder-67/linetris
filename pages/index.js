import { Geist, Geist_Mono } from "next/font/google";
import GridDistortion from "@/components/GridDistortion";

import Dock from "@/components/Dock";
import ConnectWallet from "@/components/ConnectWallet";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div
      className={`${geistSans.className} ${geistMono.className} flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black`}
    >
      <div className="fixed top-4 right-4 z-[60]">
        <ConnectWallet />
      </div>
      <Dock />
      <div className="w-full h-screen relative">
        <GridDistortion
          imageSrc="/background.png"
          grid={10}
          mouse={0.1}
          strength={0.15}
          relaxation={0.9}
          className="w-full h-full"
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-4">
            Interactive Grid Distortion
          </h1>
          <p className="text-white/80 text-lg">
            Move your mouse to distort the grid
          </p>
        </div>
      </div>
    </div>
  );
}
