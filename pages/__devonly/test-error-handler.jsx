import { TestErrorHandler } from '@components/TestErrorHandler';

const TestErrorHandlerPage = () => {
  return <TestErrorHandler />;
};

// Hide header and footer for cleaner testing
TestErrorHandlerPage.hideHeader = true;
TestErrorHandlerPage.hideFooter = true;

export default TestErrorHandlerPage;
