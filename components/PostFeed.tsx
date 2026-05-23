"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

type MediaType = "text" | "image" | "video";
type ContentType = "news" | "ad";
type LabelGroup = "badge" | "sentence" | "interactive";

type Post = {
  id: string;
  caption: string;
  media_url?: string | null;
  media_type: MediaType;
  content_type: ContentType;
  label_condition: number;
  label_group: LabelGroup;
};

const LABELS: Record<
  number,
  {
    group: LabelGroup;
    text: string;
    modalTitle?: string;
    modalBody?: string;
  }
> = {
  1: { group: "badge", text: "AI-생성" },
  2: { group: "badge", text: "오해 소지 있음" },
  3: { group: "badge", text: "AI-생성/오해 소지 있음" },
  4: {
    group: "sentence",
    text: "이 콘텐츠는 AI로 생성되었습니다. 실제 인물·사건과 다를 수 있습니다.",
  },
  5: {
    group: "sentence",
    text: "이 콘텐츠는 오해의 소지가 있는 정보를 포함할 수 있습니다. 신중한 판단이 필요합니다.",
  },
  6: {
    group: "sentence",
    text: "이 콘텐츠는 AI로 생성되었으며, 오해의 소지가 있는 정보를 포함할 수 있습니다. 신중한 판단이 필요합니다.",
  },
  7: {
    group: "interactive",
    text: "AI-생성",
    modalTitle: "AI 생성 콘텐츠 정보",
    modalBody:
      "AI 생성 콘텐츠(AIGC)는 인공지능에 의해 생성되거나 수정된 이미지, 영상 및/또는 오디오를 포함합니다. 여기에는 실제 사람과 유사한 모습이나 특정 예술 스타일(예: 회화, 만화, 애니메이션)로 만들어진 인공적인 시각물, 영상 또는 음향 등이 포함될 수 있습니다.\n\n예시:\n• 실제 인물의 이미지, 목소리 또는 발화 내용이 AI에 의해 수정된 영상\n• 실제 사건이나 장면을 AI로 변경한 이미지 또는 영상\n• 실제 또는 가상의 사람, 장소, 사건을 완전히 AI로 생성한 콘텐츠",
  },
  8: {
    group: "interactive",
    text: "오해 소지 있음",
    modalTitle: "오해 소지 정보",
    modalBody:
      "AI 생성 콘텐츠(AIGC)는 인공지능에 의해 생성되거나 수정된 이미지, 영상 및/또는 오디오를 포함합니다. 여기에는 실제 사람과 유사한 모습이나 특정 예술 스타일(예: 회화, 만화, 애니메이션)로 만들어진 인공적인 시각물, 영상 또는 음향 등이 포함될 수 있습니다.\n\n예시:\n• 실제 인물의 이미지, 목소리 또는 발화 내용이 AI에 의해 수정된 영상\n• 실제 사건이나 장면을 AI로 변경한 이미지 또는 영상\n• 실제 또는 가상의 사람, 장소, 사건을 완전히 AI로 생성한 콘텐츠",
  },
  9: {
    group: "interactive",
    text: "AI-생성/오해 소지 있음",
    modalTitle: "AI 생성 및 오해 소지 정보",
    modalBody:
      "AI 생성 콘텐츠(AIGC)는 인공지능에 의해 생성되거나 수정된 이미지, 영상 및/또는 오디오를 포함합니다. 여기에는 실제 사람과 유사한 모습이나 특정 예술 스타일(예: 회화, 만화, 애니메이션)로 만들어진 인공적인 시각물, 영상 또는 음향 등이 포함될 수 있습니다.\n\n이 콘텐츠는 오해의 소지가 있는 정보를 포함할 수 있습니다. 실제 사실과 다를 수 있으므로 내용을 그대로 받아들이기보다 신중한 판단이 필요합니다.\n\n예시:\n• 실제 인물의 이미지, 목소리 또는 발화 내용이 AI에 의해 수정된 영상\n• 실제 사건이나 장면을 AI로 변경한 이미지 또는 영상\n• 실제 또는 가상의 사람, 장소, 사건을 완전히 AI로 생성한 콘텐츠",
  },
};

