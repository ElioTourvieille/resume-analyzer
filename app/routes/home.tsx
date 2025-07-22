import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/home";
import { Navbar } from "~/components/Navbar";
import { ResumeCard } from "~/components/ResumeCard";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Un feedback intelligent pour le job de vos rêves !" },
  ];
}

export default function Home() {
  const { auth, isLoading, kv } = usePuterStore()  
  const navigate = useNavigate()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loadingResumes, setLoadingResumes] = useState(false)

  useEffect(() => {
      if(!isLoading && !auth.isAuthenticated) {
          navigate("/auth?next=/")
      }
  }, [auth.isAuthenticated, isLoading])

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true)

      const resumes = (await kv.list("resume:*", true)) as KVItem[]

      const parsedResumes = resumes?.map((resume) => (
        JSON.parse(resume.value) as Resume
      ))

      setResumes(parsedResumes || [])
      setLoadingResumes(false)
    }
    loadResumes()
  }, [])

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
          {!loadingResumes && resumes?.length === 0 ? (
            <h2 className="max-w-3xl">Aucun CV trouvé. Ajoutez-en un pour obtenir des feedbacks.</h2>
          ) : (
            <h2 className="max-w-3xl">Examinez vos postulations et vérifiez les commentaires fournis par l'IA.</h2>
          )}
        </div>
        {loadingResumes && (
          <div className="flex flex-col justify-center items-center">
            <img src="/images/resume-scan-2.gif" alt="Loading" className="w-[200px]" />
          </div>
        )}
      
      {!loadingResumes && resumes.length > 0 && (
      <div className="resumes-section">
        {resumes.map((resume) => (
          <ResumeCard key={resume.id} resume={resume} />  
        ))}
      </div>
      )}

      {!loadingResumes && resumes?.length === 0 && (
        <div className="flex flex-col justify-center items-center mt-10 gap-4">
          <Link to="/upload" className="primary-button w-fit text-xl font-semibold">Télécharger un CV</Link>
        </div>
      )}
      </section>
    </main>
  );
}
