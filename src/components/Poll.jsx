// components/Poll.jsx
import React, { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

function Poll() {
  const [pollData, setPollData] = useState({
    question: 'What is your favorite programming language for web development?',
    options: [
      { id: 'js', text: 'JavaScript', votes: 15 },
      { id: 'python', text: 'Python', votes: 10 },
      { id: 'typescript', text: 'TypeScript', votes: 20 },
      { id: 'go', text: 'Go', votes: 5 },
    ],
  });

  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  const totalVotes = pollData.options.reduce((sum, option) => sum + option.votes, 0);

  const handleOptionChange = (e) => setSelectedOption(e.target.value);

  const handleSubmitVote = async () => {
    if (selectedOption && !hasVoted) {
      try {
        const res = await fetch('http://localhost:5000/api/submit_vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ option_id: selectedOption })
        });
        const data = await res.json();
        if (data.success) {
          console.log('Vote successfully submitted');
          setPollData((prev) => ({
            ...prev,
            options: prev.options.map((option) =>
              option.id === selectedOption ? { ...option, votes: option.votes + 1 } : option
            ),
          }));
          setHasVoted(true);
        } else {
          console.error('Failed to submit vote:', data.error);
        }
      } catch (err) {
        console.error('Error submitting vote:', err);
      }
    }
  };

  const calculatePercentage = (votes) => {
    if (totalVotes === 0) return '0.0%';
    return `${((votes / totalVotes) * 100).toFixed(1)}%`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl mx-auto my-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{pollData.question}</h2>

      {!hasVoted ? (
        <div>
          <div className="space-y-4 mb-6">
            {pollData.options.map((option) => (
              <label
                key={option.id}
                htmlFor={option.id}
                className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  id={option.id}
                  name="pollOption"
                  value={option.id}
                  checked={selectedOption === option.id}
                  onChange={handleOptionChange}
                  className="form-radio h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 rounded-full"
                />
                <span className="ml-3 text-lg text-gray-700">{option.text}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleSubmitVote}
            disabled={!selectedOption}
            className={`w-full py-3 px-4 rounded-md text-white font-semibold transition-all duration-300
              ${selectedOption
                ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                : 'bg-gray-400 cursor-not-allowed'
              }`}
          >
            Vote
          </button>
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Poll Results</h3>
          <div className="space-y-4">
            {pollData.options.map((option) => (
              <div key={option.id} className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-lg font-medium text-gray-800">{option.text}</span>
                  <span className="text-md font-bold text-blue-600">{calculatePercentage(option.votes)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: calculatePercentage(option.votes) }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500 mt-1 self-end">{option.votes} votes</span>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 mt-6 text-md">Thank you for participating!</p>
        </div>
      )}
    </div>
  );
}

export default Poll;
