import { useState, useEffect } from 'react';
import axios from 'axios';

const MOVIES_TO_FETCH = 50;
const QUESTIONS_PER_QUIZ = 5;
const WRONG_ANSWERS_COUNT = 3;
const MIN_LOAD_TIME = 800; // milliseconds

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function createYearQuestion(movie) {
    const correctYear = movie.release_date.split('-')[0];
  
    const wrongYears = [
        String(parseInt(correctYear) - 2),
        String(parseInt(correctYear) - 1),
        String(parseInt(correctYear) + 1)
    ];
    
    const answers = [correctYear, ...wrongYears];
    
    for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    
    return {
        question: `What year was "${movie.title}" released?`,
        answers,
        correctAnswer: answers.indexOf(correctYear)
    };
}

function createDirectorQuestion(movie, allMovies, usedCorrectAnswers) {
    const director = movie.director;
    const wrongDirectors = allMovies
        .filter(m => m.director && m.director !== director && !usedCorrectAnswers.has(m.director))
        .map(m => m.director)
        .filter((d, i, arr) => arr.indexOf(d) === i)
        .sort(() => Math.random() - 0.5)
        .slice(0, WRONG_ANSWERS_COUNT);
    
    if (wrongDirectors.length < WRONG_ANSWERS_COUNT) return null;
    
    const answers = [director, ...wrongDirectors];
    for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    
    return {
        question: `Who directed "${movie.title}" (${movie.release_date.split('-')[0]})?`,
        answers,
        correctAnswer: answers.indexOf(director)
    };
}

function createActorQuestion(movie, allMovies, usedCorrectAnswers) {
    const actor = movie.actor;
    const wrongActors = allMovies
        .filter(m => m.actor && m.actor !== actor && !usedCorrectAnswers.has(m.actor))
        .map(m => m.actor)
        .filter((a, i, arr) => arr.indexOf(a) === i)
        .sort(() => Math.random() - 0.5)
        .slice(0, WRONG_ANSWERS_COUNT);
    
    if (wrongActors.length < WRONG_ANSWERS_COUNT) return null;

    const answers = [actor, ...wrongActors];
    for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    
    return {
        question: `Who starred in "${movie.title}" (${movie.release_date.split('-')[0]})?`,
        answers,
        correctAnswer: answers.indexOf(actor)
    };
}

export function useMovieQuestions(category) {
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!category) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        const loadingPromise = axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.REACT_APP_TMDB_API_KEY}&page=1`)
            .then(response => {
                const maxPage = Math.min(response.data.total_pages, 500);
                const randomPage = Math.floor(Math.random() * maxPage) + 1;
                return axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.REACT_APP_TMDB_API_KEY}&page=${randomPage}`);
            })
            .then(response => {
                const currentYear = new Date().getFullYear();
                const releasedMovies = response.data.results.filter(movie => {
                    const year = parseInt(movie.release_date.split('-')[0]);
                    return year < currentYear;
                });

                if (category === 'years') {
                    const quizQuestions = releasedMovies
                        .map(movie => createYearQuestion(movie))
                        .slice(0, QUESTIONS_PER_QUIZ);
                    setQuestions(quizQuestions);
                } 
                else {
                    const moviePromises = releasedMovies.slice(0, MOVIES_TO_FETCH).map(movie =>
                        axios.get(`https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${process.env.REACT_APP_TMDB_API_KEY}`)
                            .then(creditsResponse => ({
                                ...movie,
                                director: creditsResponse.data.crew.find(person => person.job === 'Director')?.name,
                                actor: creditsResponse.data.cast[0]?.name
                            }))
                    );

                    return Promise.all(moviePromises).then(moviesWithCredits => {
                        const validMovies = moviesWithCredits.filter(m => 
                            category === 'directors' ? m.director : m.actor
                        );

                        let quizQuestions;
                        if (category === 'directors') {
                            const usedCorrectAnswers = new Set();
                            quizQuestions = validMovies
                                .map(movie => {
                                    const question = createDirectorQuestion(movie, validMovies, usedCorrectAnswers);
                                    if (question) {
                                        usedCorrectAnswers.add(movie.director);
                                    }
                                    return question;
                                })
                                .filter(q => q !== null)
                                .slice(0, QUESTIONS_PER_QUIZ);
                        } else if (category === 'actors') {
                            const usedCorrectAnswers = new Set();
                            quizQuestions = validMovies
                                .map(movie => {
                                    const question = createActorQuestion(movie, validMovies, usedCorrectAnswers);
                                    if (question) {
                                        usedCorrectAnswers.add(movie.actor);
                                    }
                                    return question;
                                })
                                .filter(q => q !== null)
                                .slice(0, QUESTIONS_PER_QUIZ);
                        }

                        setQuestions(quizQuestions);
                    });
                }
            });

        // 'Release Years' loads almost instantly, 'Directors' and 'Actors' 
        // often take 1 or 2 seconds which is enough to be noticeable. So a 
        // let's add in some brief padding to the overall loading time!
        Promise.all([loadingPromise, delay(MIN_LOAD_TIME)])
            .then(() => {
                setIsLoading(false);
            })
            .catch(err => {
                console.error('API ERROR DETAILS: ', err);
                if (!err.response) {
                    setError('network');
                }
                else if (err.response.status >= 500) {
                    setError('server');
                } 
                else {
                    setError('unknown');
                }
                setIsLoading(false);
            });
    }, [category]);

    return { questions, isLoading, error };
}
