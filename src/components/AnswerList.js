import { Button } from 'react-aria-components';

function AnswerList({answers = [], selectedAnswer = null, onAnswerClick = null}) {
    return (
        <div key={answers.length > 0 ? answers[0] : 99} className="answer-list screen-transition">
            {answers.map((answer, idx) => (
                <Button 
                    onClick={() => onAnswerClick(idx)} 
                    isDisabled = {selectedAnswer !== null}
                    key={answer}
                    className={`answer-button ${selectedAnswer === idx ? 'selected-answer' : ''}`}
                >
                    {answer}
                </Button>
            ))}
        </div>
    );
}

export default AnswerList;