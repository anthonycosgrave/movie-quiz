import { useState, useRef, useEffect } from 'react';
import { useMovieQuestions } from './hooks/useMovieQuestions';

import './App.css';
import ErrorScreen from './components/ErrorScreen';
import StartScreen from './components/StartScreen';
import Categories from './components/Categories';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';

 const categoryNames = {
      'years': 'Release Years',
      'directors': 'Directors',
      'actors': 'Actors'
  };

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categorySelected, setCategorySelected] = useState(false);

  const categoriesRef = useRef(null);
  const { questions, isLoading, error } = useMovieQuestions(selectedCategory);
  
  const currentQuestionRef = useRef(null);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  useEffect(() => {
    if (categoriesRef.current && quizStarted && !categorySelected) {
      setTimeout(() => {
        categoriesRef.current?.focus();
      }, 0);
    }
  }, [quizStarted, categorySelected]);

  useEffect(() => {
    if (isLoading && selectedCategory) {
      setPoliteMessage(`Creating ${categoryNames[selectedCategory]} questions...`);
    }
  }, [isLoading, selectedCategory]);

  useEffect(() => {
    if (currentQuestionRef.current && categorySelected && !isLoading) {
      setTimeout(() => {
        currentQuestionRef.current?.focus();
      }, 0);
    }
  }, [currentQuestionId, categorySelected, isLoading]);

  useEffect(() => {
    if (categorySelected && !isLoading && questions.length > 0) {
      setPoliteMessage(`Question 1 of ${questions.length}`);
    }
  }, [categorySelected, isLoading, questions.length]);

  useEffect(() => {
    if (quizComplete) {
      setAssertiveMessage(`Quiz Complete! Your score: ${score} out of ${questions.length}`);
    }
  }, [quizComplete, score, questions.length]);

  const handleNext = () => {
    if (currentQuestionId < questions.length - 1) {
      setSelectedAnswer(null);
      const nextQuestionId = currentQuestionId + 1;
      setCurrentQuestionId(nextQuestionId);
      setPoliteMessage(`Question ${nextQuestionId + 1} of ${questions.length}`);
    }
    else {
      setQuizComplete(true);
    }
  };

  const handleAnswerClick = (idx) => {
    // won't have selectedAnswer until re-render so use idx.
    setSelectedAnswer(idx);
    const answerText = questions[currentQuestionId].answers[idx];
    const correctAnswerText = questions[currentQuestionId].answers[questions[currentQuestionId].correctAnswer];
    let msg = '';

    if (idx === questions[currentQuestionId].correctAnswer) {
      setScore(score + 1);
      msg = `You selected: ${answerText}. Correct!`;
    } else {
      msg = `You selected: ${answerText}. Incorrect! The correct answer is: ${correctAnswerText}`;
    }
    setAssertiveMessage(msg);
  };

  const handlePlayAgain = () => {
    setQuizComplete(false);
    setCategorySelected(false);
    setSelectedCategory(null);
    setScore(0);
    setSelectedAnswer(null);
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setCategorySelected(true);
    setCurrentQuestionId(0);
    setQuizStarted(true);
  };

  const currentQuestion = currentQuestionId !== null ? questions[currentQuestionId] : null;
  const isCorrect = currentQuestionId !== null && selectedAnswer === currentQuestion?.correctAnswer;

  // Determine what to render
  let content;

  if (error) {
    content = <ErrorScreen errorType={error} />
  } else if (quizComplete) {
    content = <ResultsScreen 
        score={score}
        totalQuestions={questions.length}
        onPlayAgain={handlePlayAgain}
    />;
  } else if (!quizStarted) {
    content = <StartScreen onStart={() => { setQuizStarted(true); setCurrentQuestionId(0); }} />;
  } else if (!categorySelected || isLoading) {
    content = <Categories 
                isLoading={isLoading} 
                selectedCategoryName={categoryNames[selectedCategory]}
                ref={categoriesRef} 
                onSelectCategory={handleSelectCategory} />;
  } else {
    content = <QuizScreen 
          totalQuestions={questions.length}
          currentQuestionId={currentQuestionId}
          currentQuestion={currentQuestion}
          selectedCategory={categoryNames[selectedCategory]}
          ref={currentQuestionRef}
          selectedAnswer={selectedAnswer}
          isCorrect={isCorrect}
          onAnswerClick={handleAnswerClick}
          onNextClick={handleNext}
        />;
  }

  // trigger transitions
  const screenKey = `${quizStarted}-${categorySelected}-${quizComplete}`;
  return (
    <main className="App">
      <div aria-live="polite" className="sr-only">{politeMessage}</div>
      <div aria-live="assertive" className="sr-only">{assertiveMessage}</div>
      <div key={screenKey} className="screen-transition">
        {content}
      </div>
    </main>
  );
}

export default App;
