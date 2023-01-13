import logo from './brain.gif';
import { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField
} from '@mui/material';
import LoadingSpinner from "./components/loadingSpinner/LoadingSpinner";
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
  const [categories, setCategories] = useState([]);
  const [checkedCategories, setCheckedCategories] = useState([]);
  const [questionsPerCategory, setQuestionsPerCategory] = useState(10);
  const [quiz, setQuiz] = useState({});

  // calls the /categories endpoint on page render
  useEffect(() => {
		if (categories.length === 0) {
      setLoading(true);
			fetch(`${apiEndpoint}/categories`, getParams)
			.then((res) =>
				res.json().then((data) => {
					setCategories(data);
          setLoading(false);
				})
			)
			.catch((error) => {
				console.error(error);
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
          setLoading(false);
        })
      )
      .catch((error) => {
        console.error(error);
      });
    } else {
      alert('You must select at least one category');
    }
  }

  // updates the checkedCategories in state when checkboxes are (de)selected
  const handleCheckboxChange = (event) => {
    const cat = event.target.id;
    const checked = event.target.checked;
    // clone existing selected categories array
    let newCats = checkedCategories;
    if (checked) {
      // add the target category to array
      newCats = [...newCats, cat];
    } else {
      // remove the target category from array
      const idx = newCats.indexOf(cat);
      newCats.splice(idx, 1);
    }
    // update state with new (cloned) array
    setCheckedCategories(newCats);
  }

  // updates state with the number the user enters
  const handleQuestionCountChange = (event) => {
    const num = event.target.value;
    setQuestionsPerCategory(num);
  }

  return (
    <div className="App">
      <img src={logo} className="App-logo" alt="logo" />
      {categories.length > 0 &&
        <div className="form">
          <FormGroup>
            Select your categories:
            {categories.map((c) => 
              <FormControlLabel
                key={c.id}
                control={<Checkbox id={c.name} onChange={handleCheckboxChange} />}
                label={c.name.charAt(0).toUpperCase() + c.name.slice(1)} // just capitalizes the first letter
              />  
            )}
          </FormGroup>
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
              width: '100%'
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

      <div>
        {quiz?.url && 
          <a href={quiz.url}>Download</a>
        }
      </div>
    </div>
  );
}

export default App;
