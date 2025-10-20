import QuestionDisplay from './QuestionDisplay';
import AnswerList from './AnswerList';
import Feedback from './Feedback';

function QuizScreen({
    totalQuestions = 0,
    selectedCategory = '',
    currentQuestionId = 0,
    currentQuestion = {},
    ref,
    selectedAnswer = null,
    isCorrect = false,
    onAnswerClick = null,
    onNextClick = null
}) {
    return (
        <div className="quiz-screen">
            <h1>{selectedCategory}</h1>
            <QuestionDisplay 
                questionText={currentQuestion.question}
                questionNumber={currentQuestionId + 1}
                totalQuestions={totalQuestions}
                ref={ref}
            />
            <AnswerList
                answers={currentQuestion.answers}
                selectedAnswer={selectedAnswer}
                onAnswerClick={onAnswerClick}
            />


            {selectedAnswer !== null && (
                <Feedback 
                selectedAnswer={currentQuestion.answers[selectedAnswer]} 
                isCorrect = {isCorrect}
                currentQuestionNumber={currentQuestionId}
                totalQuestions={totalQuestions-1}
                correctAnswer={currentQuestion.answers[currentQuestion.correctAnswer]}
                onNextClick={onNextClick}
                />
            )}
    </div>
    )
}

export default QuizScreen;