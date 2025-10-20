import { Button } from 'react-aria-components';

import Score from './Score';

function ResultsScreen({score = 0, totalQuestions=0, onPlayAgain = null}) {
    return (
        <div className="results-screen">
            <h1 tabIndex={-1}>Quiz Complete!</h1>
            <p>
                <Score score={score} totalQuestions={totalQuestions} />
            </p>
            <Button onClick={onPlayAgain} className="primary-button">Play Again</Button>
        </div>
    );
}

export default ResultsScreen;