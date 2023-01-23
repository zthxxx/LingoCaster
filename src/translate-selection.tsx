import { useEffect, useState } from 'react'
import {
  List,
  type LaunchProps,
  getSelectedText,
  Clipboard,
} from '@raycast/api'
import { View } from './translate'


export const ViewWithSection = (props: LaunchProps) => {
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    getSelectedText()
      .then(text => setSelected(text.trim()))
      .catch(async () => {
        const text = await Clipboard.readText()
        setSelected(text?.trim() ?? '')
      })
  }, [])

  if (selected === null) {
    return (
      <List
        searchBarPlaceholder=''
        isLoading
      >
        <List.EmptyView
          title='Loading from selection or clipboard...'
        />
      </List>
    )
  }

  return (
    <View
      {...props}
      arguments={{ queryText: selected }}
    />
  )
}

export default ViewWithSection
