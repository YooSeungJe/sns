"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConsentPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  const handleStart = () => {
    if (!checked) {
      alert("동의 후 실험을 시작할 수 있습니다.");
      return;
    }

    router.push("/survey");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-xl bg-white p-8 rounded-xl shadow">
        <h1 className="text-xl font-bold mb-6">연구 참여 동의서</h1>

        <div className="text-sm leading-7 text-gray-700 space-y-4">
          <p>
            1. 나는 본 연구의 설명서를 읽었으며 본 연구의 목적, 방법, 위험, 이익
            등에 대한 충분한 설명을 듣고 이해하였습니다.
          </p>

          <p>
            2. 나는 모든 궁금한 사항에 대해 질문하였고, 충분한 답변을
            들었습니다.
          </p>

          <p>3. 나는 이 연구에 참여하는 것에 대하여 자발적으로 동의합니다.</p>

          <p>
            4. 나는 이 연구에서 얻어진 나에 대한 정보를 현행 법률과
            기관생명윤리위원회 규정이 허용하는 범위 내에서 연구자가 수집하고
            처리하는데 동의합니다.
          </p>
          <p>
            5. 나는 담당 연구자가 연구를 진행하거나 결과 관리를 하는 경우와
            연구기관, 연구비지원기관 및 정부기관이 실태 조사를 하는 경우에는
            비밀로 유지되는 나의 개인 신상 정보를 직접적으로 열람하는 것에
            동의합니다.
          </p>
          <p>
            6. 나는 언제라도 이 연구의 참여를 철회할 수 있고 이러한 결정이
            나에게 어떠한 해도 되지 않을 것이라는 것을 압니다.
          </p>
          <p>
            7. 나의 서명은 이 동의서의 사본을 받았다는 것을 뜻하며 연구 참여가
            끝날 때까지 사본을 보관하겠습니다.
          </p>
        </div>

        <div className="flex items-center mt-6 gap-2">
          <input
            type="checkbox"
            id="consent"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />

          <label htmlFor="consent" className="text-sm">
            위 내용을 읽고 연구 참여에 동의합니다.
          </label>
        </div>

        <button
          onClick={handleStart}
          className="mt-6 w-full bg-black text-white py-3 rounded-lg"
        >
          실험 시작
        </button>
      </div>
    </main>
  );
}
