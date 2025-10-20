import { Button } from 'react-aria-components';

function Feedback({isCorrect = false, currentQuestionNumber = 0, totalQuestions = 0, correctAnswer = '', onNextClick = null}) {

    return (
        <div className="feedback">
            <p>{isCorrect ? 'Correct!' : `Incorrect! The correct answer is: ${correctAnswer}`}</p>
            <Button className="primary-button" onClick={onNextClick}>
                {currentQuestionNumber === totalQuestions ? 'See Results' : 'Next Question'}
            </Button>
        </div>
    )
}

export default Feedback;