import { useNavigate } from "react-router";
import { resumes } from "../../constants";
import type { Route } from "./+types/home";
import { Navbar } from "~/components/Navbar";
import { ResumeCard } from "~/components/ResumeCard";
import { useEffect } from "react";
import { usePuterStore } from "~/lib/puter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Un feedback intelligent pour le job de vos rêves !" },
  ];
}

export default function Home() {
  const { auth, isLoading } = usePuterStore()  
  const navigate = useNavigate()

  useEffect(() => {
      if(!isLoading && !auth.isAuthenticated) {
          navigate("/auth?next=/")
      }
  }, [auth.isAuthenticated, isLoading])


  if (isLoading) {
    return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Suivez vos candidatures & l'évaluation de vos CV</h1>
          <h2 className="max-w-3xl">Examinez vos postulations et vérifiez les commentaires fournis par l'IA.</h2>
        </div>
      
      {resumes.length > 0 && (
      <div className="resumes-section">
        {resumes.map((resume) => (
          <ResumeCard key={resume.id} resume={resume} />  
        ))}
      </div>
      )}
      </section>
    </main>
  );
}
