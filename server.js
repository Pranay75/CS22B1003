import express from 'express';
import axios from 'axios';

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10; 
const BASE_URL = 'http://20.244.56.144/evaluation-service';  

//in a hurry kept token(it will expire) here but we should use .env for these type of credentials
const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ1MTMyNTE0LCJpYXQiOjE3NDUxMzIyMTQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImUyMzZjYzlmLWYzZDEtNGEwYy1hOTcxLTVmMTI2ZmUxZGRmNiIsInN1YiI6ImNzMjJiMTAwM0BpaWl0ZG0uYWMuaW4ifSwiZW1haWwiOiJjczIyYjEwMDNAaWlpdGRtLmFjLmluIiwibmFtZSI6ImNoYWxpbWV0aSBwcmFuYXkiLCJyb2xsTm8iOiJjczIyYjEwMDMiLCJhY2Nlc3NDb2RlIjoid2NISHJwIiwiY2xpZW50SUQiOiJlMjM2Y2M5Zi1mM2QxLTRhMGMtYTk3MS01ZjEyNmZlMWRkZjYiLCJjbGllbnRTZWNyZXQiOiJubXJQU1VnVktrSnp0VkdBIn0.ocoEMTL78-ckILK9X629mvK3_12QkScGQmgfjcdclOI';

let numberWindow = [];
let totalSum = 0;

const calculateAverage = () => {
  if (numberWindow.length === 0) return 0;
  const sum = numberWindow.reduce((acc, num) => acc + num, 0);
  return sum / numberWindow.length;
};
const fetchNumbers = async (numberId) => {
  let url = '';

  switch (numberId) {
    case 'p':
      url = `${BASE_URL}/primes`;
      break;
    case 'f':
      url = `${BASE_URL}/fibo`;
      break;
    case 'e':
      url = `${BASE_URL}/even`;
      break;
    case 'r':
      url = `${BASE_URL}/rand`;
      break;
    default:
      throw new Error('Invalid numberId');
  }

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
      timeout: 500,
    });

    return response.data.numbers;
  } catch (error) {
    console.error('Error fetching numbers:', error.message);
    return [];
  }
};


const updateNumberWindow = (newNumbers) => {
  newNumbers.forEach((num) => {
    if (!numberWindow.includes(num)) {
     
      if (numberWindow.length >= WINDOW_SIZE) {
       
        const removed = numberWindow.shift();
        totalSum -= removed;
      }
      numberWindow.push(num);
      totalSum += num;
    }
  });
};

app.get('/numbers/:numberId', async (req, res) => {
  const { numberId } = req.params;
  const newNumbers = await fetchNumbers(numberId);
  const windowPrevState = [...numberWindow];
  updateNumberWindow(newNumbers);

  const avg = calculateAverage();
  const windowPrevStateFormatted = windowPrevState.join(' ');
  const windowCurrStateFormatted = numberWindow.join(' ');
  const numbersFormatted = newNumbers.join(' ');


  res.json({
    windowPrevState,
    windowCurrState: numberWindow,
    numbers: newNumbers,
    avg: avg.toFixed(2), // two decimal
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
