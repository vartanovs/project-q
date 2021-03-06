/**
 * @module SurveyContainer.tsx
 * @description Survey Question Container - User Onboarding
 */

import './Survey.css';

import * as React from 'react';
import { connect } from 'react-redux';

// Import Actions
import * as actions from '../../actions/actionCreators';

// Import Selector Functions
import { getQuestionIdList, getQuestionsObject, getOutstandingQuestionsCount, getPosition, getQuestionsList } from '../../reducers/surveyReducer';
import { getIssueName } from '../../reducers/issuesReducer';

// Import Componenets
import SurveyPage from './SurveyPage';
import SurveyQuestion from './SurveyQuestion';

// Import Types
import { IssueQuestionsState, SurveyState } from '../../reducers/types';
import ProgressBar from './ProgressBar';

const SurveyContainer = (props: any): any => {
  const {
    answerQuestion, submitSurvey, updateIssuePosition, updateIssuesSelected, prevPage,  // Actions
    issues, survey, user,                                                               // State
  } = props;

  const { issuesSelected, surveyPage, userId } = user;
  
  // Initialize array to hold user's selected issues
  const issuesSelectedArray: string[] = Object.keys(issuesSelected)
  const issuesCount: number = issuesSelectedArray.length;
  let currentIssueId: string = issuesSelectedArray[surveyPage];

  // Initialize survey array to hold survey questions
  let surveyArray: JSX.Element[] = [];

  // Generate progress bar
  const footerBar = <ProgressBar surveyPage={surveyPage} issuesCount={issuesCount} />

  // Short-circuit process if survey complete
  if (surveyPage === issuesCount) {
    // Assemble survey object
    const surveyObj = {
      issues: issuesSelected,
      userId: userId,
      questions: getQuestionsList(survey),
    };
    submitSurvey(surveyObj);

    return (
      <SurveyPage
        complete={true}
        footerBar={footerBar}
      />
    )
  }
  // Helper Function to populate survey
  const populateSurvey = (issueId: string): any => {
    // User function selecter to get survey questions from store for a given issue
    const questionsIdList: string[] = getQuestionIdList(survey, issueId);
    const questionsObject: IssueQuestionsState = getQuestionsObject(survey, issueId);

    // For each question, push a SurveyQuestion component into surveyArray
    questionsIdList.forEach((questionId: string) => {
      const questionAgree = questionsObject[questionId].agree;
      return surveyArray.push(
        <SurveyQuestion
          answerQuestion={answerQuestion}
          issueId={currentIssueId}
          key={questionId}
          questionId={questionId}
          questionAgree={questionAgree}
          questionText={questionsObject[questionId].questionText}
        />,
      );
    });
  };

  // Populate survey with current issue id
  populateSurvey(currentIssueId);

  // Helper function to update Issues if user clicks "Next Issue"
  const callUpdateIssue = () => {
    const position = getPosition(survey, currentIssueId);
    return updateIssuePosition(currentIssueId, position)
  }

  const headerText: string = getIssueName(issues, currentIssueId);

  // Helper function that generates left buttons
  const generateLeftButton = () => {
    if (!surveyPage) {
      return (
        <div className="dashboard-side-button" onClick={updateIssuesSelected}>
          {"< Back"}
        </div>
      )
    }
    return (
      <div className="dashboard-side-button" onClick={prevPage}>
        {"< Back"}
      </div>
    )
  }

  // Helper function that generates left buttons
  const generateRightButton = (issueId: string) => {
    // If there are outstanding questions, return invalid button
    if (getOutstandingQuestionsCount(survey, issueId)) {
      // If 1 or 2 questions answered, return clear button only
      return (
        <div className="dashboard-side-button invalid" >
          {"Next >"}
        </div>
      )
    }
    return (
      // If all 3 questions answered (0 outstanding questions) return active clear and submit buttons
      <div className="dashboard-side-button" onClick={() => callUpdateIssue()}>
        {"Next >"}
      </div>
    )
  }

  const leftButton = generateLeftButton();
  const rightButton = generateRightButton(currentIssueId);

  return (
    <SurveyPage
      complete={false}
      headerText={headerText}
      surveyArray={surveyArray}
      leftButton={leftButton}
      rightButton={rightButton}
      footerBar={footerBar}
    />
  )
};

const mapStateToProps = (store: any): any => ({
  issues: store.issues,
  user: store.user,
  survey: store.survey,
});

const mapDispatchToProps = (dispatch: any): any => ({
  answerQuestion: (event: any) => dispatch(actions.answerQuestion(event)),
  prevPage: () => dispatch(actions.prevPage()),
  submitSurvey: (surveyObj: SurveyState) => dispatch(actions.submitSurvey(surveyObj)),
  updateIssuePosition: (issueId: string, position: string) => dispatch(actions.updateIssuePosition(issueId, position)),
  updateIssuesSelected: () => dispatch(actions.updateIssuesSelected()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SurveyContainer);
