import React from 'react';
import PropTypes from 'prop-types';

const CodePreview = ({ code, language }) => {
  return (
    <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto border border-gray-200">
      <code className={`font-mono language-${language.toLowerCase()}`}>
        {code}
      </code>
    </pre>
  );
};

CodePreview.propTypes = {
  code: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired
};

export default CodePreview; 