import { Button } from 'react-aria-components';

function StartScreen({ onStart }) {
    return (
        <div className="start-screen">
            <h1>Movie Quiz</h1>
            <span>Test your movie knowledge!</span>
            <Button onClick={onStart} className="primary-button">Start Quiz</Button>
        </div>
    );
}

export default StartScreen;