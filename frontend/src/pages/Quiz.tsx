import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useQuestionStore } from '../stores/questionStore'
import { motion } from 'framer-motion'
import { ArrowLeft, RotateCcw, AlertCircle } from 'lucide-react'

const Quiz: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { currentQuestion, loading, error, fetchRandomQuestion, submitAnswer } = useQuestionStore()
  
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [resultData, setResultData] = useState<any>(null)
  const [showCalculationPaper, setShowCalculationPaper] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)

  // Initialize canvas
  useEffect(() => {
    if (showCalculationPaper && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        setContext(ctx)
      }
    }
  }, [showCalculationPaper])

  // Fetch first question on mount
  useEffect(() => {
    if (user?.id) {
      fetchRandomQuestion(user.id)
    }
  }, [user?.id])

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    context.beginPath()
    context.moveTo(x, y)
    setIsDragging(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !context || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    context.lineWidth = 2
    context.strokeStyle = '#1e293b'
    context.lineTo(x, y)
    context.stroke()
  }

  const stopDrawing = () => {
    if (context) {
      context.closePath()
    }
    setIsDragging(false)
  }

  const clearCanvas = () => {
    if (canvasRef.current && context) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !user?.id || !currentQuestion?.id) return
    
    try {
      const result = await submitAnswer(user.id, currentQuestion.id, selectedAnswer)
      setResultData(result)
      setShowResult(true)
    } catch (err) {
      console.error(err)
    }
  }

  const handleNextQuestion = () => {
    setSelectedAnswer('')
    setShowResult(false)
    setResultData(null)
    if (user?.id) {
      fetchRandomQuestion(user.id)
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

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-slate-700 rounded-lg p-8 border border-slate-600 shadow-lg">
              {loading && !currentQuestion ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                  <p className="text-slate-300 mt-4">載入題目中...</p>
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
                  <AlertCircle size={20} className="text-red-400" />
                  <p className="text-red-300">{error}</p>
                </div>
              ) : currentQuestion ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Question Header */}
                  <div className="mb-6 pb-6 border-b border-slate-600">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium">
                          {currentQuestion.subject}
                        </span>
                        <span className="ml-3 text-slate-300">{currentQuestion.year} 年</span>
                      </div>
                      <div className="text-right text-sm">
                        {currentQuestion.correct_rate && (
                          <p className="text-slate-400">答對率: {(currentQuestion.correct_rate * 100).toFixed(1)}%</p>
                        )}
                        <p className="text-slate-400">難度: {'⭐'.repeat(currentQuestion.difficulty)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="mb-8">
                    <p className="text-lg font-semibold mb-6 whitespace-pre-wrap leading-relaxed">
                      {currentQuestion.content_stem}
                    </p>
                    <div className="space-y-3">
                      {['A', 'B', 'C', 'D'].map((option) => (
                        <motion.button
                          key={option}
                          onClick={() => !showResult && setSelectedAnswer(option)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full p-4 rounded-lg text-left border-2 transition ${
                            selectedAnswer === option
                              ? 'border-blue-400 bg-blue-600 bg-opacity-20'
                              : 'border-slate-600 hover:border-slate-500 hover:bg-slate-600 hover:bg-opacity-50'
                          } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                          disabled={showResult}
                        >
                          <span className="font-bold text-lg">{option}.</span>
                          <span className="ml-3">{currentQuestion.content_options[option]}</span>
                          
                          {showResult && resultData && option === resultData.correct_answer && (
                            <span className="ml-2 text-green-400">✓</span>
                          )}
                          {showResult && selectedAnswer === option && option !== resultData.correct_answer && (
                            <span className="ml-2 text-red-400">✗</span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Result or Submit */}
                  {!showResult ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!selectedAnswer}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 disabled:cursor-not-allowed"
                    >
                      提交答案
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-slate-600 rounded-lg p-6 mb-6 border border-slate-500"
                    >
                      <p className={`text-lg font-bold mb-2 ${resultData?.is_correct ? 'text-green-400' : 'text-red-400'}`}>
                        {resultData?.is_correct ? '✓ 回答正確！' : '✗ 回答錯誤'}
                      </p>
                      <p className="text-slate-300 mb-4">
                        正確答案: <span className="font-bold text-blue-400">{resultData?.correct_answer}</span>
                      </p>
                      {resultData?.explanation && (
                        <div className="mb-4 p-3 bg-slate-700 rounded-lg border border-slate-500">
                          <p className="text-slate-300">{resultData.explanation}</p>
                        </div>
                      )}
                      <button
                        onClick={handleNextQuestion}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <RotateCcw size={18} />
                        下一題
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ) : null}
            </div>
          </div>

          {/* Calculation Paper & Controls */}
          <div className="lg:col-span-1 space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCalculationPaper(!showCalculationPaper)}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              {showCalculationPaper ? '❌' : '📝'} 計算紙
            </motion.button>

            {showCalculationPaper && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-700 rounded-lg p-4 border-2 border-purple-600 shadow-lg"
              >
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={400}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full bg-white rounded border border-slate-600 cursor-crosshair"
                />
                <button
                  onClick={clearCanvas}
                  className="w-full mt-3 bg-slate-600 hover:bg-slate-500 text-white py-2 px-3 rounded transition text-sm"
                >
                  清除
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Quiz
