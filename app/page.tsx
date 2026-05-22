"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type ContentType = "news" | "ad";
type LabelGroup = "badge" | "sentence" | "interactive";

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getLabelGroup(labelCondition: number): LabelGroup {
  if (labelCondition <= 3) return "badge";
  if (labelCondition <= 6) return "sentence";
  return "interactive";
}

export default function HomePage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

const handleNext = async () => {
  if (!agreed) {
    alert("연구 참여에 동의하신 후 다음 단계로 진행할 수 있습니다.");
    return;
  }

  setIsSubmitting(true);

  const labelConditions = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const contentTypes: ContentType[] = ["news", "ad"];

  const allConditions = labelConditions.flatMap((labelCondition) =>
    contentTypes.map((contentType) => ({
      label_condition: labelCondition,
      label_group: getLabelGroup(labelCondition),
      content_type: contentType,
      count: 0,
    }))
  );

  const { data: participants, error: readError } = await supabase
    .from("participants")
    .select("label_condition, content_type");

  if (readError) {
    console.error("참가자 조회 오류:", JSON.stringify(readError, null, 2));
    alert("참가자 배정 중 오류가 발생했습니다.");
    setIsSubmitting(false);
    return;
  }

  participants?.forEach((p) => {
    const matched = allConditions.find(
      (c) =>
        c.label_condition === p.label_condition &&
        c.content_type === p.content_type
    );

    if (matched) {
      matched.count += 1;
    }
  });

  const minCount = Math.min(...allConditions.map((c) => c.count));

  const candidateConditions = allConditions.filter(
    (c) => c.count === minCount
  );

  const selectedCondition =
    candidateConditions[
      Math.floor(Math.random() * candidateConditions.length)
    ];

  const { data, error } = await supabase
    .from("participants")
    .insert([
      {
        label_condition: selectedCondition.label_condition,
        label_group: selectedCondition.label_group,
        content_type: selectedCondition.content_type,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("참가자 저장 오류:", JSON.stringify(error, null, 2));
    alert("참가자 저장 중 오류가 발생했습니다.");
    setIsSubmitting(false);
    return;
  }

  localStorage.setItem("participant_id", data.id);
  localStorage.setItem("label_condition", String(data.label_condition));
  localStorage.setItem("label_group", data.label_group || "");
  localStorage.setItem("content_type", data.content_type || "");

  setIsSubmitting(false);
  router.push("/survey");
};

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow">
        <div className="border-b px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900"></h1>
          <p className="mt-2 text-sm text-gray-600">
            아래 내용을 충분히 읽으신 후 연구 참여 여부를 선택해 주세요.
          </p>
        </div>

        <div className="h-[65vh] overflow-y-auto px-8 py-6 space-y-8 text-sm leading-7 text-gray-800">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              1. 연구 배경과 목적
            </h2>
            <p>
              본 연구는 소셜미디어에서 AI 생성 콘텐츠에 부착되는 라벨의 효과를
              알아보기 위한 연구입니다. 본 연구의 결과는 AI 콘텐츠 라벨링 정책의
              실효성에 관한 학문적 연구를 확장하고, 보다 효과적인 라벨링 설계를
              위한 시사점을 제공할 것으로 기대됩니다.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              2. 연구 참여 대상
            </h2>
            <p>
              본 연구는 한국어 의사소통 및 독해가 가능하고, 만 19세 이상의
              성인이며, 소셜미디어를 사용해 본 경험이 있는 분을 대상으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              3. 연구 수행방법
            </h2>
            <p>
              연구 참여자는 시스템에 의해 9개 라벨 조건 중 하나와 콘텐츠 유형
              조건인 뉴스 또는 광고 중 하나에 무작위로 배정됩니다.
              <br />
              이후 모의 소셜미디어 피드에서 텍스트, 사진, 동영상 형식의 게시물
              총 3개를 확인하고, 각 게시물에 대해 정확성 인식, 즉각적으로 떠오른
              생각, 공유 의도에 관한 문항에 응답하게 됩니다.
              <br />
              좋아요 및 댓글 버튼은 실제 소셜미디어 화면과 유사한 환경을
              구성하기 위해 표시되지만, 본 실험에서는 비활성화되어 있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              4. 연구대상자의 연구참여 기간 및 소요되는 시간
            </h2>
            <p>
              본 연구는 1회 참여로 완료되며, 별도의 추가 방문이나 후속 참여는
              없습니다. 총 소요 시간은 약 5~10분입니다.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              5. 연구참여에 따른 위험
            </h2>
            <p>
              본 연구는 신체적 시술이나 물리적 처치를 포함하지 않습니다. 연구
              절차는 일상적인 소셜미디어 이용과 유사한 수준의 활동이며, 연구
              참여로 인한 위험은 일상생활에서 경험하는 수준을 초과하지 않을
              것으로 예상됩니다.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              6. 연구참여에 따른 이익
            </h2>
            <p>
              본 연구에 참여함으로써 귀하에게 돌아가는 직접적인 이익은 없습니다.
              다만, 본 연구의 결과는 소셜미디어 플랫폼의 AI 콘텐츠 라벨링 정책
              수립 및 효과적인 라벨 디자인 가이드라인 개발에 학술적 근거를
              제공하는 데 기여할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              7. 연구참여로 발생할 수 있는 위험 및 손실에 대한 안전대책과 보상
            </h2>
            <p>
              본 연구는 최소위험 연구로 신체적 손상의 가능성이 없습니다. 실험 중
              불편함을 느끼는 경우 언제든지 브라우저를 닫아 실험을 중단할 수
              있습니다. 실험 참여에 대한 보상은 연구자가 안내한 절차에 따라
              지급됩니다.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              8. 개인정보 보호 및 제공에 관한 사항
            </h2>
            <p>본 연구에서 수집하는 정보는 다음과 같습니다.</p>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <li>조건 배정 정보: 라벨 조건, 콘텐츠 유형 조건</li>
              <li>
                게시물 응답 데이터: 정확성 인식, 게시물을 보고 바로 든 생각,
                공유 의도
              </li>
              <li>
                행동 로그 데이터: 게시물별 체류 시간, 라벨 클릭 여부, 모달 창
                확인 여부 및 각 이벤트 발생 시각
              </li>
            </ul>
            <p className="mt-3">
              본 연구는 귀하의 성명, 연락처, 주소, 소속, IP 주소 등 개인을 직접
              식별할 수 있는 정보를 수집하지 않습니다. 모든 데이터는 시스템이
              자동 생성한 무작위 참가자 ID로만 구분됩니다.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              9. 자발적 참여, 자유로운 동의 철회
            </h2>
            <p>
              본 연구에 대한 참여는 전적으로 자발적이며, 참여에 동의한 이후에도
              언제든지 이유를 밝히지 않고 자유롭게 참여를 중단할 수 있습니다.
              참여를 중단하더라도 어떠한 불이익도 발생하지 않습니다.
            </p>
            <p className="mt-3">
              실험 도중 참여를 중단하고자 하는 경우 브라우저를 닫으면 즉시
              실험이 중단됩니다. 이 경우 미완료 데이터는 불완전 데이터로
              분류되어 분석 대상에서 제외될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              10. 연구 관련 자료 보관 및 폐기에 관한 사항
            </h2>
            <p>
              수집된 디지털 자료는 연구 목적으로만 사용되며, 연구 종료 후 관련
              규정에 따라 보관 및 폐기됩니다. 데이터는 무작위 참가자 ID를
              기준으로 관리되며, 개인을 직접 식별할 수 있는 정보와 연결되지
              않습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              11. 문의처
            </h2>
            <p>
              연구책임자: dbtmdwp3562@naver.com
              <br />
              한양대학교 기관생명윤리위원회 담당자: 02-2220-0673
            </p>
          </section>
        </div>

        <div className="border-t px-8 py-5">
          <div className="mb-4 flex items-start gap-3">
            <input
              id="agree"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="agree" className="text-sm text-gray-800 leading-6">
              본 연구 설명을 충분히 읽었으며, 연구에 참여하는 것에 동의합니다.
            </label>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={!agreed || isSubmitting}
              className="rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "처리 중..." : "다음"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
