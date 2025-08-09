/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import SEOMeta from '../../components/SEOMeta';
import { pageSEO } from '../../config/seo.config';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';
import { useTranslation } from '../../context/TranslationContext';
import FlagCreator from './FlagCreator';

 

const ThongThaiPage: React.FC = () => {
  const tool = getToolByRoute('/thong-thai');
  const { t } = useTranslation();
  const title = t('thongThai.title', 'Thong Thai Flag Creator');
  const description = t('thongThai.description', 'Create, animate, and export the Thai national flag.');
  return (
    <>
      <SEOMeta seo={pageSEO.thongThai} path="/thong-thai" />
      <ToolLayout tool={tool!} title={title} description={description}>
      <FlagCreator />
      </ToolLayout>
    </>
  );
};

export default ThongThaiPage;
