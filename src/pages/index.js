/* eslint-disable react/jsx-one-expression-per-line */
import React, { useContext } from 'react';
import styled from 'styled-components';

import Typography from '@material-ui/core/Typography';
import { SessionContext, PlaygroundAction } from '@arcblock/did-playground';

import Layout from '../components/layout';
import env from '../libs/env';

// 临时 demo 的页面
export default function MiniPage() {
  const { session } = useContext(SessionContext);
  const { token } = session;

  return (
    <Layout title="Home">
      <Main>
        <Typography component="h2" variant="h5" className="page-header" color="textPrimary">
          {env.appName}
        </Typography>
        <Typography component="h3" variant="subtitle1" color="textSecondary">
          {token.local.symbol} is the token on Local Chain, {token.foreign.symbol} is the token on Foreign Chain.
        </Typography>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Feeling lucky{' '}
            <Typography component="small" color="textSecondary">
              Get your account funded for doing later testing
            </Typography>
          </Typography>
          <div className="section__content">
            <PlaygroundAction
              action="receive_foreign_token"
              className="action"
              buttonVariant="contained"
              amount={10}
              title={`Get 10 ${token.foreign.symbol}`}
            />
            <PlaygroundAction
              action="receive_local_token"
              className="action"
              amount={400}
              title={`Get 400 ${token.local.symbol}`}
            />
          </div>
        </section>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Atomic Swap Scenarios{' '}
            <Typography component="small" color="textSecondary">
              Show the full potential of cross-chain transactions.
            </Typography>
          </Typography>
          <div className="section__content">
            <PlaygroundAction
              action="exchange_to_foreign_token"
              title="Exchange Currency"
              className="action"
              buttonVariant="contained"
              buttonText={`Buy 1 ${token.foreign.symbol} with 195.8 ${token.local.symbol}`}
              exchangeRate={195.8}
            />
            <PlaygroundAction
              action="exchange_to_local_token"
              title="Exchange Currency"
              className="action"
              buttonVariant="contained"
              buttonText={`Sell 1 ${token.foreign.symbol} for 195.8 ${token.local.symbol}`}
              exchangeRate={195.8}
            />
          </div>
        </section>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Transfer Scenarios{' '}
            <Typography component="small" color="textSecondary">
              Help to generate different transfer transactions in ABT Wallet
            </Typography>
          </Typography>
          <div className="section__content">
            <PlaygroundAction
              action="send_foreign_token"
              className="action"
              buttonVariant="contained"
              amount={0.1}
              title={`Send 0.1 ${token.foreign.symbol}`}
            />
            <PlaygroundAction
              action="send_local_token"
              className="action"
              buttonVariant="contained"
              amount={10}
              title={`Send 10 ${token.local.symbol}`}
            />
          </div>
        </section>
      </Main>
    </Layout>
  );
}

const Main = styled.main`
  margin: 40px 0 0;

  a {
    color: ${props => props.theme.colors.green};
    text-decoration: none;
  }

  .page-header {
    margin-bottom: 20px;
  }

  .page-description {
    margin-bottom: 30px;
  }

  .section {
    margin-top: 48px;
    .section__header {
      margin-bottom: 24px;
    }

    .section__content {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      align-items: flex-start;

      .action {
        margin-bottom: 16px;
        margin-right: 32px;
        width: 360px;
        display: block;
      }
    }
  }
`;
