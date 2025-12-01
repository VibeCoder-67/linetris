import { Geist, Geist_Mono } from "next/font/google";
import GridDistortion from "@/components/GridDistortion";
import Dock from "@/components/Dock";
import ConnectWallet from "@/components/ConnectWallet";
import Tetris from "@/components/Tetris";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function Game() {
    return (
        <div
            className={`${geistSans.className} ${geistMono.className} flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black`}
        >
            <div className="fixed top-6 right-6 z-[60]">
                <ConnectWallet />
            </div>
            <Dock />

            <div className="relative z-10 flex items-center justify-center w-full h-full pointer-events-auto">
                <Tetris />
            </div>

            <div className="fixed inset-0 z-0 pointer-events-none">
                <GridDistortion
                    imageSrc="/background.png"
                    grid={10}
                    mouse={0.1}
                    strength={0.15}
                    relaxation={0.9}
                    className="w-full h-full"
                />
            </div>
        </div>
    );
}
