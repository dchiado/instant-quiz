import { Card, CardContent, IconButton, Typography } from "@mui/material";
import { Box } from "@mui/system";
import CloseIcon from '@mui/icons-material/Close';
import './Quiz.css';

const letters = ['A', 'B', 'C', 'D', 'E'];

export const Quiz = ({ quiz, onRemoveQuestion, visible }) => {
  const sortedQuiz = quiz?.sort((a, b) => (a.category > b.category) ? 1 : -1);
  return (
    <div className='display-quiz'>
      {visible && quiz &&
        <div>
          {sortedQuiz.map((q) => {
            return (
              <div key={q.category}>
                <Typography
                  variant="h4"
                  sx={{
                    mb: 2,
                    mt: 2,
                    textAlign: 'left',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                  }}
                >
                  {q.category}
                </Typography>

                {q.questions.map((question, qIdx) => {
                  return (
                    <Card key={qIdx} sx={{ display: 'flex', backgroundColor: '#5E6471', mb: 2, borderRadius: 3 }}>
                      <Box sx={{ width: '100%', padding: '10px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                          <Typography variant="subtitle1" color="white" component="div">
                            {`${qIdx + 1}. ${question.question}`}
                          </Typography>
                          {question.answers?.map((a, aIdx) => {
                            const prefix = question.multipleChoice ? `${letters[aIdx]}. ` : '';
                            const answerText = prefix + a.content;
                            return (
                              <Typography
                                key={aIdx}
                                variant="subtitle2"
                                color="white"
                                component="div"
                                sx={{
                                  ml: 4,
                                  fontWeight: question.multipleChoice && a.correct ? 700 : 'inherit'
                                }}
                              >
                                {answerText}
                              </Typography>
                          )
                        })}

                        </CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton dataquestionid={question.id} datacategory={q.category} onClick={onRemoveQuestion} >
                            <CloseIcon sx={{ color: 'white' }} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Card>
                  )
                })}
              </div>
            )
          })}
        </div>
      }
    </div>
  )
}

export default Quiz;