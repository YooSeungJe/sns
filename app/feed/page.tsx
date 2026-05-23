import { supabase } from "../../lib/supabase";
import PostFeed from "../../components/PostFeed";

export default async function FeedPage() {
  const { data: posts, error } = await supabase.from("posts").select("*");

  if (error) {
    return <div>게시물을 불러오는 중 오류가 발생했습니다.</div>;
  }

  return <PostFeed />;
}
