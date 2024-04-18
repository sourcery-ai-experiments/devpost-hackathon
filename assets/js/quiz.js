import { createScoreBoard } from '../../pages/auth/fb.js';
import { checkLoginStatus } from './main.js';
import { questions, topics } from './utils/questions.js';
// checkLoginStatus({ path: '../auth/' });

const quizOptBtns = document.querySelectorAll('.quiz-opt-btn');
const quizTimer = document.querySelector('.quiz-timer > #timer');
const quizQuestion = document.querySelector('.quiz-question #question');
const quizTitle = document.querySelector('#quiz-title');
const gamePin = new URLSearchParams(window.location.search).get('gamePin');
const topicID = new URLSearchParams(window.location.search).get('topic');

//topic questions and correct answer
let T, Q, A, CA;
let question = 0;

const setQuizDetails = () => {
	if (!topicID) {
		alert('Please select a topic to continue');
		window.location.href = '../../index.html';
	} else if (topicID >= topics.length) {
		alert('Invalid topic selected');
		window.location.href = '../../index.html';
	}

	const topic = topics.find((topic) => topic.id === parseInt(topicID));
	quizTitle.innerHTML = 'Title: ' + topic.name;

	T = topicID;
	Q = `Q${T}`;
	A = `A${T}`;
	CA = `CA${T}`;
};

const setQuestions = (question) => {
	questions[A][question] = questions[A][question].sort(
		() => Math.random() - 0.5,
	);

	quizQuestion.innerHTML = questions[Q][question];

	quizOptBtns.forEach((btn, index) => {
		btn.innerHTML = questions[A][question][index];
	});

	setQuizBtns();
};

const colors = [
	'var(--prim-color)',
	'var(--sec-color)',
	'var(--tert-color)',
	'var(--quart-color)',
];

function setQuizBtns() {
	const chosen = [];
	quizOptBtns.forEach((btn, index) => {
		while (true) {
			const ran = Math.floor(Math.random() * colors.length);
			if (!chosen.includes(ran)) {
				btn.style.backgroundColor = colors[ran];
				btn.style.boxShadow = `4px 4px 4px 0  ${colors[ran - 1]}`;
				chosen.push(ran);
				break;
			}
		}
	});

	quizOptBtns.forEach((btn, index) => {
		let prevStyle = btn.style.backgroundColor;
		btn.addEventListener('mouseover', () => {
			btn.style.backgroundColor = 'rgb(73, 165, 165)';
		});
		btn.addEventListener('mouseout', () => {
			btn.style.backgroundColor = prevStyle;
		});
	});
}

setQuizDetails();
setQuizBtns();
setQuestions(0);

const setQuizTImer = ({ duration = 30, speed = 200 }) => {
	quizTimer.style.color = 'white';
	let time = duration;

	let intervalId = setInterval(() => {
		if (time <= 0) {
			if (question >= questions[Q].length - 1) {
				moveToPostQuiz(intervalId);
			}

			question++;
			setQuestions(question);
			time = duration;
		}

		time--;
		let min = Math.floor(time / 60);
		let sec = time % 60;
		quizTimer.innerHTML = `${min}:${sec}`;

		// change the with of the timer with respect to the time
		quizTimer.style.width = `${(time / duration) * 100}%`;
	}, speed);
};

setQuizTImer({ duration: 30, speed: 200 });

function moveToPostQuiz(intervalId) {
	clearInterval(intervalId); // stop the interval
	window.location.href = `./post-quiz.html?gamePin=${gamePin}&topic=${topicID}`;
}

// check answers and set score
const loginObj = JSON.parse(sessionStorage.getItem('login'));
const username = loginObj.username;
const userScore = 0;
const sessionUser = {
	username: username,
	score: userScore,
};
sessionStorage.setItem('sessionUser', JSON.stringify(sessionUser));

let score = 0;
const scoreData = await createScoreBoard({
	gamePin: gamePin,
	username: username,
	score: sessionUser.score,
	topicID: topicID,
});

quizOptBtns.forEach((btn) => {
	btn.addEventListener('click', async () => {
		console.log('clicked');
		const correctAnswer = questions[CA][question];
		if (btn.innerHTML === correctAnswer) {
			score++;
		}

		// set a object with score and username
		sessionUser.score = score;
		sessionStorage.setItem('sessionUser', JSON.stringify(sessionUser));
		console.log(sessionUser.score);

		sessionUser = JSON.parse(sessionStorage.getItem('sessionUser'));
		console.log(sessionUser);

		await createScoreBoard({
			gamePin: myPin,
			username: username,
			score: sessionUser.score,
		});
	});
});
