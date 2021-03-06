/**
 * @module IssuesCharts.tsx
 * @description User Issues By Company Component
 */

import * as React from 'react';
import { Component } from 'react';

// Import IssueID -> IssueName table for conversion
import * as issueMatch from '../issueMatcher';

// Import Components
import IssuePie from './IssuePie';
import Recipients from './Recipients';

// TODO: move this props in types.ts and export in
interface Props {
  moduleData?: any;
  politData?: any;
  selectedCompany: any;
  selectedData: any;
  userIssues: any;
  displayDetail?: any;
}

// TODO transition component state to redux
class IssuesCharts extends Component<Props> {
  state: any;
  constructor(props: any) {
    super(props);

    this.state = {
      pieIndex: 0,
      displayDetail: false
    };

    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  handleMouseEnter(index: any) {
    this.setState({ pieIndex: index, displayDetail: true });
  }

  handleMouseLeave() {
    this.setState({ displayDetail: false });
  }

  render() {
    const { moduleData, politData } = this.props.selectedData;
    const { selectedCompany, userIssues } = this.props;
    const { issueMatcher } = issueMatch;

    let msg, display: JSX.Element[];

    const userIssuesArray = Object.keys(userIssues).map((issueID: any) => {
      return {
        name: issueMatcher[issueID]
      };
    });

    while (userIssuesArray.length !== 6) {
      userIssuesArray.push({ name: 'No Issue Selected' });
    }

    if (selectedCompany) {
      msg = 'Hover over charts below for detailed descriptions';

      display = userIssuesArray.map((issueObj: any, index: number) => {
        const { name } = issueObj;
        if (name !== 'No Issue Selected') {
          const { logo } = selectedCompany;
          const { alignedScore } = selectedCompany[name];
          const issueInfo = { name, alignedScore };
          const detailedView =
            this.state.displayDetail && this.state.pieIndex === index;
          return (
            <IssuePie
              key={index}
              logo={logo}
              info={issueInfo}
              modal={moduleData}
              polit={politData}
              detailedView={detailedView}
              handleMouseEnter={() => this.handleMouseEnter(index)}
              handleMouseLeave={() => this.handleMouseLeave()}
            />
          );
        } else {
          const issueInfo = { name };
          return <IssuePie key={index} info={issueInfo} />;
        }
      });
    } else {
      msg = 'Select a company to view their issues scores';

      display = userIssuesArray.map((issueObj: any, i: number) => {
        const { name } = issueObj;
        const issueInfo = { name };

        return <IssuePie key={i} info={issueInfo} />;
      });
    }

    return (
      <div className="quad" id="quad-issues">
        <div className="issues-container">
          <p id="issues-header">{msg}</p>
          {display}
        </div>
        <Recipients data={politData} />
      </div>
    );
  }
}

export default IssuesCharts;
