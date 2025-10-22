import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

// Suppress Monaco editor errors related to DOM access after unmount
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('offsetNode') || 
       args[0].includes('monaco-editor') ||
       args[0].includes('_doHitTestWithCaretPositionFromPoint'))
    ) {
      // Suppress Monaco editor DOM access errors
      return;
    }
    originalError.apply(console, args);
  };
}

const CodeEditor = ({ 
  value, 
  onChange, 
  language = 'cpp', 
  height = '400px',
  readOnly = false,
  onRun,
  onSubmit,
  isRunning = false,
  isSubmitting = false,
  verdict = null,
  theme = 'vs-dark'
}) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Set a flag to prevent any async operations
      const editor = editorRef.current;
      editorRef.current = null;
      monacoRef.current = null;
      
      // Dispose editor after a small delay to let pending operations complete
      if (editor) {
        setTimeout(() => {
          try {
            editor.dispose();
          } catch (error) {
            // Ignore disposal errors
            console.debug('Editor disposal error (safe to ignore):', error.message);
          }
        }, 100);
      }
    };
  }, []);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: readOnly,
      cursorStyle: 'line',
      contextmenu: true,
      mouseWheelZoom: true,
      smoothScrolling: true,
    });

    // Add keyboard shortcuts
    try {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        if (onRun && editorRef.current) onRun();
      });
      
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
        if (onSubmit && editorRef.current) onSubmit();
      });
    } catch (error) {
      console.warn('Failed to add keyboard shortcuts:', error);
    }
  };
  
  const handleEditorWillUnmount = (editor) => {
    // Clean up before unmount
    try {
      if (editor) {
        editor.dispose();
      }
    } catch (error) {
      // Ignore disposal errors
    }
  };

  const getLanguageId = (lang) => {
    const languageMap = {
      'cpp': 'cpp',
      'python': 'python',
      'javascript': 'javascript',
      'java': 'java'
    };
    return languageMap[lang] || 'cpp';
  };

  const getVerdictColor = (verdict) => {
    if (!verdict) return '';
    switch (verdict.status) {
      case 'Accepted': return 'test-case-pass';
      case 'Wrong Answer': return 'test-case-fail';
      case 'Time Limit Exceeded': return 'test-case-pending';
      case 'Runtime Error': return 'test-case-fail';
      case 'Compilation Error': return 'test-case-fail';
      default: return 'test-case-pending';
    }
  };

  return (
    <div className="w-full">
      {/* Editor */}
      <div className="border border-slate-600 rounded-xl overflow-hidden">
        <Editor
          height={height}
          language={getLanguageId(language)}
          value={value}
          onChange={onChange}
          onMount={handleEditorDidMount}
          beforeUnmount={handleEditorWillUnmount}
          theme={theme}
          options={{
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: readOnly,
            cursorStyle: 'line',
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            contextmenu: true,
            mouseWheelZoom: true,
            smoothScrolling: true,
            fontFamily: 'JetBrains Mono, Consolas, monospace',
          }}
        />
      </div>

      {/* Verdict Display */}
      {verdict && (
        <div className={`mt-4 p-4 rounded-lg border ${getVerdictColor(verdict)}`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Status: {verdict.status}</span>
              {verdict.passed !== undefined && verdict.total !== undefined && (
                <span className="ml-2 text-sm">
                  ({verdict.passed}/{verdict.total} test cases passed)
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm">
              {verdict.execution_time && (
                <span>Time: {verdict.execution_time}</span>
              )}
              {verdict.memory && (
                <span>Memory: {verdict.memory}</span>
              )}
            </div>
          </div>
          {verdict.message && (
            <div className="mt-2 text-sm">
              {verdict.message}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {!readOnly && (
        <div className="mt-4">
          <div className="flex space-x-3">
            <button
              onClick={onRun}
              disabled={isRunning || isSubmitting}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
            <button
              onClick={onSubmit}
              disabled={isRunning || isSubmitting}
              className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <span className="mr-4">Ctrl+Enter: Run</span>
            <span>Ctrl+Shift+Enter: Submit</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;

