import { useState, type FormEvent } from "react"
import { Navbar } from "~/components/Navbar"
import FileUploader from "~/components/FileUploader"
import { usePuterStore } from "~/lib/puter"
import { useNavigate } from "react-router"
import { convertPdfToImage } from "~/lib/pdfToImage"
import { generateUUID } from "~/lib/utils"
import {prepareInstructions} from "../../constants";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore()
    const navigate = useNavigate()
    const [isProcessing, setIsProcessing] = useState(false)
    const [statusText, setStatusText] = useState("")
    const [file, setFile] = useState<File | null>(null)

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({companyName, jobTitle, jobDescription, file }: {companyName: string, jobTitle: string, jobDescription: string, file: File}) => {
        setIsProcessing(true)
        setStatusText("Chargement du fichier...")

        const uploadedFile = await fs.upload([file])
        if(!uploadedFile) return setStatusText("Erreur lors de l'upload du fichier");
 
        setStatusText("Conversion en image...")
        const imageFile = await convertPdfToImage(file)
        if(!imageFile.file) return setStatusText("Erreur lors de la conversion en image");

        setStatusText("Téléchargement de l'image...")
        const uploadedImage = await fs.upload([imageFile.file])
        if(!uploadedImage) return setStatusText("Erreur lors du téléchargement de l'image");

        setStatusText("Analyse du CV...")

        const uuid = generateUUID()
        const data = {
            id: uuid,
            companyName,jobTitle,jobDescription,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            feedback: "",
        }
        await kv.set(`resume:${uuid}`, JSON.stringify(data))

        setStatusText("Analyse en cours...")

        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({jobTitle, jobDescription})
        )
        if(!feedback) return setStatusText("Erreur lors de l'analyse du CV");

        const feedbackText = typeof feedback.message.content === "string" ? feedback.message.content : feedback.message.content[0].text;

        data.feedback = JSON.parse(feedbackText)
        await kv.set(`resume:${uuid}`, JSON.stringify(data))
        setStatusText("Analyse terminée")
        navigate(`/feedback/${uuid}`)
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget.closest("form")
        if (!form) return;
        const formData = new FormData(form)

        const companyName = formData.get("company-name") as string
        const jobTitle = formData.get("job-title") as string
        const jobDescription = formData.get("job-description") as string

        if(!file) return;
        
        handleAnalyze({companyName, jobTitle, jobDescription, file})
    }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar />

    <section className="main-section">
        <div className="page-heading py-16">
            <h1>Un feedback intelligent pour le job de vos rêves</h1>
            {isProcessing ? (
                <>
                    <h2>{statusText}</h2>
                    <img src="/images/resume-scan.gif" alt="Resume Scan" />
                </>  
            ) : (
                <h2>Déposez votre CV pour obtenir un score ATS et des conseils pour l'améliorer</h2>
            )}
            {!isProcessing && (
                <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                    <div className="form-div">
                        <label htmlFor="company-name" className="font-bold">Nom de l'entreprise</label>
                        <input type="text" id="company-name" name="company-name" placeholder="Nom de l'entreprise" />
                    </div>
                    <div className="form-div">
                        <label htmlFor="job-title" className="font-bold">Intitulé du poste</label>
                        <input type="text" id="job-title" name="job-title" placeholder="Intitulé du poste" />
                    </div>
                    <div className="form-div">
                        <label htmlFor="job-description" className="font-bold">Description du poste</label>
                        <textarea rows={5} id="job-description" name="job-description" placeholder="Description du poste" />
                    </div> 

                    <div className="form-div">
                        <label htmlFor="uploader" className="font-bold">Uploader votre CV</label>
                        <FileUploader onFileSelect={handleFileSelect} />
                    </div>

                    <button className="primary-button" type="submit">Analyser votre CV</button>
                </form>
            )}
        </div>
    </section>
    </main>
  )
}

export default Upload