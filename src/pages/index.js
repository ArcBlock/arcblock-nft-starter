/* eslint-disable react/jsx-one-expression-per-line */
import React, { useContext } from 'react';
import useToggle from 'react-use/lib/useToggle';
import styled from 'styled-components';

import Typography from '@material-ui/core/Typography';
import Button from '@arcblock/ux/lib/Button';
import Auth from '@arcblock/did-react/lib/Auth';
import { SessionContext, PlaygroundAction } from '@arcblock/did-playground';

import Layout from '../components/layout';
import env from '../libs/env';

// 临时 demo 的页面
export default function MiniPage() {
  const { api, session } = useContext(SessionContext);
  const [isShowBuyCustomNFT, setShowBuyCustomNFT] = useToggle(false);
  const { token } = session;

  const buyCustomNFTSuccess = () => {};

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
              生成用于下面测试的两个账号
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
            Transfer NFT{' '}
            <Typography component="small" color="textSecondary">
              通过发送交易发送 NFT
            </Typography>
          </Typography>
          <div className="section__content">
            <PlaygroundAction
              className="action"
              title="获取一张门票"
              action="buy_local_ticket_with_local_token"
              payAmount={0}
              receiveAmount={1}
            />
          </div>
        </section>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            自定义 NFT{' '}
            <Typography component="small" color="textSecondary">
              自定义 NFT 样式
            </Typography>
          </Typography>
          <div className="section__content">
            <Button
              className="action"
              color="primary"
              size="large"
              variant="contained"
              onClick={() => setShowBuyCustomNFT()}>
              获取一张自定义的徽章
            </Button>
            {isShowBuyCustomNFT && (
              <Auth
                responsive
                action="exchange_assets"
                checkFn={api.get}
                onClose={() => setShowBuyCustomNFT()}
                onSuccess={buyCustomNFTSuccess}
                extraParams={{
                  isCustom: true,
                }}
                messages={{
                  title: '获取一个自定义的 NFT 徽章',
                  scan: '扫描下面二维码获取自定义的 NFT 徽章',
                  confirm: '请在钱包中确认',
                  success: '发送成功',
                }}
              />
            )}
          </div>
        </section>
        <section className="section">
          <Typography component="h3" variant="h5" className="section__header" color="textPrimary" gutterBottom>
            Atomic Swap NFT{' '}
            <Typography component="small" color="textSecondary">
              通过 Atomic Swap 的形式购买 NFT
            </Typography>
          </Typography>
          <div className="section__content">
            <PlaygroundAction
              action="buy_local_ticket_with_foreign_token"
              className="action"
              price={1}
              title="1 TBA 购买 1 张门票"
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
