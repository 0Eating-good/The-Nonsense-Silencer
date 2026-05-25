import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useQuestionStore } from '../stores/questionStore'
import { ArrowLeft, AlertCircle, RotateCcw } from 'lucide-react'
import axios from 'axios'
import { motion } from 'framer-motion'

interface WrongQuestion {
  question_id: string
  user_answer: string
  correct_answer: string
  attempt_count: number
  last_attempt_date: string
  question: {
    id: string
    subject: string
    year: number
    difficulty: number
    content_stem: string
    content_options: Record<string, string>
    explanation: string | null
  }
}

const WrongQuestions: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { submitAnswer } = useQuestionStore()
  
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<WrongQuestion | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [resultData, setResultData] = useState<any>(null)

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    if (user?.id) {
      fetchWrongQuestions()
    }
  }, [user?.id])

  const fetchWrongQuestions = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE}/progress/wrong-questions`, {
        params: {
          user_id: user.id,
          limit: 100
        }
      })
      setWrongQuestions(response.data)
    } catch (error) {
      console.error('Error fetching wrong questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectQuestion = (question: WrongQuestion) => {
    setSelectedQuestion(question)
    setUserAnswer('')
    setShowResult(false)
    setResultData(null)
  }

  const handleSubmitAnswer = async () => {
    if (!userAnswer || !user?.id || !selectedQuestion) return
    
    try {
      const result = await submitAnswer(user.id, selectedQuestion.question_id, userAnswer)
      setResultData(result)
      setShowResult(true)
    } catch (err) {
      console.error(err)
    }
  }

  const handleRemoveFromWrong = async () => {
    if (!user?.id || !selectedQuestion) return
    
    try {
      await axios.delete(`${API_BASE}/progress/mastered/${selectedQuestion.question_id}`, {
        params: { user_id: user.id }
      })
      
      setWrongQuestions(prev => 
        prev.filter(q => q.question_id !== selectedQuestion.question_id)
      )
      setSelectedQuestion(null)
    } catch (error) {
      console.error('Error removing from wrong questions:', error)
    }
  }

  const handleNextWrongQuestion = () => {
    const currentIndex = wrongQuestions.findIndex(
      q => q.question_id === selectedQuestion?.question_id
    )
    if (currentIndex < wrongQuestions.length - 1) {
      handleSelectQuestion(wrongQuestions[currentIndex + 1])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 p-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          返回首頁
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">❌ 錯題複習</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            <p className="text-slate-300 mt-4">載入中...</p>
          </div>
        ) : wrongQuestions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Wrong Questions List */}
            <div className="lg:col-span-1">
              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600 max-h-96 overflow-y-auto">
                <h2 className="text-lg font-bold mb-4">錯題列表 ({wrongQuestions.length})</h2>
                <div className="space-y-2">
                  {wrongQuestions.map((q, index) => (
                    <motion.button
                      key={q.question_id}
                      onClick={() => handleSelectQuestion(q)}
                      whileHover={{ scale: 1.02 }}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedQuestion?.question_id === q.question_id
                          ? 'bg-blue-600 border-blue-400'
                          : 'bg-slate-600 border-slate-500 hover:border-slate-400'
                      }`}
                    >
                      <p className="text-sm font-medium">第 {index + 1} 題</p>
                      <p className="text-xs text-slate-300">{q.question.subject}</p>
                      <p className="text-xs text-red-400">錯誤次數: {q.attempt_count}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Question Detail */}
            <div className="lg:col-span-2">
              {selectedQuestion ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-700 rounded-lg p-8 border border-slate-600"
                >
                  {/* Header */}
                  <div className="mb-6 pb-6 border-b border-slate-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-red-600 px-3 py-1 rounded text-sm font-medium">
                          {selectedQuestion.question.subject}
                        </span>
                        <span className="ml-3 text-slate-300">
                          {selectedQuestion.question.year} 年
                        </span>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-slate-400">
                          難度: {'⭐'.repeat(selectedQuestion.question.difficulty)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Question */}
                  <div className="mb-8">
                    <p className="text-lg font-semibold mb-6 whitespace-pre-wrap">
                      {selectedQuestion.question.content_stem}
                    </p>
                    <div className="space-y-3">
                      {['A', 'B', 'C', 'D'].map((option) => (
                        <motion.button
                          key={option}
                          onClick={() => !showResult && setUserAnswer(option)}
                          whileHover={{ scale: 1.02 }}
                          className={`w-full p-4 rounded-lg text-left border-2 transition ${
                            userAnswer === option
                              ? 'border-blue-400 bg-blue-600 bg-opacity-20'
                              : 'border-slate-600 hover:border-slate-500'
                          } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                          disabled={showResult}
                        >
                          <span className="font-bold">{option}.</span>
                          <span className="ml-3">
                            {selectedQuestion.question.content_options[option]}
                          </span>
                          {showResult && option === selectedQuestion.correct_answer && (
                            <span className="ml-2 text-green-400">✓ 正確答案</span>
                          )}
                          {showResult && userAnswer === option && 
                            option !== selectedQuestion.correct_answer && (
                            <span className="ml-2 text-red-400">✗ 你的答案</span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Result */}
                  {!showResult ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!userAnswer}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition"
                    >
                      提交答案
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="bg-slate-600 rounded-lg p-4 border border-slate-500">
                        <p className={`font-bold mb-2 ${
                          resultData?.is_correct ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {resultData?.is_correct ? '✓ 這次答對了！' : '✗ 還是答錯了'}
                        </p>
                        {resultData?.explanation && (
                          <p className="text-slate-300 text-sm">{resultData.explanation}</p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleNextWrongQuestion}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <RotateCcw size={18} />
                          下一題
                        </button>
                        {resultData?.is_correct && (
                          <button
                            onClick={handleRemoveFromWrong}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
                          >
                            從錯題移除
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <div className="bg-slate-700 rounded-lg p-8 border border-slate-600 text-center">
                  <AlertCircle size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-slate-300">選擇一道題目開始複習</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-700 rounded-lg border border-slate-600">
            <p className="text-2xl text-slate-300">🎉</p>
            <p className="text-xl text-slate-300 mt-4">目前還沒有錯題紀錄</p>
            <p className="text-slate-400 mt-2">繼續加油！</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default WrongQuestions
