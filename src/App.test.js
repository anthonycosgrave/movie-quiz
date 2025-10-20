jest.mock('axios');

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import axios from 'axios';
import { mockMovies, mockCredits } from '../tests/fixtures/mockData';

beforeEach(() => {
  axios.get.mockImplementation((url) => {
    // Mock the top_rated movies endpoint
    if (url.includes('top_rated')) {
      return Promise.resolve({
        data: {
          results: mockMovies,
          total_pages: 10
        }
      });
    }
    
    // Mock the credits endpoint
    if (url.includes('/credits')) {
      const movieId = url.match(/movie\/(\d+)\//)[1];
      return Promise.resolve({
        data: mockCredits[movieId]
      });
    }
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('displays error message when GET fails', async () => {
  // Mock a network error (no response property)
  axios.get.mockRejectedValue(new Error('Network Error'));
  
  render(<App />);

  let button = await screen.findByText(/Start Quiz/i);
  fireEvent.click(button);
  
  button = await screen.findByText(/Directors/i);
  fireEvent.click(button);

  const errorMessage = await screen.findByText(/Unable to connect/i);
  expect(errorMessage).toBeInTheDocument();
});

test('displays server error message', async () => {
  axios.get.mockRejectedValue({ 
    response: { status: 500 } 
  });
  
  render(<App />);

  let button = await screen.findByText(/Start Quiz/i);
  fireEvent.click(button);
  
  button = await screen.findByText(/Directors/i);
  fireEvent.click(button);
  
  const errorMessage = await screen.findByText(/TMDb appears to be down/i);
  expect(errorMessage).toBeInTheDocument();
});


test('renders start screen heading', async () => {
  render(<App />);
  const heading = await screen.findByText(/Movie Quiz/i);
  expect(heading).toBeInTheDocument();
});

test('renders start button', async () => {
  render(<App />);
  const button = await screen.findByText(/Start Quiz/i);
  expect(button).toBeInTheDocument();
});

test('renders Categories screen', async () => {
  render(<App />);
  const startButton = await screen.findByText(/Start Quiz/i);
  fireEvent.click(startButton);

  // Check heading
  const heading = await screen.findByRole('heading', { name: /Choose a Category/i });
  expect(heading).toBeInTheDocument();

  // Check all three category buttons
  const yearsButton = screen.getByRole('button', { name: /Release Years/i });
  const directorsButton = screen.getByRole('button', { name: /Directors/i });
  const actorsButton = screen.getByRole('button', { name: /Actors/i });

  expect(yearsButton).toBeInTheDocument();
  expect(directorsButton).toBeInTheDocument();
  expect(actorsButton).toBeInTheDocument();
});

test('announces creating years questions in aria-live polite region', async () => {
  render(<App />);

  const startButton = await screen.findByText(/Start Quiz/i);
  fireEvent.click(startButton);
  
  const yearsButton = await screen.findByText(/Years/i);
  fireEvent.click(yearsButton);
  
  const politeRegion = document.querySelector('[aria-live="polite"]');
  await waitFor(() => {
    expect(politeRegion).toHaveTextContent(/Creating Release Years questions/i);
  });
});

test('announces creating directors questions in aria-live polite region', async () => {
  render(<App />);

  const startButton = await screen.findByText(/Start Quiz/i);
  fireEvent.click(startButton);
  
  const directorsButton = await screen.findByText(/Directors/i);
  fireEvent.click(directorsButton);
  
  const politeRegion = document.querySelector('[aria-live="polite"]');
  await waitFor(() => {
    expect(politeRegion).toHaveTextContent(/Creating Directors questions.../i);
  });
});

test('announces creating actors questions in aria-live polite region', async () => {
  render(<App />);

  const startButton = await screen.findByText(/Start Quiz/i);
  fireEvent.click(startButton);
  
  const actorsButton = await screen.findByText(/Actors/i);
  fireEvent.click(actorsButton);
  
  const politeRegion = document.querySelector('[aria-live="polite"]');
  await waitFor(() => {
    expect(politeRegion).toHaveTextContent(/Creating Actors questions.../i);
  });
});

test('renders incorrect! after incorrect years answer', async () => {
  render(<App />);
  const startButton = await screen.findByText(/Start Quiz/i);
  fireEvent.click(startButton);

  const yearsButton = screen.getByRole('button', { name: /Years/i });
  fireEvent.click(yearsButton);

  // const button = await screen.findByText(/2022/i);
  // fireEvent.click(button);
  const buttons = await screen.findAllByRole('button');
  const wrongButtons = buttons.filter(b => b.textContent !== '2021');
  fireEvent.click(wrongButtons[0]);

  const answer = await screen.findByText(/Incorrect!/i, { ignore: '.sr-only' });
  expect(answer).toBeInTheDocument();
});

test('renders correct! after correct years answer', async () => {
  render(<App />);
  const startButton = await screen.findByText(/Start Quiz/i);
  fireEvent.click(startButton);

  const yearsButton = screen.getByRole('button', { name: /Years/i });
  fireEvent.click(yearsButton);

  const button = await screen.findByText(/2021/i);
  fireEvent.click(button);
  const answer = await screen.findByText(/Correct!/i, { ignore: '.sr-only' });
  expect(answer).toBeInTheDocument();
});

test('renders incorrect! after incorrect director answer', async () => {
  render(<App />);
  const startButton = await screen.findByText(/Start Quiz/i);
  fireEvent.click(startButton);

  const directorsButton = screen.getByRole('button', { name: /Directors/i });
  fireEvent.click(directorsButton);

  const buttons = await screen.findAllByRole('button');
  const wrongButtons = buttons.filter(b => b.textContent !== 'Director #1');
  fireEvent.click(wrongButtons[0]);

  const answer = await screen.findByText(/Incorrect!/i, { ignore: '.sr-only' });
  expect(answer).toBeInTheDocument();
});

test('renders correct! after correct director answer', async () => {
  render(<App />);
  const startButton = await screen.findByText(/Start Quiz/i);
  fireEvent.click(startButton);

  const directorsButton = screen.getByRole('button', { name: /Directors/i });
  fireEvent.click(directorsButton);

  const button = await screen.findByText(/Director #1/i);
  fireEvent.click(button);
  const answer = await screen.findByText(/Correct!/i, { ignore: '.sr-only' });
  expect(answer).toBeInTheDocument();
});

test('renders incorrect! after incorrect actor answer', async () => {
  render(<App />);
  const startButton = await screen.findByText(/Start Quiz/i);
  fireEvent.click(startButton);

  const actorsButton = screen.getByRole('button', { name: /Actors/i });
  fireEvent.click(actorsButton);
  
  const buttons = await screen.findAllByRole('button');
  const wrongButton = buttons.find(btn => /Actor #[2-5]/.test(btn.textContent));
  fireEvent.click(wrongButton);
  
  const answer = await screen.findByText(/Incorrect!/i, { ignore: '.sr-only' });
  expect(answer).toBeInTheDocument();
});

test('renders correct! after correct actor answer', async () => {
  render(<App />);
  const startButton = await screen.findByText(/Start Quiz/i);
  fireEvent.click(startButton);

  const actorsButton = screen.getByRole('button', { name: /Actors/i });
  fireEvent.click(actorsButton);

  const button = await screen.findByText(/Actor #1/i);
  fireEvent.click(button);
  const answer = await screen.findByText(/Correct!/i, { ignore: '.sr-only' });
  expect(answer).toBeInTheDocument();
})

test('disables answer buttons after selection', async () => {
  render(<App />);
  const startButton = await screen.findByText(/Start Quiz/i);
  fireEvent.click(startButton);

  const yearsButton = screen.getByRole('button', { name: /Years/i });
  fireEvent.click(yearsButton);

  const button = await screen.findByText('2021');
  fireEvent.click(button);
  
  // Check if button is disabled
  expect(button).toBeDisabled();
});

test('shows correct answer when answering incorrectly', async () => {
  render(<App />);
  const startButton = await screen.findByText(/Start Quiz/i);
  fireEvent.click(startButton);

  const yearsButton = screen.getByRole('button', { name: /Years/i });
  fireEvent.click(yearsButton);

  const button = await screen.findByText('2022'); // Wrong answer
  fireEvent.click(button);
  
  const correctAnswer = await screen.findByText(/The correct answer is: 2021/i, { ignore: '.sr-only'});
  expect(correctAnswer).toBeInTheDocument();
});

test('announces correct answer in aria-live assertive region', async () => {
  render(<App />);
  
  const startButton = await screen.findByText(/Start Quiz/i);
  fireEvent.click(startButton);
  
  const yearsButton = await screen.findByText(/Years/i);
  fireEvent.click(yearsButton);
  
  const correctButton = await screen.findByText('2021');
  fireEvent.click(correctButton);

  const assertiveRegion = document.querySelector('[aria-live="assertive"]');
  await waitFor(() => {
    expect(assertiveRegion).toHaveTextContent(/Correct!/i);
  });
});

test('announces incorrect answer in aria-live assertive region', async () => {
  render(<App />);
  
  const startButton = await screen.findByText(/Start Quiz/i);
  fireEvent.click(startButton);
  
  const yearsButton = await screen.findByText(/Years/i);
  fireEvent.click(yearsButton);
  
  const correctButton = await screen.findByText('2022');
  fireEvent.click(correctButton);

  const assertiveRegion = document.querySelector('[aria-live="assertive"]');
  await waitFor(() => {
    expect(assertiveRegion).toHaveTextContent(/Incorrect!/i);
  });
});

test('announces question number in aria-live polite region', async () => {
  render(<App />);

  const startButton = await screen.findByText(/Start Quiz/i);
  fireEvent.click(startButton);
  
  const yearsButton = await screen.findByText(/Years/i);
  fireEvent.click(yearsButton);
  
  const firstAnswer = await screen.findByText('2021');
  fireEvent.click(firstAnswer);
  
  const politeRegion = document.querySelector('[aria-live="polite"]');
  await waitFor(() => {
    expect(politeRegion).toHaveTextContent(/Question 1 of 5/i);
  });
});
;

test('announces next question number in aria-live polite region', async () => {
  render(<App />);
  
  const startButton = await screen.findByText(/Start Quiz/i);
  fireEvent.click(startButton);
  const yearsButton = await screen.findByText(/Years/i);
  fireEvent.click(yearsButton);
  
  const firstAnswer = await screen.findByText('2021');
  fireEvent.click(firstAnswer);
  
  const nextButton = await screen.findByText(/Next Question/i);
  fireEvent.click(nextButton);
  
  const politeRegion = document.querySelector('[aria-live="polite"]');
  await waitFor(() => {
    expect(politeRegion).toHaveTextContent(/Question 2 of 5/i);
  });
});

test('shows quiz complete screen after answering all questions', async () => {
  render(<App />);
  const startButton = await screen.findByText(/Start Quiz/i);
  fireEvent.click(startButton);

  let button = await screen.findByText(/Years/i);
  fireEvent.click(button);

  button = await screen.findByText('2021');
  fireEvent.click(button);

  let nextButton = await screen.findByText(/Next Question/i);
  fireEvent.click(nextButton);

  button = await screen.findByText('2022');
  fireEvent.click(button);

  nextButton = await screen.findByText(/Next Question/i);
  fireEvent.click(nextButton);

  button = await screen.findByText('2023');
  fireEvent.click(button);

  nextButton = await screen.findByText(/Next Question/i);
  fireEvent.click(nextButton);

  button = await screen.findByText('2004');
  fireEvent.click(button);

  nextButton = await screen.findByText(/Next Question/i);
  fireEvent.click(nextButton);

  button = await screen.findByText('2005');
  fireEvent.click(button);

  const resultsButton = await screen.findByText(/See Results/i);
  fireEvent.click(resultsButton);
  
  const completeHeading = await screen.findByText(/Quiz Complete!/i, { ignore: '.sr-only'});
  expect(completeHeading).toBeInTheDocument();
  
  const score = await screen.findByText(/Score: \d+ \/ \d+/i, { ignore: '.sr-only' });
  expect(score).toBeInTheDocument();
});

test('announces quiz complete in aria-live assertive region', async () => {
  render(<App />);
  const startButton = await screen.findByText(/Start Quiz/i);
  fireEvent.click(startButton);

  let button = await screen.findByText(/Years/i);
  fireEvent.click(button);

  button = await screen.findByText('2021');
  fireEvent.click(button);

  let nextButton = await screen.findByText(/Next Question/i);
  fireEvent.click(nextButton);

  button = await screen.findByText('2022');
  fireEvent.click(button);

  nextButton = await screen.findByText(/Next Question/i);
  fireEvent.click(nextButton);

  button = await screen.findByText('2023');
  fireEvent.click(button);

  nextButton = await screen.findByText(/Next Question/i);
  fireEvent.click(nextButton);

  button = await screen.findByText('2004');
  fireEvent.click(button);

  nextButton = await screen.findByText(/Next Question/i);
  fireEvent.click(nextButton);

  button = await screen.findByText('2005');
  fireEvent.click(button);

  const resultsButton = await screen.findByText(/See Results/i);
  fireEvent.click(resultsButton);
  
  const politeRegion = document.querySelector('[aria-live="assertive"]');
  await waitFor(() => {
    expect(politeRegion).toHaveTextContent(/Quiz Complete!/i);
  });
});