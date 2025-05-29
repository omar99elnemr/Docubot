# AWS Cloud Quest: Step-by-Step Deployment Guide (Console Only)

This guide will walk you through deploying the "AWS Cloud Quest" quiz application using only the AWS Management Console and AWS Free Tier services.

**Project Overview:**
* **Frontend:** HTML, CSS, JavaScript (Hosted on AWS Amplify)
* **Backend API:** Amazon API Gateway
* **Compute Logic:** AWS Lambda (Python)
* **Database:** Amazon DynamoDB (for questions and scores)

**Before You Begin:**
1.  **AWS Account:** Ensure you have an AWS account. If not, sign up at [aws.amazon.com](https://aws.amazon.com/).
2.  **Region Selection:** Choose an AWS Region (e.g., `us-east-1` N. Virginia, `eu-west-1` Ireland). Stick to this region for all services to ensure they can communicate easily and to simplify free tier tracking. You can select the region from the top-right corner of the AWS Management Console.
3.  **Text Editor:** You'll need a basic text editor (like Notepad on Windows, TextEdit on Mac, or VS Code if you have it) to save the HTML, CSS, and JavaScript files provided.
4.  **AWS Free Tier:** Familiarize yourself with the AWS Free Tier limits for Lambda, API Gateway, DynamoDB, and Amplify to avoid unexpected charges: [AWS Free Tier](https://aws.amazon.com/free/). This project is designed to fit within these limits for typical portfolio usage.

---

## Phase 1: Setting Up the Database (Amazon DynamoDB)

We'll create two DynamoDB tables: one for quiz questions and one for user scores.

### 1.1. Create `AWSQuizQuestions` Table:
    a.  Navigate to the **DynamoDB** service in the AWS Console.
    b.  Click **"Create table"**.
    c.  **Table name:** `AWSQuizQuestions`
    d.  **Partition key:** `QuestionID` (Type: String)
    e.  Leave "Sort key" unchecked.
    f.  **Table settings:** Choose "Default settings". (This typically uses Provisioned capacity mode with 5 RCU and 5 WCU, which is within the free tier for a good amount of usage. You can also explore On-Demand mode, which is also free tier eligible for a certain amount of requests).
    g.  Click **"Create table"**.

### 1.2. Add Sample Questions to `AWSQuizQuestions`:
    a.  Once the table status is "Active", select `AWSQuizQuestions` from the table list.
    b.  Go to the **"Explore table items"** tab (or click "View items" if available).
    c.  Click **"Create item"**.
    d.  You'll see a field for `QuestionID`. Enter a unique ID (e.g., `Q1`).
    e.  Click the **"+" (Add new attribute)** button next to `QuestionID` and choose **"Append"**, then select the data type.
        * **QuestionText** (String): e.g., "Which AWS service is used for scalable object storage?"
        * **Options** (List - choose 'List' type, then add String elements):
            * Element 0 (String): "Amazon S3"
            * Element 1 (String): "Amazon EC2"
            * Element 2 (String): "Amazon RDS"
            * Element 3 (String): "AWS Lambda"
        * **CorrectAnswerIndex** (Number): e.g., `0` (corresponds to "Amazon S3")
        * **Explanation** (String - Optional): e.g., "Amazon S3 (Simple Storage Service) provides highly scalable and durable object storage."
        * **Category** (String - Optional): e.g., "Storage"
    f.  Click **"Create item"** at the bottom.

    g.  **Add at least 4-5 more questions** following the same process with unique `QuestionID`s (Q2, Q3, etc.). Here are a few examples:

        * **Q2:**
            * QuestionID: `Q2`
            * QuestionText: "What AWS service provides serverless compute?"
            * Options: `["Amazon EC2", "AWS Lambda", "Amazon Lightsail", "AWS Fargate"]`
            * CorrectAnswerIndex: `1`
            * Explanation: "AWS Lambda lets you run code without provisioning or managing servers."
            * Category: "Compute"
        * **Q3:**
            * QuestionID: `Q3`
            * QuestionText: "Which service is a managed relational database service?"
            * Options: `["Amazon DynamoDB", "Amazon Redshift", "Amazon RDS", "Amazon ElastiCache"]`
            * CorrectAnswerIndex: `2`
            * Explanation: "Amazon RDS (Relational Database Service) makes it easy to set up, operate, and scale a relational database."
            * Category: "Database"
        * **Q4:**
            * QuestionID: `Q4`
            * QuestionText: "What does VPC stand for in AWS?"
            * Options: `["Virtual Private Cloud", "Virtual Public Cloud", "Verified Private Connection", "Virtual Processing Core"]`
            * CorrectAnswerIndex: `0`
            * Explanation: "VPC stands for Virtual Private Cloud, allowing you to provision a logically isolated section of the AWS Cloud."
            * Category: "Networking"
        * **Q5:**
            * QuestionID: `Q5`
            * QuestionText: "Which AWS service is used to distribute traffic to multiple EC2 instances?"
            * Options: `["AWS Shield", "Amazon Route 53", "Elastic Load Balancing", "AWS Direct Connect"]`
            * CorrectAnswerIndex: `2`
            * Explanation: "Elastic Load Balancing (ELB) automatically distributes incoming application traffic across multiple targets, such as Amazon EC2 instances."
            * Category: "Networking"

### 1.3. Create `AWSQuizScores` Table:
    a.  In the DynamoDB console, click **"Create table"** again.
    b.  **Table name:** `AWSQuizScores`
    c.  **Partition key:** `ScoreID` (Type: String)
    d.  Leave "Sort key" unchecked.
    e.  **Table settings:** Choose "Default settings".
    f.  Click **"Create table"**.
        *This table will be populated by the Lambda function later.*

---

## Phase 2: Creating Lambda Functions & IAM Roles

We need three Lambda functions and an IAM role that grants them necessary permissions.

### 2.1. Create IAM Role for Lambda Functions:
    a.  Navigate to the **IAM** service.
    b.  In the left navigation pane, click **"Roles"**, then **"Create role"**.
    c.  **Select trusted entity type:** Choose "AWS service".
    d.  **Use case:** Select "Lambda", then click **"Next"**.
    e.  **Add permissions policies:**
        * Search for and select `AWSLambdaBasicExecutionRole`. This allows Lambda to write logs to CloudWatch.
        * Click **"Create policy"** (this will open a new tab/window).
            * In the new tab, select the **JSON** tab.
            * Delete the existing content and paste the following policy. **Replace `YOUR_AWS_ACCOUNT_ID` and `YOUR_REGION` with your actual AWS Account ID and selected region.** You can find your Account ID in the top-right dropdown under your username.

                ```json
                {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Sid": "DynamoDBQuizAccess",
                            "Effect": "Allow",
                            "Action": [
                                "dynamodb:Scan",
                                "dynamodb:GetItem"
                            ],
                            "Resource": [
                                "arn:aws:dynamodb:YOUR_REGION:YOUR_AWS_ACCOUNT_ID:table/AWSQuizQuestions"
                            ]
                        },
                        {
                            "Sid": "DynamoDBScoresAccess",
                            "Effect": "Allow",
                            "Action": [
                                "dynamodb:PutItem"
                            ],
                            "Resource": [
                                "arn:aws:dynamodb:YOUR_REGION:YOUR_AWS_ACCOUNT_ID:table/AWSQuizScores"
                            ]
                        }
                    ]
                }
                ```
            * Click **"Next: Tags"**, then **"Next: Review"**.
            * **Policy name:** `AWSQuizLambdaDynamoDBPolicy`
            * **Description:** (Optional) "Allows Lambda functions for AWS Quiz to access DynamoDB tables."
            * Click **"Create policy"**. Close this tab and return to the "Create role" tab.
        * Back in the "Create role" tab, refresh the policy list (click the refresh icon).
        * Search for and select the `AWSQuizLambdaDynamoDBPolicy` you just created.
    f.  Click **"Next"**.
    g.  **Role name:** `AWSQuizLambdaRole`
    h.  **Description:** (Optional) "IAM Role for AWS Cloud Quest Lambda functions."
    i.  Review the settings and click **"Create role"**.

### 2.2. Create `getAWSQuizQuestions` Lambda Function:
    a.  Navigate to the **Lambda** service.
    b.  Click **"Create function"**.
    c.  Select **"Author from scratch"**.
    d.  **Function name:** `getAWSQuizQuestions`
    e.  **Runtime:** Select "Python 3.9" (or a newer Python version available).
    f.  **Architecture:** Choose "x86_64".
    g.  **Permissions:**
        * Expand "Change default execution role".
        * Select "Use an existing role".
        * Choose `AWSQuizLambdaRole` from the dropdown.
    h.  Click **"Create function"**.
    i.  **Function code:**
        * Scroll down to the **"Code source"** section.
        * Replace the content of `lambda_function.py` with the Python code provided earlier for `getAWSQuizQuestions` (from the `` block).
    j.  **Environment variables:**
        * Go to the **"Configuration"** tab, then **"Environment variables"**. Click **"Edit"**.
        * Click **"Add environment variable"**.
            * **Key:** `QUESTIONS_TABLE_NAME`
            * **Value:** `AWSQuizQuestions`
        * Click **"Add environment variable"** again.
            * **Key:** `NUM_QUESTIONS_PER_QUIZ`
            * **Value:** `5` (you can change this later to control quiz length)
        * Click **"Save"**.
    k.  **Basic settings:**
        * Still in the **"Configuration"** tab, go to **"General configuration"**. Click **"Edit"**.
        * Set **Timeout** to `15` seconds (default is 3s, more is safer for initial DB calls).
        * Click **"Save"**.
    l.  Click the **"Deploy"** button above the code editor to save your changes.
    m.  **Test the function (Optional but Recommended):**
        * Go to the **"Test"** tab.
        * Select **"Create new event"**.
        * **Event name:** `MyTestEvent`
        * Leave the template as `hello-world`. The content doesn't matter for this function as it doesn't read the event body.
        * Click **"Save changes"**, then click **"Test"**.
        * You should see a "Succeeded" status and a JSON output with questions. If you get errors, check CloudWatch Logs (accessible via the "Monitor" tab).

### 2.3. Create `checkAWSQuizAnswer` Lambda Function:
    a.  In the Lambda console, click **"Create function"**.
    b.  **Function name:** `checkAWSQuizAnswer`
    c.  **Runtime:** "Python 3.9"
    d.  **Architecture:** "x86_64"
    e.  **Permissions:** Use existing role `AWSQuizLambdaRole`.
    f.  Click **"Create function"**.
    g.  **Code source:** Replace `lambda_function.py` content with the Python code for `checkAWSQuizAnswer` (from ``).
    h.  **Environment variables:**
        * Go to **"Configuration"** -> **"Environment variables"** -> **"Edit"**.
        * **Key:** `QUESTIONS_TABLE_NAME`, **Value:** `AWSQuizQuestions`
        * Click **"Save"**.
    i.  **Basic settings:** Set Timeout to `15` seconds.
    j.  Click **"Deploy"**.
    k.  **Test (Optional):**
        * Go to the **"Test"** tab. Create a new event.
        * **Event name:** `CheckAnswerTest`
        * **Event JSON (replace with a valid QuestionID from your table):**
            ```json
            {
              "body": "{\"QuestionID\": \"Q1\", \"userAnswerIndex\": 0}"
            }
            ```
        * Click **"Save changes"**, then **"Test"**. Verify the output.

### 2.4. Create `storeAWSQuizScore` Lambda Function:
    a.  In the Lambda console, click **"Create function"**.
    b.  **Function name:** `storeAWSQuizScore`
    c.  **Runtime:** "Python 3.9"
    d.  **Architecture:** "x86_64"
    e.  **Permissions:** Use existing role `AWSQuizLambdaRole`.
    f.  Click **"Create function"**.
    g.  **Code source:** Replace `lambda_function.py` content with the Python code for `storeAWSQuizScore` (from ``).
    h.  **Environment variables:**
        * Go to **"Configuration"** -> **"Environment variables"** -> **"Edit"**.
        * **Key:** `SCORES_TABLE_NAME`, **Value:** `AWSQuizScores`
        * Click **"Save"**.
    i.  **Basic settings:** Set Timeout to `15` seconds.
    j.  Click **"Deploy"**.
    k.  **Test (Optional):**
        * Go to the **"Test"** tab. Create a new event.
        * **Event name:** `StoreScoreTest`
        * **Event JSON:**
            ```json
            {
              "body": "{\"userName\": \"TestUser\", \"score\": 3, \"totalQuestions\": 5}"
            }
            ```
        * Click **"Save changes"**, then **"Test"**. Verify the output and check the `AWSQuizScores` table in DynamoDB.

---

## Phase 3: Building the API (Amazon API Gateway)

We'll create a REST API to expose our Lambda functions.

### 3.1. Create a REST API:
    a.  Navigate to the **API Gateway** service.
    b.  If you see a "Get Started" screen, click it. Otherwise, click **"Create API"**.
    c.  Find the **"REST API"** card (not HTTP API or WebSocket API) and click **"Build"**.
    d.  **Choose the protocol:** REST
    e.  **Create new API:** Select "New API".
    f.  **API name:** `AWSQuizAPI`
    g.  **Description:** (Optional) "API for AWS Cloud Quest application."
    h.  **Endpoint Type:** Regional (default)
    i.  Click **"Create API"**.

### 3.2. Create Resources and Methods:

#### a. `/questions` (GET) Resource:
    1.  With `AWSQuizAPI` selected, under **"Resources"**, click **"Actions"** dropdown and select **"Create Resource"**.
    2.  **Resource Name:** `questions` (Path will be `/questions`)
    3.  Click **"Create Resource"**.
    4.  With the `/questions` resource selected, click **"Actions"** and select **"Create Method"**.
    5.  From the dropdown under `/questions`, select **GET**. Click the checkmark.
    6.  **Integration type:** Lambda Function
    7.  **Use Lambda Proxy integration:** Check this box.
    8.  **Lambda Region:** Select your current region.
    9.  **Lambda Function:** Start typing `getAWSQuizQuestions` and select it from the list.
    10. Leave "Use Default Timeout" checked.
    11. Click **"Save"**. A dialog "Add Permission to Lambda Function" will appear. Click **"OK"**.

#### b. `/check-answer` (POST) Resource:
    1.  Select the root resource `/` under "Resources". Click **"Actions"** -> **"Create Resource"**.
    2.  **Resource Name:** `check-answer`
    3.  Click **"Create Resource"**.
    4.  With `/check-answer` selected, click **"Actions"** -> **"Create Method"**.
    5.  Select **POST**. Click the checkmark.
    6.  **Integration type:** Lambda Function, **Use Lambda Proxy integration:** Checked.
    7.  **Lambda Function:** `checkAWSQuizAnswer`
    8.  Click **"Save"**, then **"OK"** to grant permission.

#### c. `/scores` (POST) Resource:
    1.  Select the root resource `/` under "Resources". Click **"Actions"** -> **"Create Resource"**.
    2.  **Resource Name:** `scores`
    3.  Click **"Create Resource"**.
    4.  With `/scores` selected, click **"Actions"** -> **"Create Method"**.
    5.  Select **POST**. Click the checkmark.
    6.  **Integration type:** Lambda Function, **Use Lambda Proxy integration:** Checked.
    7.  **Lambda Function:** `storeAWSQuizScore`
    8.  Click **"Save"**, then **"OK"**.

### 3.3. Enable CORS for All Resources:
    Cross-Origin Resource Sharing (CORS) is necessary because your web page (on Amplify domain) will call this API (on API Gateway domain).
    a.  Select the `/questions` resource. Click **"Actions"** -> **"Enable CORS"**.
        * Ensure GET is listed. The default Access-Control-Allow-Origin should be `'*'` for simplicity in this project.
        * Click **"Enable CORS and replace existing CORS headers"**. Confirm if prompted.
    b.  Select the `/check-answer` resource. Click **"Actions"** -> **"Enable CORS"**.
        * Ensure POST is listed.
        * Click **"Enable CORS and replace existing CORS headers"**.
    c.  Select the `/scores` resource. Click **"Actions"** -> **"Enable CORS"**.
        * Ensure POST is listed.
        * Click **"Enable CORS and replace existing CORS headers"**.

    *Note: Enabling CORS adds an OPTIONS method to each resource automatically.*

### 3.4. Deploy the API:
    a.  Click **"Actions"** dropdown (at the top level of resources, or for any resource) and select **"Deploy API"**.
    b.  **Deployment stage:** Select "[New Stage]".
    c.  **Stage name:** `dev` (or `prod`, `v1`, etc.)
    d.  **Deployment description:** (Optional) "Initial deployment for quiz app."
    e.  Click **"Deploy"**.
    f.  After deployment, you'll be taken to the "Stages" editor. Note the **"Invoke URL"** displayed at the top (e.g., `https://abcdef123.execute-api.your-region.amazonaws.com/dev`).
        **COPY THIS INVOKE URL.** You will need it for your `script.js` file.

### 3.5. Test API Endpoints (Optional but Recommended using API Gateway Console):
    a.  In API Gateway, navigate to Resources.
    b.  Select the GET method under `/questions`. Click **"TEST"** in the "Method Execution" pane.
    c.  Scroll down and click the **"Test"** button. You should see the questions JSON in the "Response Body".
    d.  Select the POST method under `/check-answer`. Click **"TEST"**.
        * For **Request Body**, enter: `{"QuestionID": "Q1", "userAnswerIndex": 0}` (use a valid QuestionID).
        * Click **"Test"**. Check the response.
    e.  Similarly, test the POST method for `/scores` with a body like: `{"userName": "APITest", "score": 1, "totalQuestions": 5}`.

---

## Phase 4: Preparing the Frontend Files

1.  **Create Files:** On your computer, create three files in a new folder (e.g., `aws-cloud-quest-frontend`):
    * `index.html`
    * `style.css`
    * `script.js`
2.  **Copy Code:**
    * Open `index.html` in your text editor and paste the HTML code from the `` block.
    * Open `style.css` and paste the CSS code from ``.
    * Open `script.js` and paste the JavaScript code from ``.
3.  **IMPORTANT - Update API Endpoint in `script.js`:**
    * In `script.js`, find the line: `const API_BASE_URL = 'YOUR_API_GATEWAY_INVOKE_URL';`
    * Replace `YOUR_API_GATEWAY_INVOKE_URL` with the **Invoke URL** you copied after deploying your API Gateway (e.g., `https://abcdef123.execute-api.your-region.amazonaws.com/dev`). Ensure there are no trailing slashes in the `API_BASE_URL` variable itself, as the script appends resource paths.
    * Save `script.js`.
4.  **Create ZIP File:**
    * Select all three files (`index.html`, `style.css`, `script.js`).
    * Compress them into a single ZIP file. Name it something like `aws-cloud-quest-frontend.zip`.
        * On Windows: Right-click -> Send to -> Compressed (zipped) folder.
        * On macOS: Right-click -> Compress 3 Items.

---

## Phase 5: Deploying with AWS Amplify

### 5.1. Create an Amplify App:
    a.  Navigate to the **AWS Amplify** service.
    b.  Under "Host your web app", click **"Get started"** (or if you have existing apps, click **"New app"** -> **"Host web app"**).
    c.  **Choose your source:** Select "Deploy without a Git provider". Click **"Continue"**.
    d.  **App name:** `AWSCloudQuest`
    e.  **Environment name:** `dev` (or your preferred environment name)
    f.  **Method:** Drag and drop.
    g.  Drag your `aws-cloud-quest-frontend.zip` file onto the designated area, or click "Choose files" to upload it.
    h.  Click **"Save and deploy"**.

### 5.2. Access Your Live App:
    a.  Amplify will provision resources and deploy your app. This might take a few minutes.
    b.  Once deployment is complete, you'll see a domain URL (e.g., `https://dev.xxxxxxxxxxxxxx.amplifyapp.com`).
    c.  Click this URL to open your "AWS Cloud Quest" application in your browser!

---

## Phase 6: Testing and Final Touches

1.  **Test Thoroughly:**
    * Open your Amplify app URL.
    * Enter your name and start the quiz.
    * Answer questions, submit them.
    * Verify correct/incorrect feedback.
    * Check the final score screen.
    * Try playing again.
2.  **Check DynamoDB:** After playing, go to your `AWSQuizScores` table in DynamoDB and verify that your scores are being recorded.
3.  **Check CloudWatch Logs:** If you encounter issues (e.g., API calls failing, Lambda errors):
    * Go to **CloudWatch** service.
    * Under **"Logs"** -> **"Log groups"**.
    * Find log groups for your Lambda functions (e.g., `/aws/lambda/getAWSQuizQuestions`).
    * Examine the logs for error messages.
4.  **Browser Developer Tools:** Use your browser's developer tools (usually F12 key) to check:
    * **Console:** For JavaScript errors from `script.js`.
    * **Network tab:** To inspect API calls to API Gateway and their responses. Ensure the status codes are 200/201.

---

## Phase 7: Sharing Your Project & Portfolio Tips

1.  **Share the Link:** Your Amplify app URL is live and can be shared!
2.  **Portfolio Write-up:** When adding this to your portfolio or resume:
    * **Project Title:** AWS Cloud Quest - Serverless Quiz Application
    * **Description:** Briefly explain what the app does.
    * **Technologies Used:** List AWS Amplify, API Gateway, Lambda, DynamoDB, HTML, CSS, JavaScript, Python.
    * **Architecture:** Create a simple architecture diagram showing how the services connect (User -> Amplify -> API Gateway -> Lambda -> DynamoDB). You can use tools like diagrams.net (draw.io) for this.
    * **Key Features & Learnings:**
        * Serverless backend implementation.
        * REST API design and integration.
        * DynamoDB for NoSQL data storage.
        * Frontend development and API consumption.
        * IAM for secure permissions.
        * Deployment via AWS console.
        * (Mention any challenges you overcame or specific features you're proud of).
3.  **Blog Post/LinkedIn:**
    * Write a short blog post or LinkedIn article about your project.
    * Include screenshots and the architecture diagram.
    * Discuss your development process and what you learned. This shows initiative and communication skills.

---

Congratulations! You've built and deployed a serverless web application on AWS. This is a fantastic project to showcase your skills. Remember to always be mindful of the free tier limits and clean up resources if you no longer need them (though this project is designed to be very low-cost/free for portfolio use).
