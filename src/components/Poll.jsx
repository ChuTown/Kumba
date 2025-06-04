// components/Poll.jsx
import { Turnstile } from '@marsidev/react-turnstile';
import React, { useState, useEffect  } from 'react';

function Poll() {
  const [pollData, setPollData] = useState({
    question: 'Which organization should we support next?',
    options: [],
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const totalVotes = pollData.options.reduce((sum, option) => sum + option.votes, 0);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/organizations');
        const orgs = await res.json(); // now [{ id, name }, ...]
        const options = orgs.map((org) => ({
          id: org.id,
          text: org.name,
          votes: 0,
        }));
        setPollData({
          question: 'Which organization should we support next?',
          options
        });
      } catch (err) {
        console.error('Failed to load organizations:', err);
      }
    };

    fetchOrganizations();
  }, []);

  const handleOptionChange = (e) => setSelectedOption(e.target.value);

  const formRef = React.useRef(null)

  const handleSubmitVote = async (event) => {

    event.preventDefault()
    const formData = new FormData(formRef.current)
    const token = formData.get('cf-turnstile-response')
    console.log("Token from Captcha: " + token)

    // Now we need to confirm the Captcha token is valid
    try {

      const res = await fetch('http://localhost:5000/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token })
      });

      const data = await res.json();

      if (data.success) {
        console.log('TOKEN IS GOOOOOOOOD');
      } else {
        console.error('TOKEN IS BAAAAAD:', data.error);
        return // RETURN IF BAD TOKEN -- DO NOT VOTE
      }

    } catch (err) {
      console.error('Error verifying Turnstile Token:', err);
      return // RETURN IF BAD TOKEN -- DO NOT VOTE
    }

    // DO NOT CONTINUE IF CAPTCHA KEY IS VALID
    // DO NOT CONTINUE
    // DO NOT CONTINUE

    if (selectedOption && !hasVoted) {
      try {
        const res = await fetch('http://localhost:5000/api/submit_vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ option_id: selectedOption })
        });
        const data = await res.json();

        if (data.success) {
          const countRes = await fetch('http://localhost:5000/api/vote_counts');
          const voteCounts = await countRes.json();

          setPollData((prev) => ({
            ...prev,
            options: prev.options.map((option) => {
              const match = voteCounts.find((vc) => vc.id === option.id);
              return {
                ...option,
                votes: match ? match.votes : 0
              };
            }),
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

          <form ref={formRef} onSubmit={handleSubmitVote}>
            <Turnstile siteKey='1x00000000000000000000AA' />
            <button
              type='submit'
              disabled={!selectedOption}
              className={`w-full py-3 px-4 rounded-md text-white font-semibold transition-all duration-300
              ${selectedOption
                ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                : 'bg-gray-400 cursor-not-allowed'
              }`}
            >Vote</button>
          </form>

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
