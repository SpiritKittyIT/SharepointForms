import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'
import { Editor, RawDraftContentState } from 'react-draft-wysiwyg'
import { EditorState, ContentState } from 'draft-js'
import '../../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import './cardRichRwdStyles.css'
import htmlToDraft from 'html-to-draftjs'
import draftToHtml from 'draftjs-to-html'

interface ITextRichCard {
    id: string
    title: string
    displayMode: FormDisplayMode
    required: boolean
    itemHandle: IHandle<string>
    valueVerify?: (value: string) => string
}

const TextRichCard: React.FC<ITextRichCard> = ({id, title, displayMode, required, itemHandle, valueVerify = (value) => {return ''}}) => {
  const [errorMessage, setErrorMessage] = React.useState<string>("")
  const [editorState, setEditorState] = React.useState<EditorState>(EditorState.createEmpty())

  React.useEffect(() => {
    const contentBlock = htmlToDraft(itemHandle.value ? itemHandle.value : '')
    contentBlock.contentBlocks.shift()
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
      const editorState = EditorState.createWithContent(contentState)
      setEditorState(editorState)
    }
  }, [title])

  const onChange: (state: RawDraftContentState) => void  = (state) => {
    const val = draftToHtml(state)
    setErrorMessage(valueVerify(val))
    itemHandle.setValue(val)
  }

  const toolbarSettings = {
    options: ['inline', 'list', 'textAlign', 'colorPicker', 'link', 'image'],
    inline: {
      options: ['bold', 'italic', 'underline']
    },
    list: {
      options: ['unordered', 'ordered', 'indent', 'outdent']
    },
    link: {
      options: ['link']
    },
  }

  try {
    return displayMode === FormDisplayMode.Display ? (
      <div className='card-tall'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>
          {title}
        </label>
        <div id={id} className='card-input-d card-tall-display'>{itemHandle.value}</div>
      </div>
    )
    : (
      <div className='card-tall'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>
          {title}
        </label>
        <div id={id}>
          <Editor
            editorState={editorState}
            onEditorStateChange={(state) => {setEditorState(state)}}
            onContentStateChange={onChange}
            toolbar={toolbarSettings}
          />
        </div>
        {errorMessage && errorMessage !== '' ? <div className='card-error'>{errorMessage}</div> : <></>}
      </div>
    )
  }
  catch (error) {
    console.error(error)
    return (
      <div className='card card-error'>Sorry, something went wrong with this form card. This card can not be rendered properly.</div>
    )
  }
};

export default TextRichCard;
