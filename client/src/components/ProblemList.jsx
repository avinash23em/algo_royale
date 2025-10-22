import React from 'react';

const ProblemList = ({ problems, onProblemSelect, selectedProblemId }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="w-full max-w-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Problems</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {problems.map((problem) => (
          <div
            key={problem._id}
            onClick={() => onProblemSelect(problem._id)}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedProblemId === problem._id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-800">{problem.title}</h4>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                  problem.difficulty
                )}`}
              >
                {problem.difficulty}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProblemList;

