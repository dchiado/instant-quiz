import { useEffect, useState } from 'react';
import logo from './brain.gif';
import {
  Alert,
  Button,
  TextField,
} from '@mui/material';
import { Stack } from '@mui/system';
import LoadingSpinner from './components/loadingSpinner/LoadingSpinner';
import Categories from './components/categories/Categories';
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
  const [questionsPerCategory, setQuestionsPerCategory] = useState(10);
  const [quiz, setQuiz] = useState({});

  // calls the /categories endpoint on page render
  useEffect(() => {
		if (!categories) {
      setLoading(true);
			fetch(`${apiEndpoint}/categories`, getParams)
			.then((res) =>
				res.json().then((data) => {
					setCategories(data);
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
    if (checkedCategories.length > 0) {
      setLoading(true);
      fetch(`${apiEndpoint}/questions?categories=${checkedCategories}&questionsPer=${questionsPerCategory}`, getParams)
      .then((res) =>
        res.json().then((data) => {
          console.log(data);
          setQuiz(data);
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

  return (
    <div className="App">
      <img src={logo} className="App-logo" alt="logo" />

      {error &&
				<Stack spacing={2} sx={{ position: 'fixed', top: 100 }}>
					<Alert onClose={() => setError()} severity="error">{error}</Alert>
				</Stack>
			}

      {categories?.length > 0 &&
        <div className='container'>
          <Categories
            categories={categories}
            checkedCategories={checkedCategories}
            setCheckedCategories={setCheckedCategories}
          >
          </Categories>

          <TextField
						id="question-count"
						label="Questions per category"
						value={questionsPerCategory}
            variant="filled"
						onChange={handleQuestionCountChange}
						onKeyPress={(event) => {
							if (!/[0-9]/.test(event.key)) {
								event.preventDefault();
							}
						}}			
						sx={{
							input: { color: 'white' },
							label: { color: 'lightgray' },
						}}
					/>
          <Button
            key='get-questions'
            variant="contained"
            onClick={handleButtonClick}
            sx={{ backgroundColor: '#5A7D7C', color: 'white', display: 'block', fontSize: 14, padding: 1, mt: 3, mb: 3 }}
          >
            Make me a quiz
          </Button>
        </div>
      }

      {loading && <LoadingSpinner />}

      <div className='download-link'>
        {quiz?.url && 
          <a href={quiz.url}>Download</a>
        }
      </div>
    </div>
  );
}

export default App;
