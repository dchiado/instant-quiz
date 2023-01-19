import { useEffect, useState } from 'react';
import logo from './brain.gif';
import { Alert } from '@mui/material';
import { Stack } from '@mui/system';
import LoadingSpinner from './components/loadingSpinner/LoadingSpinner';
import Categories from './components/categories/Categories';
import Quiz from './components/quiz/Quiz';
import NumericInput from './components/numericInput/NumericInput';
import Button from './components/button/Button';
import './App.css';

const apiEndpoint = process.env.REACT_APP_API_URL;

// need these in each GET to API Gatewway to prevent CORS errors
const getParams = {
  crossDomain: true,
  method: 'GET',
  headers: { 'Content-Type':'application/json' },
}

export const App = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const [categories, setCategories] = useState();
  const [checkedCategories, setCheckedCategories] = useState([]);
  const [displayCategories, setDisplayCategories] = useState(false);
  const [questionsPerCategory, setQuestionsPerCategory] = useState(10);

  const [quiz, setQuiz] = useState({});
  const [displayQuiz, setDisplayQuiz] = useState(false);

  // calls the /categories endpoint on page render
  useEffect(() => {
		if (!categories) {
      setLoading(true);
			fetch(`${apiEndpoint}/categories`, getParams)
			.then((res) =>
				res.json().then((data) => {
					setCategories(data);
          setDisplayCategories(true);
				})
			)
			.catch((error) => {
				console.error(error);
        setError('There was a problem loading categories: ' + error);
			})
      .finally(() => {
        setLoading(false);
      });
		}
	}, [categories]);

  // calls the /questions endpoint on button click
  const handleButtonClick = (event) => {
    event.preventDefault();
    setQuiz({});

    const postParams = {
      method: 'POST',
      body: JSON.stringify({
        categories: checkedCategories,
        questionsPer: questionsPerCategory,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
      crossDomain: true    
    }

    if (checkedCategories.length > 0) {
      setLoading(true);
      fetch(`${apiEndpoint}/quiz`, postParams)
      .then((res) =>
        res.json().then((data) => {
          setQuiz(data);
          setDisplayCategories(false);
          setDisplayQuiz(true);
        })
      )
      .catch((error) => {
        console.error(error);
        setError('There was a problem retrieving your quiz: ' + error);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      alert('You must select at least one category');
    }
  }

  // updates state with the number the user enters
  const handleQuestionCountChange = (event) => {
    const num = event.target.value;
    setQuestionsPerCategory(num);
  }

  const handleRemoveQuestion = (event) => {
    const id = event.currentTarget.getAttribute("dataquestionid");
    const cat = event.currentTarget.getAttribute("datacategory");

    const patchParams = {
      method: 'PATCH',
      body: JSON.stringify({
        s3Path: quiz.s3Path,
        category: cat,
        questionId: id
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
      crossDomain: true    
    }

    setLoading(true);
    fetch(`${apiEndpoint}/quiz`, patchParams)
    .then((res) =>
      res.json().then((data) => {
        setQuiz({
          ...quiz,
          quiz: data
        });
      })
    )
    .catch((error) => {
      console.error(error);
      setError('There was a problem updating your quiz: ' + error);
    })
    .finally(() => {
      setLoading(false);
    });
  }

  // updates state with the number the user enters
  const handleNewQuiz = () => {
    setDisplayQuiz(false);
    setCheckedCategories([]);
    setDisplayCategories(true);
  }

  const handleDownloadQuiz = () => {
    setLoading(true);
    fetch(`${apiEndpoint}/quiz?key=${quiz.s3Path}`, getParams)
    .then((res) =>
      res.json().then((data) => {
        const link = document.createElement('a');
        link.href = data.url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
    )
    .catch((error) => {
      console.error(error);
      setError('There was a problem downloading your quiz: ' + error);
    })
    .finally(() => {
      setLoading(false);
    });
  }
  
  return (
    <div className="App">
      <img src={logo} className="App-logo" alt="logo" />

      {error &&
				<Stack spacing={2} sx={{ position: 'fixed', top: 100 }}>
					<Alert onClose={() => setError()} severity="error">{error}</Alert>
				</Stack>
			}

      {displayCategories &&
        <div className='container'>
          <Categories
            categories={categories}
            checkedCategories={checkedCategories}
            setCheckedCategories={setCheckedCategories}
          >
          </Categories>
          <NumericInput
            id="question-count"
            label="Questions per category"
            value={questionsPerCategory}
            onChange={handleQuestionCountChange}
          />
          <Button
            text="Make me a quiz"
            onClick={handleButtonClick}
          />
        </div>
      }

      <LoadingSpinner visible={loading} />

      {displayQuiz && 
        <div className='buttons-row'>
          <Button
            text="Download Quiz"
            onClick={handleDownloadQuiz}
          />
          <Button
            text="New Quiz"
            onClick={handleNewQuiz}
          />
        </div>
      }

      <Quiz
        quiz={quiz?.quiz}
        visible={displayQuiz}
        onRemoveQuestion={handleRemoveQuestion}  
      />
    </div>
  );
}

export default App;
