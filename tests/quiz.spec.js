import { test, expect } from '@playwright/test';
import { mockMovies, mockCredits } from './fixtures/mockData';

const QUIZ_LENGTH = 5;

test.beforeEach(async ({ page }) => {
    await page.route('**/movie/top_rated**', async route => {
        await route.fulfill({
            status: 200,
            body: JSON.stringify({
                results: mockMovies,
                total_pages: 10
            })
        });
    });
});

async function startQuiz(page) {
    const startButton = page.getByRole('button', { name: /Start Quiz/i});
    await startButton.click();
}

test('quiz start page renders', async ({ page }) => {
    await page.goto('/');
    const startButton = page.getByRole('button', {
        name: /Start Quiz/i
    });
    await expect(startButton).toBeVisible();
});

test('clicking Start Quiz displays categories', async ({ page }) => {
    await page.goto('/');

    await startQuiz(page);

    await expect(page.getByRole('heading').filter({ hasText: 'Choose a Category' })).toBeVisible();

    const categoryButtons = page.getByRole('button');
    await expect(categoryButtons).toHaveCount(3);
});

test('Clicking on a category displays loading screen', async ({ page }) => {
    await page.goto('/');

    await startQuiz(page);

    const yearsButton = page.getByRole('button', { name: /Release Years/});
    await yearsButton.click();

    await expect(page.getByTestId('loading-message')).toBeVisible();
});

test('displays feedback when player answers correctly', async ({ page }) => {
    await page.goto('/');

    await startQuiz(page);

    const yearsButton = page.getByRole('button', { name: /Release Years/});
    await yearsButton.click();

    await expect(page.getByRole('paragraph').filter({ hasText: 'Question 1 of' })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: 'What year was "Movie #1" released?' })).toBeVisible();

    const answerButtons = page.getByRole('button').filter({ hasNotText: /Start Quiz|Next Question/i });
    const answerButton = page.getByRole('button', { name: /2021/i });
    await answerButton.click();

    // RGB not hex!
    await expect(answerButton).toHaveCSS('background-color', 'rgb(255, 107, 53)');
    await expect(answerButton).toHaveCSS('cursor', 'not-allowed');

    const allButtons = page.getByRole('button').filter({ hasNotText: /Next Question|See Results/i });
    const otherButtons = allButtons.filter({ hasNotText: /2021/i }); // exclude selected answer

    // Check all other buttons are grey
    const count = await otherButtons.count();
    for (let i = 0; i < count; i++) {
        // RGB not hex!
        await expect(otherButtons.nth(i)).toHaveCSS('background-color', 'rgb(204, 204, 204)');
        await expect(otherButtons.nth(i)).toHaveCSS('cursor', 'not-allowed');
    }

    await expect(page.getByRole('paragraph').filter({ hasText: 'Correct!' })).toBeVisible();
    
    await expect(answerButtons.first()).toBeDisabled();
    await expect(page.getByRole('button', { name: /Next Question/i })).toBeVisible();

});

test('displays feedback and shows correct answer when player answers incorrectly', async ({ page }) => {
    await page.goto('/');

    await startQuiz(page);

    const yearsButton = page.getByRole('button', { name: /Release Years/});
    await yearsButton.click();

    await expect(page.getByRole('paragraph').filter({ hasText: 'Question 1 of' })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: 'What year was "Movie #1" released?' })).toBeVisible();

    const answerButtons = page.getByRole('button').filter({ hasNotText: /Start Quiz|Next Question/i });
    const answerButton = page.getByRole('button', { name: /2022/i });
    await answerButton.click();

    // RGB not hex!
    await expect(answerButton).toHaveCSS('background-color', 'rgb(255, 107, 53)');
    await expect(answerButton).toHaveCSS('cursor', 'not-allowed');

    const allButtons = page.getByRole('button').filter({ hasNotText: /Next Question|See Results/i });
    const otherButtons = allButtons.locator(':not(.selected-answer)'); // exclude selected answer

    // Check all other buttons are grey
    const count = await otherButtons.count();
    for (let i = 0; i < count; i++) {
        // RGB not hex!
        await expect(otherButtons.nth(i)).toHaveCSS('background-color', 'rgb(204, 204, 204)');
        await expect(otherButtons.nth(i)).toHaveCSS('cursor', 'not-allowed');
    }

    await expect(page.getByRole('paragraph').filter({ hasText: 'Incorrect! The correct answer is: 2021' })).toBeVisible();
    
    await expect(answerButtons.first()).toBeDisabled();
    await expect(page.getByRole('button', { name: /Next Question/i })).toBeVisible();

});

