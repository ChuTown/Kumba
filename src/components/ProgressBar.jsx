export default function ProgressBar({ amount }) {
    // This is a placeholder max amount - you'll want to set this based on your goals
    const maxAmount = 1000;
    const progress = (amount / maxAmount) * 100;

    return (
        <div className="space-y-2">
            <div className="h-6 w-full bg-purple-900/30 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>
            <div className="flex justify-between text-sm">
                <span>{amount.toFixed(2)} SOL</span>
                <span>{maxAmount} SOL Goal</span>
            </div>
        </div>
    );
} 