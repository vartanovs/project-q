/**
 * @module QuadsDisplay.tsx
 * @description Quads display component
 */

import * as React from 'react';

// Import Components
import Overview from '../components/Overview';
import StockGraph from './StockGraph';
import IssuesCharts from '../components/IssuesCharts';
import CompanyList from '../components/CompanyList';

const QuadsDisplay = (props: any) => {
  return (
    <React.Fragment>
      <Overview selected={props.selected} />
      <StockGraph selected={props.selected} stockData={props.stockData} />
      <IssuesCharts
        selectedCompany={props.selected}
        selectedData={props.selectedData}
        userIssues={props.issues}
      />
      <CompanyList
        companyList={props.list}
        getSelectedCompanyInfo={props.info}
        getStockData={props.stock}
        sortListBy={props.sort}
        selectCompany={props.select}
        selectedCompany={props.selected}
        userIssues={props.issues}
        issueAbbrvs={props.abbrvs}
      />
    </React.Fragment>
  );
};
export default QuadsDisplay;
