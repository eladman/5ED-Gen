import React from 'react';

interface YearStartDialogProps {
  onConfirm: () => void;
  onReject: () => void;
}

const YearStartDialog: React.FC<YearStartDialogProps> = ({ onConfirm, onReject }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-center">מדדים תחילת שנה</h3>
        <p className="text-gray-600 mb-6 text-center">
          האם ביצעת מדידה של המדדים הפיזיים בתחילת השנה?
        </p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="px-6 py-4 bg-[#ff8714] text-white rounded-lg hover:bg-[#e67200] transition-colors"
          >
            כן, יש לי מדדים מתחילת השנה
          </button>
          
          <button
            onClick={onReject}
            className="px-6 py-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            לא, אין לי מדדים מתחילת השנה
          </button>
        </div>
      </div>
    </div>
  );
};

export default YearStartDialog; 