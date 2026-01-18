export default function QuestionOfTheDay() {
  return (
    <div className="bg-white rounded-xl shadow p-4 sticky top-24">
      <h2 className="text-lg font-semibold mb-2">
        🧠 Question of the Day
      </h2>

      <p className="text-gray-700 mb-4">
        What is one thing that made you smile today?
      </p>

      <textarea
        placeholder="Write your answer..."
        className="w-full border rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        disabled 
      />
 
      <button
        disabled
        className="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg text-sm opacity-60 cursor-not-allowed"
      >
        Respond
      </button>
    </div>
  );
}
