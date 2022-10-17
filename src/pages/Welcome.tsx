import { PageContainer } from '@ant-design/pro-components';
import { Row } from 'antd';
import React from 'react';
import ShowImage from '@/components/ShowImage';

const Welcome: React.FC = () => {
  return (
    <PageContainer>
      <Row gutter={[16, 16]} wrap>
        <ShowImage type="front" />
        <ShowImage type="back" />
      </Row>
    </PageContainer>
  );
};
export default Welcome;
