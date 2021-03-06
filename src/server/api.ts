/**
 * ************************************
 *
 * @module  Server.ts
 * @author Team Quail
 * @date 
 * @description Node Express Server to route fetch requests from the front end to appropriate end points 
 *
 * ************************************
 */

 // import express server api
import * as express from 'express';
// import express types for .ts functionality
import { Application, Request, Response } from 'express';
// import path for universal file locations
import * as path from 'path';
// import body-parser for getting req.body from front end posts
import * as bodyParser from 'body-parser';
// import cookie parser in order to set user cookies
import * as cookieParser from 'cookie-parser';
// import cors to enable cross-origin sharing between dev server and server
import * as cors from 'cors';
// import helmet to increase app security
import * as helmet from 'helmet';
// import authentication middleware
import UserMethods from './middleware/userMethods'
// import companyDb middleware
import CompanyDatabase from './middleware/companyDataMethods';
// import database middleware
import DatabaseMethods from './middleware/additionalDataMethods';
// import companyDb middleware
import Sessions from './middleware/sessionMethods';

// activate the express server
const app: Application = express();

// Allow CORS, credentials true expects  request to come with credentials and origin specifies where they should come from
app.use(cors({credentials: true, origin: 'http://localhost:8080'}));

//  protects from some well-known web vulnerabilities by setting HTTP headers appropriately.
app.use(helmet());

// tell express to use bodyparser to parse json files in req.body
// limit 10mb increases the amount of data which can be parsed by the server at once, this could have side effects 
// RESEARCH THIS*********************************************************************
// but was needed to submit all the company data, maybe remove if it substantially changes the way that bodyParser functions
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({ extended: true }));

// cookie initializer
app.use(cookieParser());

// end point for checking if user is returning with an active session
app.get('/api/auth',
Sessions.check,
UserMethods.getAccountInfo,
UserMethods.getIssues,
UserMethods.getQuestions,
(_: Request, res: Response) => {
  res.status(200).send(res.locals.user);
}
)

// registration end point
app.post('/api/register', 
UserMethods.createAccount,
Sessions.create,
(_: Request, res: Response) => {
  res.status(200).send(res.locals.user);
}
);

// login end point
app.post('/api/login', 
UserMethods.login,
Sessions.create,
UserMethods.getAccountInfo,
UserMethods.getIssues,
UserMethods.getQuestions,
(_: Request, res: Response) => {
  res.status(200).send(res.locals.user);
}
);

// route for logout which deletes sessions
app.post('/api/logout', 
Sessions.end,
(_: Request, res: Response) => {
  res.status(200).send(res.locals.user);
}
);

// login for resetting a users password
app.post('/api/forgot',
UserMethods.findByEmail,
Sessions.forgot,
(_: Request, res: Response) => {
  res.status(200).send(res.locals);
}
);

app.post('/api/reset',
Sessions.reset,
UserMethods.resetPassword,
(_: Request, res: Response) => {
  res.sendStatus(200);
}
);

// route for getting a list of issues for the front end
app.get('/api/getIssues',
DatabaseMethods.getIssues,
(_: Request, res: Response) => {
  res.status(200).send(res.locals.issues);
}
);

// route for storing user issues/
app.post('/api/userIssues',
UserMethods.addIssues,
UserMethods.getIssues,
UserMethods.updateIssuesComplete,
UserMethods.getAccountInfo,
UserMethods.getQuestions,
(_: Request, res: Response) => {
  // sending back user, issues, and question data in locals
  res.status(200).send(res.locals.user.questions);
}
);

// route for delivering user issues
//   UserMethods.getIssues,
//   (_: Request, res: Response) => {
  //     res.status(200).send(res.locals);
  //   }
  // );
  
  // route for storing user answers to questions
  app.post('/api/userSurvey',
  UserMethods.updateIssuePositons,
  UserMethods.updateUserSurvey,
  UserMethods.updateSurveyComplete,
  DatabaseMethods.getIssueAbbrvs,
  CompanyDatabase.getCompanyList,
  (_: Request, res: Response) => {
    if (res.locals.status === 500) {
      res.status(500).send('SERVER FAILURE');
    }
    else {
      res.status(200).send(res.locals.companyData);
    }
  }
  );
  
  // end point for deliverying a list of companies on dashboard render
  app.get('/api/companyList',
  DatabaseMethods.getIssueAbbrvs,
  CompanyDatabase.getCompanyList,
  (_: Request, res: Response) => {
    res.status(200).send(res.locals.companyData);
  }
  );
  
  app.get('/api/moduleData',
  CompanyDatabase.getCompanyModule,
  DatabaseMethods.getPoliticianData,
  (_: Request, res: Response) => {
    res.status(200).send(res.locals.modules);
  }
  );
  
  app.post('/api/companyModule',
  CompanyDatabase.getCompanyModuleData,
  DatabaseMethods.getSinglePoliticianData,
  CompanyDatabase.getStockData,
  (_: Request, res: Response) => {
    res.status(200).send(res.locals);
  }
  );
  
  app.post('/api/stockData',
  CompanyDatabase.getStockData,
  (_: Request, res: Response) => {
    res.status(200).send(res.locals);
  }
  );
  
  // App favicon redirect
  app.use('/favicon.ico', express.static(path.resolve(__dirname, '../client/assets/favicon.ico')));
  
  // server static files from dist directory
  app.use(express.static(path.resolve(__dirname, '../../dist')));
  
  // React Router Redirect to /index.html
  app.get('/*', (_: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../../dist/index.html'), (err: Error) => {
      if (err) {
        res.status(500).send(err)
      }
    });
  });

  module.exports = app;
  
  /* APPLICATION DATA SUBMISSION ROUTES
  ***********************************************************
  // end point for company data submission
  
  app.post('/companyData', 
  CompanyDatabase.insertData,
  (_: Request, res: Response) => {
    res.sendStatus(200);
  }
  );
***********************************************************
  // insert company issue scores

  app.post('/insertCompanyScores', 
  CompanyDatabase.insertIssueScores,
  (_: Request, res: Response) => {
    res.sendStatus(200);
    }
  );
***********************************************************
  // route to submit issue data
  
  app.post('/issueData', 
  DatabaseMethods.insertIssues,
  (_: Request, res: Response) => {
    res.sendStatus(200);
  });
***********************************************************
  // route to submit question data

  app.post('/questionData', 
  DatabaseMethods.insertQuestions,
  (_: Request, res: Response) => {
    res.sendStatus(200);
  });
***********************************************************
  // route to update company data  

app.post('/updateCompanyData',
    CompanyDatabase.updateData,
    (_: Request, res: Response) => {
    res.sendStatus(200);
    }
  );
***********************************************************
  // route to update politician data  

app.post('/politicianData',
  DatabaseMethods.insertPoliticianData,
  (_: Request, res: Response) => {
    res.sendStatus(200);
  }
);
***********************************************************
  // route to update stock data  

app.post('/politicianData',
  DatabaseMethods.insertPoliticianData,
  (_: Request, res: Response) => {
    res.sendStatus(200);
  }
);
***********************************************************
*/
