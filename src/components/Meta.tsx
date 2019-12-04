import React from 'react';
import Helmet from 'react-helmet';
import changeCase from 'change-case';
import identity from 'lodash/fp/identity';

interface Props {
  title: string;
}

const brandName = changeCase.titleCase(process.env.REACT_APP_BRAND || '').trim();

const platformName = brandName ? `My${brandName}` : '';

const Meta: React.FC<Props> = ({ title }) => (
  <Helmet>
    <title>{[title, platformName].filter(identity).join(' | ')}</title>
  </Helmet>
);

export default Meta;
