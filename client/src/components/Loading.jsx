import { useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext"
import { useEffect } from "react";


const Loading = () => {
  const {naivgate} = useAppContext();
  let {search} = useLocation();
  const query = new URLSearchParams(search);
  const nextUrl = query.get('next');

  useEffect(() => {
    if(nextUrl) {
      setTimeout(() => {
        naivgate(`/${nextUrl}`)
      }, 5000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextUrl]);
  return (
    <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-24 w-24 border-4 border-gray-300 border-t-primary"></div>
    </div>
  )
}

export default Loading