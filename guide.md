# CloudMaster Quiz - AWS Cloud Knowledge Assessment Platform
## A Comprehensive Guide to Building Your Portfolio Project

### Project Overview
CloudMaster Quiz is an interactive web application that tests users' AWS cloud knowledge through dynamic quizzes. The platform features real-time scoring, progress tracking, and a leaderboard system, making it both educational and engaging.

### Architecture
- Frontend: Static website hosted on S3
- Backend: Serverless architecture using Lambda functions
- Database: DynamoDB for quiz data and user scores
- Authentication: Amazon Cognito
- API: API Gateway for REST endpoints
- Security: IAM roles and policies

### Step-by-Step Implementation Guide

#### 1. Initial AWS Setup
1. Sign in to your AWS Console
2. Navigate to IAM
3. Create a new IAM user with programmatic access
4. Attach the following policies:
   - AmazonS3FullAccess
   - AmazonDynamoDBFullAccess
   - AmazonAPIGatewayAdministrator
   - AWSLambdaFullAccess
   - AmazonCognitoPowerUser

#### 2. S3 Setup for Static Website
1. Go to S3 Console
2. Create a new bucket named `cloudmaster-quiz-[your-name]`
3. Enable static website hosting
4. Configure bucket policy:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::cloudmaster-quiz-[your-name]/*"
        }
    ]
}
```

#### 3. DynamoDB Setup
1. Go to DynamoDB Console
2. Create two tables:
   - `QuizQuestions` (Partition key: questionId)
   - `UserScores` (Partition key: userId, Sort key: quizId)
3. Enable auto-scaling with minimum capacity of 5 units

#### 4. Cognito Setup
1. Go to Cognito Console
2. Create a new User Pool
3. Configure sign-in options (email)
4. Create an app client
5. Note down the User Pool ID and App Client ID

#### 5. Lambda Functions
Create the following Lambda functions:

1. `getQuizQuestions`
```javascript
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const params = {
        TableName: 'QuizQuestions',
        Limit: 10
    };
    
    try {
        const data = await dynamoDB.scan(params).promise();
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(data.Items)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(error)
        };
    }
};
```

2. `submitQuizScore`
```javascript
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const { userId, quizId, score } = JSON.parse(event.body);
    
    const params = {
        TableName: 'UserScores',
        Item: {
            userId,
            quizId,
            score,
            timestamp: new Date().toISOString()
        }
    };
    
    try {
        await dynamoDB.put(params).promise();
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({ message: 'Score saved successfully' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(error)
        };
    }
};
```

#### 6. API Gateway Setup
1. Create a new REST API
2. Create two resources:
   - /quiz (GET)
   - /score (POST)
3. Create methods for each resource
4. Enable CORS
5. Deploy the API

#### 7. Frontend Development
Create the following files in your S3 bucket:

1. `index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CloudMaster Quiz</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="app">
        <header>
            <h1>CloudMaster Quiz</h1>
            <div id="user-info"></div>
        </header>
        
        <main>
            <div id="quiz-container">
                <div id="question"></div>
                <div id="options"></div>
                <button id="submit">Submit Answer</button>
            </div>
            
            <div id="score-container">
                <h2>Your Score</h2>
                <div id="score"></div>
            </div>
        </main>
    </div>
    <script src="app.js"></script>
</body>
</html>
```

2. `styles.css`
```css
:root {
    --primary-color: #232f3e;
    --secondary-color: #ff9900;
    --background-color: #f5f5f5;
}

body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    background-color: var(--background-color);
}

#app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

header {
    background-color: var(--primary-color);
    color: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

#quiz-container {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

#options {
    display: grid;
    gap: 10px;
    margin: 20px 0;
}

.option {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
}

.option:hover {
    background-color: #f0f0f0;
}

button {
    background-color: var(--secondary-color);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    opacity: 0.9;
}
```

3. `app.js`
```javascript
const API_ENDPOINT = 'YOUR_API_GATEWAY_ENDPOINT';
const USER_POOL_ID = 'YOUR_USER_POOL_ID';
const CLIENT_ID = 'YOUR_CLIENT_ID';

let currentQuestion = 0;
let score = 0;
let questions = [];

async function init() {
    try {
        const response = await fetch(`${API_ENDPOINT}/quiz`);
        questions = await response.json();
        displayQuestion();
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
}

function displayQuestion() {
    const question = questions[currentQuestion];
    document.getElementById('question').textContent = question.text;
    
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option';
        button.textContent = option;
        button.onclick = () => selectAnswer(option);
        optionsContainer.appendChild(button);
    });
}

function selectAnswer(answer) {
    const question = questions[currentQuestion];
    if (answer === question.correct) {
        score++;
    }
    
    currentQuestion++;
    if (currentQuestion < questions.length) {
        displayQuestion();
    } else {
        showFinalScore();
    }
}

function showFinalScore() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('score').textContent = `You scored ${score} out of ${questions.length}`;
    document.getElementById('score-container').style.display = 'block';
    
    // Submit score to backend
    submitScore(score);
}

async function submitScore(score) {
    try {
        await fetch(`${API_ENDPOINT}/score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'current-user-id',
                quizId: 'current-quiz-id',
                score: score
            })
        });
    } catch (error) {
        console.error('Error submitting score:', error);
    }
}

// Initialize the app
init();
```

#### 8. Testing and Deployment
1. Test each Lambda function individually
2. Test the API endpoints
3. Upload the frontend files to S3
4. Test the complete application flow

#### 9. Monitoring and Maintenance
1. Set up CloudWatch alarms for Lambda errors
2. Monitor DynamoDB capacity
3. Check API Gateway metrics
4. Review Cognito user pool metrics

### Free Tier Considerations
- S3: 5GB storage
- DynamoDB: 25GB storage, 25 WCU/RCU
- Lambda: 1M requests/month
- API Gateway: 1M requests/month
- Cognito: 50,000 MAU

### Project Showcase
When showcasing this project:
1. Highlight the serverless architecture
2. Emphasize the use of AWS best practices
3. Showcase the clean, modern UI
4. Demonstrate the scalability of the solution
5. Explain the security measures implemented

### Next Steps
1. Add more quiz categories
2. Implement user profiles
3. Add social sharing features
4. Create an admin dashboard
5. Implement analytics

Remember to replace all placeholder values (like API endpoints, User Pool IDs, etc.) with your actual values from the AWS Console. 
