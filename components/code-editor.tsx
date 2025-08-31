'use client';

import { useEffect, useRef, useState } from 'react';
import { useCollaborationStore } from '@/lib/collaboration-store';
import { getLanguageConfig } from '@/lib/languages';

export function CodeEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { code, language, setCode, users, currentUser } = useCollaborationStore();

  useEffect(() => {
    let mounted = true;

    const initializeEditor = async () => {
      try {
        // Dynamic import of Monaco Editor
        const monaco = await import('monaco-editor');
        
        if (!mounted || !editorRef.current) return;

        // Configure Monaco Environment for web workers
        if (typeof window !== 'undefined') {
          (window as any).MonacoEnvironment = {
            getWorker: function (workerId: string, label: string) {
              const getWorkerModule = (moduleUrl: string, label: string) => {
                return new Worker(
                  new URL(moduleUrl, import.meta.url),
                  {
                    name: label,
                    type: 'module',
                  }
                );
              };

              switch (label) {
                case 'json':
                  return getWorkerModule('/monaco-editor/esm/vs/language/json/json.worker.js', label);
                case 'css':
                case 'scss':
                case 'less':
                  return getWorkerModule('/monaco-editor/esm/vs/language/css/css.worker.js', label);
                case 'html':
                case 'handlebars':
                case 'razor':
                  return getWorkerModule('/monaco-editor/esm/vs/language/html/html.worker.js', label);
                case 'typescript':
                case 'javascript':
                  return getWorkerModule('/monaco-editor/esm/vs/language/typescript/ts.worker.js', label);
                default:
                  return getWorkerModule('/monaco-editor/esm/vs/editor/editor.worker.js', label);
              }
            }
          };
        }

        // Initialize Monaco Editor
        editorInstance.current = monaco.editor.create(editorRef.current, {
          value: code,
          language: language,
          theme: 'vs-dark',
          fontSize: 14,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'on',
          lineNumbers: 'on',
          renderWhitespace: 'selection',
          contextmenu: true,
          mouseWheelZoom: true,
          smoothScrolling: true,
          cursorBlinking: 'blink',
          cursorSmoothCaretAnimation: 'on',
          renderLineHighlight: 'gutter',
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          acceptSuggestionOnEnter: 'on',
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          parameterHints: { enabled: true },
          formatOnPaste: true,
          formatOnType: true,
        });

        // Listen for content changes
        editorInstance.current.onDidChangeModelContent(() => {
          const newValue = editorInstance.current?.getValue() || '';
          setCode(newValue);
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize Monaco Editor:', error);
        setIsLoading(false);
      }
    };

    initializeEditor();

    return () => {
      mounted = false;
      if (editorInstance.current) {
        editorInstance.current.dispose();
        editorInstance.current = null;
      }
    };
  }, []);

  // Update editor language when changed
  useEffect(() => {
    if (editorInstance.current) {
      const model = editorInstance.current.getModel();
      if (model) {
        const monaco = require('monaco-editor');
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  // Update editor content when code changes from external source
  useEffect(() => {
    if (editorInstance.current && editorInstance.current.getValue() !== code) {
      editorInstance.current.setValue(code);
    }
  }, [code]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        <div ref={editorRef} className="absolute inset-0" />
        
        {/* User cursors overlay */}
        <div className="absolute top-2 right-2 flex gap-2">
          {users
            .filter(user => user.id !== currentUser?.id)
            .slice(0, 3)
            .map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm px-2 py-1 rounded text-xs"
                style={{ color: user.color }}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                {user.username}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}