async function answerQuestionAndContinue(page) {
    const answerButtons = page.getByRole('button').filter({ hasNotText: /Start Quiz|Next Question|See Results/i });
    await answerButtons.first().click();
    const nextButton = page.getByRole('button', { name: /Next Question|See Results/i });
    await nextButton.click();
}

test('completes full years quiz and displays final score', async ({ page }) => {
    await page.goto('/');
    await startQuiz(page);
    
    const yearsButton = page.getByRole('button', { name: /Release Years/});
    await yearsButton.click();

    // Answer all questions
    for (let i = 0; i < QUIZ_LENGTH; i++) {
        await answerQuestionAndContinue(page);
    }
    await expect(page.getByRole('heading', { name: 'Quiz Complete!' })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: 'Score:' })).toBeVisible();

    const playAgainButton = page.getByRole('button', { name: /Play Again/});
    await expect(playAgainButton).toBeVisible();
});


test('completes full directors quiz and displays final score', async ({ page }) => {
    await page.goto('/');
    await page.route('**/movie/*/credits**', async route => {
        const url = route.request().url();
        const movieId = url.match(/movie\/(\d+)\//)[1];
        await route.fulfill({
            status: 200,
            body: JSON.stringify(mockCredits[movieId])
        });
    });

    await startQuiz(page);
    
    const directorsButton = page.getByRole('button', { name: /Directors/});
    await directorsButton.click();

    for (let i = 0; i < QUIZ_LENGTH; i++) {
        await answerQuestionAndContinue(page);
    }
    await expect(page.getByRole('heading', { name: 'Quiz Complete!' })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: 'Score:' })).toBeVisible();

    const playAgainButton = page.getByRole('button', { name: /Play Again/});
    await expect(playAgainButton).toBeVisible();
});

// test('completes full directors quiz and displays final score', async ({ page }) => {
//     await page.goto('/');
//     await page.route('**/movie/*/credits**', async route => {
//         const url = route.request().url();
//         const movieId = url.match(/movie\/(\d+)\//)[1];
//         await route.fulfill({
//             status: 200,
//             body: JSON.stringify({
//                 crew: [{ job: "Director", name: `Director #${movieId}` }],
//                 cast: [{ name: `Actor #${movieId}` }]
//             })
//         });
//     });

//     await startQuiz(page);
    
//     const directorsButton = page.getByRole('button', { name: /Directors/});
//     await directorsButton.click();

//     for (let i = 0; i < mockMovies.length; i++) {
//         await answerQuestionAndContinue(page);
//     }
//     await expect(page.getByRole('heading', { name: 'Quiz Complete!' })).toBeVisible();
//     await expect(page.getByRole('paragraph').filter({ hasText: 'Score:' })).toBeVisible();

//     const playAgainButton = page.getByRole('button', { name: /Play Again/});
//     await expect(playAgainButton).toBeVisible();
// });

test('completes full actors quiz and displays final score', async ({ page }) => {
    await page.goto('/');
    await page.route('**/movie/*/credits**', async route => {
        const url = route.request().url();
        const movieId = url.match(/movie\/(\d+)\//)[1];
        await route.fulfill({
            status: 200,
            body: JSON.stringify({
                crew: [{ job: "Director", name: `Director #${movieId}` }],
                cast: [{ name: `Actor #${movieId}` }]
            })
        });
    });

    await startQuiz(page);
    
    const actorsButton = page.getByRole('button', { name: /Actors/});
    await actorsButton.click();

    for (let i = 0; i < QUIZ_LENGTH; i++) {
        await answerQuestionAndContinue(page);
    }
    await expect(page.getByRole('heading', { name: 'Quiz Complete!' })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: 'Score:' })).toBeVisible();
});

test('clicking play again brings player to categories screen', async ({ page }) => {
    await page.goto('/');
    await startQuiz(page);
    
    const yearsButton = page.getByRole('button', { name: /Release Years/});
    await yearsButton.click();

    // Answer all questions
    for (let i = 0; i < QUIZ_LENGTH; i++) {
        await answerQuestionAndContinue(page);
    }
    await expect(page.getByRole('heading', { name: 'Quiz Complete!' })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: 'Score:' })).toBeVisible();

    const playAgainButton = page.getByRole('button', { name: /Play Again/});
    await playAgainButton.click();

    await expect(page.getByRole('heading').filter({ hasText: 'Choose a Category' })).toBeVisible();

    const categoryButtons = page.getByRole('button');
    await expect(categoryButtons).toHaveCount(3);
});