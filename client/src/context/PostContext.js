import { createContext, useContext } from "react";
import { useAsync } from "../hooks/useAsync";
import { getPost } from "../services/posts";
import { useParams } from "react-router-dom";
const PostContext = createContext();
export function usePostContext() {
  return useContext(PostContext);
}

export default function PostContextProvider({ children }) {
  const { id } = useParams();
  const state = useAsync(() => getPost(id), [id]);
  //   const { loading, error, value: post } = useAsync(() => getPost(id), [id]);
  const values = { ...state };
  return <PostContext.Provider value={values}>{children}</PostContext.Provider>;

  //   return (
  //     <PostContext.Provider value={{ post: { id, ...post } }}>
  //       {loading ? <h1>Loading...</h1> : error ? <h1>{error}</h1> : children}
  //     </PostContext.Provider>
  //   );
}
