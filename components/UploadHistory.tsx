"use client";

interface HistoryItem {
  file: string;
  original: string;
  uploadedAt: string;
}

interface Props {
  history: HistoryItem[];
  onRestore: (file: string) => void;
}

export default function UploadHistory({
  history,
  onRestore,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-2xl font-bold mb-5">
        Upload History
      </h2>

      {history.length === 0 ? (
        <p className="text-gray-500">
          No previous uploads.
        </p>
      ) : (
        <div className="space-y-4">

          {history.map((item, index) => (

            <div
              key={index}
              className="border rounded-lg p-4 flex justify-between items-center"
            >

              <div>

                <div className="font-semibold">
                  {item.original}
                </div>

                <div className="text-sm text-gray-500">
                  {new Date(item.uploadedAt).toLocaleString()}
                </div>

              </div>

              <button
                onClick={() => {
                    if (confirm("Restore this Excel version?")) {
                        onRestore(item.file);
                    }
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Restore
              </button>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}