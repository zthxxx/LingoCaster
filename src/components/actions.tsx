import {
  memo,
  type ReactNode,
  useContext,
  createContext,
} from 'react'
import {
  Action,
  ActionPanel,
  closeMainWindow,
  Icon,
  Detail,
  type Keyboard,
} from '@raycast/api'
import dedent from 'dedent'
import {
  type Result,
} from '../adapters'
import {
  speakSay,
} from '../utils'

const actionContext = createContext<{
  item: Result;
}>({
  item: null as any as Result,
})

export const ActionContextPanel = memo((props: {
  item: Result;
  children: ReactNode;
}) => {
  const { item, children } = props

  return (
    <actionContext.Provider value={{ item }}>
      <ActionPanel>
        {children}
      </ActionPanel>
    </actionContext.Provider>
  )
})

export const CopyToClipboardAction = memo((props: {
  shortcut?: Keyboard.Shortcut;
}) => {
  const { shortcut } = props
  const { item } = useContext(actionContext)

  return (
    <Action.CopyToClipboard
      shortcut={shortcut}
      content={item.clipboard}
    />
  )
})

export const PlayTextAction = memo((props: {
  shortcut?: Keyboard.Shortcut;
}) => {
  const { shortcut } = props
  const { item } = useContext(actionContext)

  return (
    <Action
      shortcut={shortcut}
      title='Play Text'
      icon={Icon.SpeakerHigh}
      onAction={() => speakSay(item.pronounce)}
    />
  )
})

export const ShowMoreDetailAction = memo(() => {
  const { item } = useContext(actionContext)
  return (
    <Action.Push
      shortcut={{ modifiers: ['cmd'], key: 'm' }}
      title='Show More Details'
      icon={Icon.Eye}
      target={
        <Detail
          markdown={getDetailMarkdown(item)}
          actions={
            <ActionContextPanel
              item={item}
            >
              <ItemDetailActions />
            </ActionContextPanel>
          }
        />
      }
    />
  )
})

export const ItemDetailActions = memo(() => {
  const { item } = useContext(actionContext)

  return (
    <>
      {item.isPhonetic
        ? (
          <>
            <PlayTextAction />
            <CopyToClipboardAction />
          </>
        )
        : (
          <>
            <CopyToClipboardAction />
            <PlayTextAction />
          </>
        )
      }
      <QuickLookAction />
    </>
  )
})

export const ListItemActions = memo(() => {
  const { item } = useContext(actionContext)

  return (
    <>
      {item.isPhonetic
        ? (
          <>
            <PlayTextAction />
            <CopyToClipboardAction />
          </>
        )
        : (
          <>
            <CopyToClipboardAction />
            <PlayTextAction />
          </>
        )
      }

      <ShowMoreDetailAction />
      <QuickLookAction />
      <CloseWindowAction />
    </>
  )
})

export const QuickLookAction = memo(() => {
  const { item } = useContext(actionContext)
  if (!item.quicklookUrl) return null

  return (
    <Action.OpenInBrowser
      shortcut={{ modifiers: ['shift'], key: 'enter' }}
      title='Look in Browser'
      url={item.quicklookUrl}
    />
  )
})

export const CloseWindowAction = memo(() => (
  <Action
    shortcut={{ modifiers: [], key: 'escape' }}
    title='Close'
    icon={Icon.XMarkCircle}
    onAction={() => closeMainWindow()}
  />
))


export const getDetailMarkdown = (item: Result): string => {
  return dedent`
    **${item.title}**

    ---

    ${item.subtitle}
  `
}
