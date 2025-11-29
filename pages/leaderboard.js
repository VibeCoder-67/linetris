import { Geist, Geist_Mono } from "next/font/google";
import GridDistortion from "@/components/GridDistortion";
import Dock from "@/components/Dock";
import WalletConnect from "@/components/WalletConnect";
import { motion } from "motion/react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const MOCK_LEADERBOARD = [
    { rank: 1, user: "0x71C...9A2", score: 25400 },
    { rank: 2, user: "0x3A4...B1C", score: 18200 },
    { rank: 3, user: "0x9B2...4D5", score: 15600 },
    { rank: 4, user: "0x1F8...E39", score: 12100 },
    { rank: 5, user: "0x5C6...7F0", score: 9800 },
    { rank: 6, user: "0x2D9...8A1", score: 8500 },
    { rank: 7, user: "0x8E4...C2B", score: 7200 },
    { rank: 8, user: "0x4A1...5D3", score: 6400 },
    { rank: 9, user: "0x6B3...0E8", score: 5100 },
    { rank: 10, user: "0x0F5...2C7", score: 4300 },
];

export default function Leaderboard() {
    return (
        <div
            className={`${geistSans.className} ${geistMono.className} flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black`}
        >
            <WalletConnect />
            <Dock />

            <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-4 pointer-events-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl"
                >
                    <h1 className="text-4xl font-bold text-white mb-8 text-center tracking-tight">Leaderboard</h1>

                    <div className="overflow-hidden rounded-xl border border-white/10">
                        <table className="w-full text-left text-sm text-white/80">
                            <thead className="bg-white/10 text-white uppercase tracking-wider font-medium">
                                <tr>
                                    <th className="px-6 py-4 text-center w-24">Rank</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4 text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {MOCK_LEADERBOARD.map((entry) => (
                                    <tr key={entry.rank} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-center font-mono text-white/60">
                                            {entry.rank === 1 && "🥇"}
                                            {entry.rank === 2 && "🥈"}
                                            {entry.rank === 3 && "🥉"}
                                            {entry.rank > 3 && `#${entry.rank}`}
                                        </td>
                                        <td className="px-6 py-4 font-mono">{entry.user}</td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-white">{entry.score.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
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
