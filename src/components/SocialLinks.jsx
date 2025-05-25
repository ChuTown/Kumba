export default function SocialLinks() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center">Join Our Community</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                    href="#" // Add your Twitter link
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg transition-colors"
                >
                    <span className="mr-2">Twitter</span>
                    {/* You can add Twitter icon here */}
                </a>

                <a
                    href="#" // Add your launchpad link
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-lg transition-colors"
                >
                    <span className="mr-2">Launch Pad</span>
                    {/* You can add launch icon here */}
                </a>

                <a
                    href="#" // Add your charity link
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg transition-colors"
                >
                    <span className="mr-2">Charity</span>
                    {/* You can add charity icon here */}
                </a>
            </div>
        </div>
    );
} 