export default function PostFeed() {
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [accuracyResponse, setAccuracyResponse] = useState("");
  const [thoughtResponse, setThoughtResponse] = useState("");
  const [shareIntentionResponse, setShareIntentionResponse] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const startTimeRef = useRef<number>(0);
  const modalStartTimeRef = useRef<number>(0);

  const currentPost = posts[currentIndex];
  const currentLabel = currentPost ? LABELS[currentPost.label_condition] : null;

  const getParticipantId = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("participant_id");
  };

  useEffect(() => {
    const loadPosts = async () => {
      const participantId = getParticipantId();
      const labelCondition = localStorage.getItem("label_condition");
      const contentType = localStorage.getItem("content_type");

      if (!participantId || !labelCondition || !contentType) {
        alert("실험 정보가 없습니다. 처음부터 다시 시작해 주세요.");
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("label_condition", Number(labelCondition))
        .eq("content_type", contentType)
        .in("media_type", ["text", "image", "video"]);

      if (error) {
        console.error("게시물 불러오기 오류:", JSON.stringify(error, null, 2));
        setIsLoadingPosts(false);
        return;
      }

      const mediaOrder: Record<string, number> = {
        text: 1,
        image: 2,
        video: 3,
      };

      const sortedPosts = (data || []).sort(
        (a, b) => mediaOrder[a.media_type] - mediaOrder[b.media_type],
      );

      setPosts(sortedPosts);
      setIsLoadingPosts(false);
    };

    loadPosts();
  }, [router]);

  const logEvent = async (eventType: string, eventValue: string = "") => {
    const participantId = getParticipantId();

    if (!participantId || !currentPost) return;

    const { error } = await supabase.from("event_logs").insert([
      {
        participant_id: participantId,
        post_id: currentPost.id,
        event_type: eventType,
        event_value: eventValue,
      },
    ]);

    if (error) {
      console.error("이벤트 로그 저장 오류:", JSON.stringify(error, null, 2));
    }
  };

  useEffect(() => {
    const participantId = getParticipantId();

    if (!currentPost || !participantId) return;

    startTimeRef.current = Date.now();
    logEvent("post_view_start");
  }, [currentIndex, currentPost]);

  const resetResponses = () => {
    setAccuracyResponse("");
    setThoughtResponse("");
    setShareIntentionResponse("");
    setIsModalOpen(false);
  };

  const handleSaveResponse = async () => {
    const participantId = getParticipantId();

    if (!participantId || !currentPost) return false;

    const duration = Date.now() - startTimeRef.current;

    const { error } = await supabase.from("post_responses").insert([
      {
        participant_id: participantId,
        post_id: currentPost.id,

        media_type: currentPost.media_type,
        content_type: currentPost.content_type,
        label_condition: currentPost.label_condition,
        label_group: currentPost.label_group,

        accuracy_response: accuracyResponse,
        thought_response: thoughtResponse,
        share_intention_response: shareIntentionResponse,
        view_duration_ms: duration,
      },
    ]);

    if (error) {
      console.error("응답 저장 오류:", JSON.stringify(error, null, 2));
      alert("응답 저장에 실패했습니다.");
      return false;
    }

    await logEvent("response_submit");
    await logEvent("view_duration", String(duration));

    return true;
  };

  const handleNext = async () => {
    if (
      !accuracyResponse.trim() ||
      !thoughtResponse.trim() ||
      !shareIntentionResponse.trim()
    ) {
      alert("세 문항에 모두 응답해 주세요.");
      return;
    }

    const saved = await handleSaveResponse();
    if (!saved) return;

    if (currentIndex < posts.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetResponses();
    } else {
      router.push("/end");
    }
  };

  if (isLoadingPosts) {
    return <div className="p-6">게시물을 불러오는 중입니다...</div>;
  }

  if (!currentPost || !currentLabel) {
    return (
      <div className="p-6">
        표시할 게시물이 없습니다. Supabase posts 테이블에 현재 배정 조건에 맞는
        게시물이 있는지 확인해 주세요.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] flex justify-center px-4 py-8">
      <div className="w-full max-w-[470px]">
        <div className="mb-4 flex items-center justify-between px-1">
          <h1 className="text-xl font-bold tracking-tight">Instagram</h1>
          <div className="text-sm text-gray-500">
            {currentIndex + 1} / {posts.length}
          </div>
        </div>

        <div className="mb-4 px-1 text-sm text-gray-600">
          평소 SNS를 이용하듯 게시물을 확인한 뒤, 아래 문항에 응답해 주세요.
        </div>

        <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <header className="flex items-center justify-between px-4 py-3">
            <div className="text-sm font-semibold">추천 게시물</div>
          </header>

          {currentLabel.group === "badge" && (
  <div className="mx-4 mb-2 inline-flex rounded-full bg-gray-100 px-3 py-1.5 text-base font-bold text-gray-900">
    {currentLabel.text}
  </div>
)}

          {currentLabel.group === "sentence" && (
            <div className="mx-4 mb-2 px-4 py-2 rounded-xl text-base text-gray-800 bg-gray-100 leading-6">
              {currentLabel.text}
            </div>
          )}

          {currentLabel.group === "interactive" && (
            <div className="mx-4 mb-2 flex items-center gap-2">
              <button
                onClick={async () => {
                  modalStartTimeRef.current = Date.now();
                  setIsModalOpen(true);
                  await logEvent("label_click");
                  await logEvent("modal_open");
                }}
                className="px-3 py-1.5 rounded-full bg-gray-100 text-base font-medium text-gray-800 transition-transform duration-150 hover:scale-105"
              >
                {currentLabel.text}
              </button>

              <button
                onClick={async () => {
                  modalStartTimeRef.current = Date.now();
                  setIsModalOpen(true);
                  await logEvent("label_click");
                  await logEvent("modal_open");
                }}
                className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none p-0"
              >
                자세히 보기
              </button>
            </div>
          )}

          <div className="bg-black">
            {currentPost.media_type === "text" && (
              <div className="flex min-h-[470px] w-full items-center justify-center bg-white px-10 py-10">
                <div className="max-w-[340px] text-left text-base font-semibold leading-8 text-gray-900">
                  {currentPost.caption}
                </div>
              </div>
            )}

            {currentPost.media_type === "image" &&
              (currentPost.media_url ? (
                <img
                  src={currentPost.media_url}
                  alt="post"
                  className="w-full max-h-[70vh] object-contain bg-black"
                />
              ) : (
                <div className="flex h-[470px] w-full items-center justify-center bg-gray-200 text-gray-500">
                  이미지 없음
                </div>
              ))}

            {currentPost.media_type === "video" &&
              (currentPost.media_url ? (
                <video
                  src={currentPost.media_url}
                  controls
                  className="w-full max-h-[70vh] object-contain bg-black"
                />
              ) : (
                <div className="flex h-[470px] w-full items-center justify-center bg-gray-200 text-gray-500">
                  동영상 없음
                </div>
              ))}
          </div>

          {currentPost.media_type !== "text" && (
            <section className="px-4 pt-3">
              <div className="mb-3 text-sm leading-6 text-gray-900">
                <span>{currentPost.caption}</span>
              </div>
            </section>
          )}

          <section className="px-4 pb-4 pt-3">
            <div className="mb-3 flex items-center gap-5">
              <button
                type="button"
                disabled
                className="flex items-center gap-1 text-sm text-gray-600 opacity-70 cursor-not-allowed"
              >
                <span className="text-2xl leading-none">♡</span>
                <span>좋아요</span>
              </button>

              <button
                type="button"
                disabled
                className="flex items-center gap-1 text-sm text-gray-600 opacity-70 cursor-not-allowed"
              >
                <span className="text-2xl leading-none">↗</span>
                <span>공유</span>
              </button>
            </div>

            <div className="my-5 border-t border-gray-200"></div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
  {currentPost.media_type === "image"
    ? "이 게시물의 내용이 얼마나 사실 같다고 느끼셨나요? 어떤 부분이 믿음직스러웠고, 어떤 부분이 의심스러웠는지, 그리고 그렇게 느낀 이유는 무엇인지 자유롭게 적어주세요."
    : "이 게시물을 보고 어떤 인상이나 판단이 드시는지, 그리고 그러한 판단으로 이어진 부분이 있다면 무엇이었는지 자유롭게 적어주세요."}
</label>
                <textarea
                  value={accuracyResponse}
                  onChange={(e) => setAccuracyResponse(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder-gray-400 outline-none focus:border-black"
                  rows={3}
                  placeholder="응답을 입력해 주세요."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  이 게시물을 처음 봤을 때 머릿속에 떠오른 생각이나 느낌을
                  떠오르는 순서대로 자유롭게 적어주세요.
                </label>
                <textarea
                  value={thoughtResponse}
                  onChange={(e) => setThoughtResponse(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder-gray-400 outline-none focus:border-black"
                  rows={3}
                  placeholder="응답을 입력해 주세요."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
  {currentPost.media_type === "image"
    ? "이 게시물을 SNS에서 본다면 공유하실 것 같나요? 공유하실 것 같다면 누구에게 어떤 이유로 보내실 것 같은지, 공유하지 않으실 것 같다면 그 이유는 무엇인지 자유롭게 적어주세요."
    : "이 게시물을 본 후, 자연스럽게 떠오른 다음 행동이 있다면 자유롭게 적어주세요. 한 가지여도 좋고 여러 개여도 좋습니다."}
</label>
                <textarea
                  value={shareIntentionResponse}
                  onChange={(e) => setShareIntentionResponse(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder-gray-400 outline-none focus:border-black"
                  rows={3}
                  placeholder="응답을 입력해 주세요."
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleNext}
                className="w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                {currentIndex < posts.length - 1
                  ? "다음 게시물 보기"
                  : "응답 완료하기"}
              </button>
            </div>
          </section>
        </article>
      </div>

      {isModalOpen && currentLabel.group === "interactive" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-3 text-lg font-bold">
              {currentLabel.modalTitle}
            </h2>

            <p className="mb-5 text-sm leading-6 text-gray-700 whitespace-pre-wrap">
              {currentLabel.modalBody}
            </p>

            <button
              onClick={async () => {
                const modalDuration = Date.now() - modalStartTimeRef.current;
                await logEvent("modal_close", String(modalDuration));
                setIsModalOpen(false);
              }}
              className="w-full rounded-xl bg-black px-4 py-3 text-white"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
