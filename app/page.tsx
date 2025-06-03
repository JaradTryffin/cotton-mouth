"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PacmanLoader } from "react-spinners";

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard')
  }, [])

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="flex flex-col">
        <PacmanLoader color="#59e4a8"  size={100}/>
        <h1 className="text-3xl mt-10">Starting up...</h1>
      </div>

    </div>
  );
}
