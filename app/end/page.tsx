"use client";

import { useState } from "react";

export default function EndPage() {
  const [deleteData, setDeleteData] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    // TODO: 여기에서 Supabase 등 DB 삭제 처리 가능
    console.log("데이터 삭제 요청:", deleteData);

    setSubmitted(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-2xl font-bold">참여해주셔서 감사합니다.</h1>

        <p className="text-white-700 leading-relaxed">
          모든 게시물 탐색이 완료되어 실험이 종료되었습니다.
          <br />본 연구에 참여해주셔서 진심으로 감사드립니다.
        </p>

        <p className="text-white-700 leading-relaxed">
          보상은 <span className="font-semibold">Prolific 플랫폼</span>을 통해
          지급됩니다.
        </p>

        {/* 데이터 삭제 안내 */}
        <div className="text-left bg-gray-50 p-4 rounded-lg border">
          <p className="text-sm text-gray-700 mb-3">
            연구 참여자는 언제든지 자신의 데이터 삭제를 요청할 수 있으며, 요청
            시 해당 데이터는 즉시 폐기됩니다.
          </p>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={deleteData}
              onChange={(e) => setDeleteData(e.target.checked)}
            />
            <span className="text-sm text-gray-500">
              내 실험 데이터를 삭제 요청합니다.
            </span>
          </label>
        </div>

        {/* 제출 버튼 */}
        <button
          onClick={handleSubmit}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
        >
          완료하기
        </button>

        {/* 제출 완료 메시지 */}
        {submitted && (
          <p className="text-green-600 font-medium">
            요청이 정상적으로 처리되었습니다. 감사합니다!
          </p>
        )}
      </div>
    </main>
  );
}
