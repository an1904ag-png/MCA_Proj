# Ledger — Personal Finance Tracker

A finance tracker with login, a live database, and charts. Built with React, Firebase, and Chart.js. No local installs required to build or run it, everything below runs in the browser or on free cloud services.

## What it actually does

- Each user creates an account with email and password (Firebase Authentication).
- Every income or expense entry gets saved to Firestore, Google's cloud database, tagged with that user's ID.
- A pie chart shows spending by category. A bar chart shows income minus expenses by month.
- Data updates in real time. Open the app on your phone and laptop at once, add an entry on one, and watch it appear on the other without refreshing.
- Security rules stop any user from reading or editing another user's data, even if they know the database structure.

This is a real, working app connected to a real database. Nothing here is mocked or hardcoded.

## Part 1: Create your Firebase project (10 minutes)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and sign in with any Google account.
2. Click **Add project**, name it something like `ledger-vgu`, and skip Google Analytics (you don't need it).
3. Once the project loads, click the **</>** (web) icon to register a web app. Name it anything.
4. Firebase shows you a config object with keys like `apiKey`, `authDomain`, `projectId`. Keep this tab open, you'll need these values in Part 3.
5. In the left sidebar, go to **Build → Authentication**. Click **Get started**, then enable the **Email/Password** provider.
6. Go to **Build → Firestore Database**. Click **Create database**, choose a location close to India (e.g. `asia-south1`), and start in **production mode**.
7. Once created, go to the **Rules** tab of Firestore and paste in the contents of `firestore.rules` from this project. Click **Publish**. This is what stops other students from reading your financial data if they inspect the app.

## Part 2: Run it in CodeSandbox (no downloads)

1. Go to [codesandbox.io](https://codesandbox.io) and create a new sandbox, choosing **Import from GitHub** if you've pushed this project there, or **Vite + React** as a blank template and drag these files in.
2. In CodeSandbox's file panel, create a `.env` file (copy `.env.example`) and paste in your Firebase config values from Part 1, step 4.
3. CodeSandbox installs dependencies and starts the dev server automatically. You'll get a live preview URL immediately.

## Part 3: Run it locally instead, if you prefer

```bash
npm install
cp .env.example .env
# paste your Firebase config values into .env
npm run dev
```

Open the printed `localhost` URL. This also works if you push the project to GitHub first and clone it later.

## Part 4: Deploy it for real, with a real link

1. Push this project to a new GitHub repository.
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, and click **Add New Project**. Select your repo.
3. In the **Environment Variables** section of the Vercel import screen, add the same six `VITE_FIREBASE_*` values from your `.env` file.
4. Click **Deploy**. In under a minute you get a live `https://your-app.vercel.app` link. This is the link you put in your project report and open during your viva, not a localhost screenshot.
5. In the Firebase Console, go to **Authentication → Settings → Authorized domains** and add your new Vercel domain, otherwise login will silently fail on the live site.

## Using real data instead of a demo

Your examiner will ask if the data is real. Here's how to make sure it actually is:

- **Log your own money for at least two to three weeks before your submission**, not the night before. Every tea you buy, every recharge, your mess fees, your rent share. This gives your charts a genuine shape instead of a flat, obviously fake pattern like ₹500 every single day.
- **Get a friend or family member to use it too.** A second real account with independent data makes it obvious during the viva that the login and data isolation genuinely work, not just for one hardcoded user.
- **If you want more history without waiting weeks**, open your bank's app, export your last two months of transactions as a statement, and manually enter the real ones (real amounts, real dates, real categories) into the app over a single sitting. That's still real data, you're just backfilling it instead of typing it live.
- **Never hand-edit Firestore documents to fake a nicer looking chart.** If the examiner asks you to add a live entry during evaluation and the chart doesn't update, that's an instant red flag that something was staged.

## Project structure

```
src/
  firebase.js              Firebase app, auth, and Firestore setup
  context/AuthContext.jsx  Login state shared across the whole app
  components/
    Login.jsx               Sign in / sign up form
    Navbar.jsx               Top bar with logout
    Dashboard.jsx            Balance, income, expense summary cards
    TransactionForm.jsx      Add income/expense entries
    TransactionList.jsx      Ledger-style table with delete
    Charts.jsx                Pie chart + monthly bar chart
  utils/helpers.js          Formatting and chart data calculations
firestore.rules            Database security rules (deploy via Firebase Console)
```

## For your project report

Things worth writing up, since examiners specifically ask about these:

- **System architecture**: React frontend talking directly to Firebase (no custom backend server needed). Explain that Firestore replaces a traditional REST API and SQL database.
- **Database design**: one Firestore collection, `transactions`, with fields `uid`, `type`, `amount`, `category`, `date`, `note`, `createdAt`. Explain why NoSQL made sense here (no joins needed, one document per transaction).
- **Authentication flow**: describe Firebase's `onAuthStateChanged` listener and how it keeps a user logged in across page refreshes.
- **Security**: explain the Firestore rules file line by line, this is genuinely one of the more technical parts of the project and shows you understand access control, not just UI building.
