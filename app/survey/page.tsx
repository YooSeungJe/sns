"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function SurveyPage() {
  const router = useRouter();

  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [snsUsage, setSnsUsage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!gender || !ageGroup || !snsUsage) {
      alert("모든 문항에 응답해 주세요.");
      return;
    }

    const participantId =
      typeof window !== "undefined"
        ? localStorage.getItem("participant_id")
        : null;

    if (!participantId) {
      alert("참가자 정보가 없습니다. 처음부터 다시 시작해 주세요.");
      router.push("/");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from("participants")
      .update({
        gender,
        age_group: ageGroup,
        sns_usage: snsUsage,
      })
      .eq("id", participantId);

    setIsSubmitting(false);

    if (error) {
      console.error("인구통계 정보 저장 오류:", error);
      alert("응답 저장 중 오류가 발생했습니다.");
      return;
    }

    router.push("/feed");
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow">
        <div className="border-b px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">기초 설문</h1>
          <p className="mt-2 text-sm text-gray-600">
            아래 문항에 응답한 후 실험을 시작해 주세요.
          </p>
        </div>

        <div className="px-8 py-8 space-y-10">
          <section>
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              1. 귀하의 성별은?
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm text-gray-800">
                <input
                  type="radio"
                  name="gender"
                  value="남자"
                  checked={gender === "남자"}
                  onChange={(e) => setGender(e.target.value)}
                />
                남자
              </label>

              <label className="flex items-center gap-3 text-sm text-gray-800">
                <input
                  type="radio"
                  name="gender"
                  value="여자"
                  checked={gender === "여자"}
                  onChange={(e) => setGender(e.target.value)}
                />
                여자
              </label>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              2. 귀하의 연령은?
            </h2>
            <div className="space-y-3">
              {["20대", "30대", "40대", "50대", "60대 이상"].map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 text-sm text-gray-800"
                >
                  <input
                    type="radio"
                    name="ageGroup"
                    value={option}
                    checked={ageGroup === option}
                    onChange={(e) => setAgeGroup(e.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              3. 귀하는 주 몇 회 SNS를 이용하십니까?
            </h2>
            <div className="space-y-3">
              {[
                "0회 (이용하지 않음)",
                "1~2회",
                "3~4회",
                "5~6회",
                "매일 (7회 이상)",
              ].map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 text-sm text-gray-800"
                >
                  <input
                    type="radio"
                    name="snsUsage"
                    value={option}
                    checked={snsUsage === option}
                    onChange={(e) => setSnsUsage(e.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="border-t px-8 py-5 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800 disabled:bg-gray-400"
          >
            {isSubmitting ? "저장 중..." : "실험 시작"}
          </button>
        </div>
      </div>
    </main>
  );
}
