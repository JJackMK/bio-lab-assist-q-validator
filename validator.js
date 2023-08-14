class QuestionData {
    constructor(questionText, answerOptions, correctAnswerIndex, imageURL) {
        this.questionText = questionText;
        this.answerOptions = answerOptions;
        this.correctAnswerIndex = correctAnswerIndex;
        this.imageURL = imageURL;
    }

    get questionType() {
        return this.imageURL ? "IMAGE" : "TEXT";
    }
}


function validateCSV() {
    let urlInput = document.getElementById('urlInput');
    let sheetId = extractSheetIdFromUrl(urlInput.value); // A function to extract the sheet ID

    let exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

    fetch(exportUrl)
        .then(response => response.text())
        .then(data => {
            let lines = data.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines
            
            // [OPTIONAL] Log the raw CSV for inspection
            console.log(data);

            let questions = [];
            let textQuestionCount = 0;
            let imageQuestionCount = 0;
            let skippedRows = [];


            for (let i = 1; i < lines.length; i++) {
                let cells = lines[i].split(',');
                console.log(cells);  // Add this line to log cells

                if (cells[0] === "\"\"" || cells[1] === "\"\"" || cells[2] === "\"\"" || cells[3] === "\"\"" || cells[4] === "\"\"") {
                    skippedRows.push(i + 1);
                    continue; // Skip invalid rows
                }
                

                let answerOptions = [cells[1], cells[2], cells[3], cells[4]].map(opt => opt.replace(/^"(.*)"$/, '$1'));  // Remove the double quotes encapsulation
                let correctAnswerIndex = cells[1].replace(/^"(.*)"$/, '$1');  // Remove the double quotes encapsulation

                let questionType = (cells[5] && cells[5] !== "\"\"") ? "IMAGE" : "TEXT";
                let imageURL = (questionType === "IMAGE") ? cells[5] : null;
                let question = new QuestionData(cells[0].replace(/^"(.*)"$/, '$1'), answerOptions, correctAnswerIndex, questionType === "IMAGE" ? cells[5].replace(/^"(.*)"$/, '$1') : null);
                
                if (question.questionType === "TEXT") {
                    textQuestionCount++;
                } else if (question.questionType === "IMAGE") {
                    imageQuestionCount++;
                }

                questions.push(question);
            }

            displayParsedData(questions, textQuestionCount, imageQuestionCount, skippedRows);
        })
        .catch(error => {
            console.error('Error fetching or parsing the CSV:', error);
        });
}

function extractSheetIdFromUrl(url) {
    let match = url.match(/\/d\/(.*?)\//);
    return match ? match[1] : null;
}

function displayParsedData(questions, textQuestionCount, imageQuestionCount, skippedRows) {
    let outputDiv = document.getElementById('output');

    let outputString = `<strong>Total Questions:</strong> ${questions.length}<br>`;
    outputString += `<strong>Text Questions:</strong> ${textQuestionCount}<br>`;
    outputString += `<strong>Image Questions:</strong> ${imageQuestionCount}<br>`;
    
    if (skippedRows.length > 0) {
        outputString += `<strong>Skipped Questions (Row Numbers):</strong> ${skippedRows.join(", ")}<br>`;
    }

    outputString += "<br><strong>Questions List:</strong><br>";
    for (let q of questions) {
        outputString += `<strong>Question:</strong> ${q.questionText}, <strong>Type:</strong> ${q.questionType}<br>`;
        outputString += `<strong>Answers:</strong> ${q.answerOptions.join(", ")}<br>`;
        outputString += `<strong>Correct Answer:</strong> ${q.correctAnswerIndex}<br>`;
        outputString += `<strong>Image URL:</strong> ${q.imageURL || "No Image URL"}<br><br>`;
    }

    outputDiv.innerHTML = outputString;
}
