INSERT INTO question(content, is_multiple_choice)
VALUES('What country has the most coastline?', TRUE);

INSERT INTO category(name)
VALUES('geography');

INSERT INTO question_category(question_id, category_id)
VALUES(1, 1);

INSERT INTO answer(question_id, content, correct)
VALUES(1, 'Russia', FALSE);

INSERT INTO answer(question_id, content, correct)
VALUES(1, 'Norway', FALSE);

INSERT INTO answer(question_id, content, correct)
VALUES(1, 'Canada', TRUE);

INSERT INTO answer(question_id, content, correct)
VALUES(1, 'Indonesia', FALSE);




INSERT INTO question(content, is_multiple_choice)
VALUES('In what language was Don Quixote written?', FALSE);

INSERT INTO answer(question_id, content, correct)
VALUES(2, 'Spanish', TRUE);

INSERT INTO category(name)
VALUES('literature');

INSERT INTO question_category(question_id, category_id)
VALUES(2, 2);




INSERT INTO question(content, is_multiple_choice)
VALUES('The longest border France shares with another country is with which other country?', FALSE);

INSERT INTO answer(question_id, content, correct)
VALUES(3, 'Brazil', TRUE);

INSERT INTO question_category(question_id, category_id)
VALUES(3, 1);


INSERT INTO question(content, is_multiple_choice)
VALUES('Which island country announced its neutrality the day after the 1939 German invasion of Poland?', FALSE);

INSERT INTO answer(question_id, content, correct)
VALUES(4, 'Ireland', TRUE);

INSERT INTO question_category(question_id, category_id)
VALUES(4, 1);



INSERT INTO question(content, is_multiple_choice)
VALUES('The farthest eastern border of the Roman Empire at its peak stretched into what modern day country?', TRUE);

INSERT INTO answer(question_id, content, correct)
VALUES(5, 'Iran', TRUE);

INSERT INTO answer(question_id, content, correct)
VALUES(5, 'Romania', FALSE);

INSERT INTO answer(question_id, content, correct)
VALUES(5, 'India', FALSE);

INSERT INTO answer(question_id, content, correct)
VALUES(5, 'Suria', FALSE);

INSERT INTO question_category(question_id, category_id)
VALUES(5, 1);



INSERT INTO question(content, is_multiple_choice)
VALUES('How many lines does a Haiku poem have?', FALSE);

INSERT INTO answer(question_id, content, correct)
VALUES(6, 'Three', TRUE);

INSERT INTO question_category(question_id, category_id)
VALUES(6, 2);


INSERT INTO question(content, is_multiple_choice)
VALUES('In Chaucer’s “The Canterbury Tales”, the pilgrims are travelling to visit the shrine of which saint?', TRUE);

INSERT INTO answer(question_id, content, correct)
VALUES(7, 'Saint Christopher', FALSE);

INSERT INTO answer(question_id, content, correct)
VALUES(7, 'Saint Jude', FALSE);

INSERT INTO answer(question_id, content, correct)
VALUES(7, 'Saint Thomas Becket', TRUE);

INSERT INTO answer(question_id, content, correct)
VALUES(7, 'Saint Francis of Assisi', FALSE);

INSERT INTO question_category(question_id, category_id)
VALUES(7, 2);


INSERT INTO question(content, is_multiple_choice)
VALUES('What was the name of Sherlock Holmes’ arch enemy?', FALSE);

INSERT INTO answer(question_id, content, correct)
VALUES(8, 'Professor Moriarty', TRUE);

INSERT INTO question_category(question_id, category_id)
VALUES(8, 2);



INSERT INTO question(content, is_multiple_choice)
VALUES('Rikki-Tikki-Tavi is a short story about a Mongoose in what country?', FALSE);

INSERT INTO answer(question_id, content, correct)
VALUES(9, 'India', TRUE);

INSERT INTO question_category(question_id, category_id)
VALUES(9, 1);

INSERT INTO question_category(question_id, category_id)
VALUES(9, 2);

