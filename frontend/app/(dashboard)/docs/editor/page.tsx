// app/(dashboard)/docs/editor/page.tsx
'use client'
import { useState } from 'react'
import { Save, Eye, Code, Type, Bold, Italic, List, Link as LinkIcon } from 'lucide-react'

export default function DocumentationEditorPage() {
  const [content, setContent] = useState('# Getting Started\n\nWelcome to AutoDocs! This is your documentation editor.')
  const [title, setTitle] = useState('Getting Started')
  const [preview, setPreview] = useState(false)

  const handleSave = () => {
    // Would call API to save document
    console.log('Saving document:', { title, content })
    alert('Document saved!')
  }

  const insertMarkdown = (syntax: string) => {
    const textarea = document.querySelector('textarea')
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    let newText = ''
    switch (syntax) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`
        break
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`
        break
      case 'heading':
        newText = `\n## ${selectedText || 'Heading'}\n`
        break
      case 'list':
        newText = `\n- ${selectedText || 'List item'}\n`
        break
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`
        break
    }
    
    const newContent = content.substring(0, start) + newText + content.substring(end)
    setContent(newContent)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Documentation Editor</h1>
          <p className="text-gray-400">Create and edit documentation</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            {preview ? <Code size={16} /> : <Eye size={16} />}
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg font-medium"
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document title"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-2xl font-semibold"
        />
      </div>

      {/* Toolbar */}
      {!preview && (
        <div className="bg-gray-800 border border-gray-700 rounded-t-lg p-4 flex gap-2">
          <button
            onClick={() => insertMarkdown('heading')}
            className="p-2 hover:bg-gray-700 rounded"
            title="Heading"
          >
            <Type size={18} />
          </button>
          <button
            onClick={() => insertMarkdown('bold')}
            className="p-2 hover:bg-gray-700 rounded"
            title="Bold"
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => insertMarkdown('italic')}
            className="p-2 hover:bg-gray-700 rounded"
            title="Italic"
          >
            <Italic size={18} />
          </button>
          <button
            onClick={() => insertMarkdown('list')}
            className="p-2 hover:bg-gray-700 rounded"
            title="List"
          >
            <List size={18} />
          </button>
          <button
            onClick={() => insertMarkdown('link')}
            className="p-2 hover:bg-gray-700 rounded"
            title="Link"
          >
            <LinkIcon size={18} />
          </button>
        </div>
      )}

      {/* Editor / Preview */}
      <div className="bg-gray-800 border border-gray-700 rounded-b-lg">
        {preview ? (
          <div className="p-8 prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-[600px] p-8 bg-transparent text-gray-100 font-mono resize-none focus:outline-none"
            placeholder="Write your documentation in Markdown..."
          />
        )}
      </div>

      {/* Tips */}
      <div className="mt-6 bg-blue-900 bg-opacity-20 border border-blue-500 rounded-lg p-4">
        <h3 className="font-semibold text-blue-300 mb-2">Markdown Tips</h3>
        <div className="text-sm text-blue-200 space-y-1">
          <p>• Use # for headings (# H1, ## H2, ### H3)</p>
          <p>• **bold** for bold text, *italic* for italic</p>
          <p>• - for bullet lists, 1. for numbered lists</p>
          <p>• [text](url) for links, ![alt](url) for images</p>
          <p>• ``` for code blocks</p>
        </div>
      </div>
    </div>
  )
}

// Simple markdown renderer (in production, use a library like react-markdown)
function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-teal-400 hover:underline">$1</a>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, '<p>$1</p>')
}
