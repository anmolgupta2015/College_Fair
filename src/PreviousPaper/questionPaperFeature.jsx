import { Upload, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"

const QuestionPaperOptions = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Question Paper Portal</h1>
          <p className="mt-3 text-lg text-gray-600">Choose an option to continue</p>
        </div>

        {/* Main options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload option */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all cursor-pointer group" onClick={()=>{navigate("/question_paper/question_paper_upload")}}>
            <div className="h-2 bg-purple-500" ></div>
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                <Upload className="h-8 w-8 text-purple-600"/>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-700 transition-colors">
                Upload Question Paper
              </h2>
              <p className="text-gray-600">
                Share question papers with your peers and help others prepare for their exams
              </p>
            </div>
          </div>

          {/* Find option */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all cursor-pointer group" onClick={()=>{navigate("/question_paper/question_paper_browse")}}>
            <div className="h-2 bg-blue-500" ></div>
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors">
                Find Question Paper
              </h2>
              <p className="text-gray-600">
                Search and access question papers to help you prepare for your upcoming exams
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionPaperOptions
