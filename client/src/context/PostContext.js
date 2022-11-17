import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAsync } from "../hooks/useAsync";
import { getPost } from "../services/posts";
import { useParams } from "react-router-dom";
const PostContext = createContext();
export function usePostContext() {
  return useContext(PostContext);
}

export default function PostContextProvider({ children }) {
  const { id } = useParams();
  //   const state = useAsync(() => getPost(id), [id]);
  const { loading, error, value: post } = useAsync(() => getPost(id), [id]);
  const [comments, setComments] = useState([]);
  const commentsByParentId = useMemo(() => {
    const group = {};
    comments.forEach((comment) => {
      group[comment.parentId] ||= [];
      group[comment.parentId].push(comment);
    });
    return group;
  }, [comments]);

  console.log(commentsByParentId);
  function getReplies(parentId) {
    return commentsByParentId[parentId];
  }

  useEffect(() => {
    if (post?.comments == null) return;
    setComments(post.comments);
  }, [post?.comments]);
  return (
    <PostContext.Provider
      value={{
        post: { id, ...post },
        getReplies,
        rootComments: commentsByParentId[null],
      }}>
      {loading ? <h1>Loading...</h1> : error ? <h1>{error}</h1> : children}
    </PostContext.Provider>
  );
}
