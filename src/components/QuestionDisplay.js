function QuestionDisplay({questionText='', questionNumber=0, totalQuestions=0, ref}) {
    /* 
        React 19+ ref is ref, no forwardRef anymore!

        ref used for focus management - focuses question text when it changes
    */
    return  ( 
        <div key={questionNumber} className="question-display screen-transition">
            <p>Question {questionNumber} of {totalQuestions}</p> 
            <p ref={ref} tabIndex={-1}>{questionText}</p> 
        </div>
    );
}

export default QuestionDisplay;