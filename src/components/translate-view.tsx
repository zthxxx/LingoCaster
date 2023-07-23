import {
  memo,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  List,
} from '@raycast/api'
import {
  debounceTime,
  tap,
  map,
  skipWhile,
  switchMap,
  distinctUntilChanged,
  type Observable,
  BehaviorSubject,
} from 'rxjs'
import stringWidth from 'string-width'
import {
  type Result,
} from '../adapters'
import {
  type Translator,
} from '../workflow'
import {
  ActionContextPanel,
  ListItemActions,
  getDetailMarkdown,
} from '../components'

interface TranslateParams {
  selected?: string;
  translator: Translator;
}

export const TranslateView = memo((props: TranslateParams) => {
  const {
    selected,
    translator,
  } = props

  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const showingDetail = useShowingDetail$()

  const inputText$ = useInputText$({
    initInput: selected,
    pipeline: inputText$ => inputText$.pipe(
      debounceTime(300),
      map(text => text.trim().substring(0, 2000)),
      // distinctUntilChanged(),
      tap(text => {
        if (text) setLoading(true)
      }),
      switchMap(async text => {
        if (!text) return { query: '', results: [] }
        return {
          query: text,
          results: (text === '*')
            ? translator.getHistory()
            : await translator.translate(text),
        }
      }),
      tap(({ results }) => {
        setResults(results)
        setLoading(false)
      }),
      // update history
      debounceTime(1500),
      tap(({ query, results }) => {
        if (query && query !== '*') {
          translator.updateHistoryItem(query, results[0])
        }
      }),
    ),
  })

  const itemsMap = useMemo(
    () => new Map(results.map(item => [item.id, item])),
    [results],
  )

  return (
    <List
      isLoading={loading}
      searchText={inputText$.value}
      searchBarPlaceholder='Search for translate ...'
      isShowingDetail={showingDetail.value && !!results.length}
      onSearchTextChange={inputText$.next}
      onSelectionChange={id => {
        const item = itemsMap.get(id!)
        if (!item) return
        const width = stringWidth(item.title + item.subtitle)
        showingDetail.next(width >= maxLineChars)
      }}
    >
      <ViewResults results={results} />
      <List.EmptyView
        title={
          inputText$.value.trim()
            ? loading
              ? 'Loading from translate ...'
              : 'No results found'
            : 'Type words or sentences to translate'
        }
      />
    </List>
  )
})

const maxLineChars = 88

const useInputText$ = ({ initInput, pipeline }: {
  initInput?: string;
  pipeline: (inputText$: Observable<string>) => Observable<any>;
}): BehaviorSubject<string> & { next: (params: string) => void } => {
  const [, setInputText] = useState('')
  const inputText$ = useMemo(
    () => new BehaviorSubject((initInput ?? '').trim()),
    [initInput],
  )

  useEffect(() => {
    const subscription = pipeline(
      inputText$.pipe(
        skipWhile(text => !text),
        // bindings for react component render
        tap(text => setInputText(text)),
      ),
    ).subscribe()

    return () => subscription.unsubscribe()
  }, [initInput])

  inputText$.next = inputText$.next.bind(inputText$)
  return inputText$
}

const useShowingDetail$ = (): BehaviorSubject<boolean> => {
  const [, setShowingDetail] = useState(false)
  const showingDetail$ = useMemo(
    () => new BehaviorSubject(false),
    [],
  )

  useEffect(() => {
    const subscription = showingDetail$.pipe(
      distinctUntilChanged(),
      tap(setShowingDetail),
    ).subscribe()
    return () => subscription.unsubscribe()
  }, [])

  return showingDetail$
}

interface ViewResultsProps {
  results: Result[];
}

const ViewResults = memo((props: ViewResultsProps) => {
  const { results } = props

  return (
    <>
      {results.map((item) => (
        <List.Item
          key={item.id}
          id={item.id}
          icon={
            item.isPhonetic
              ? 'translate-say.png'
              : 'translate.png'
          }
          title={item.title}
          subtitle={item.subtitle}
          detail={
            <List.Item.Detail
              markdown={getDetailMarkdown(item)}
            />
          }
          actions={
            <ActionContextPanel
              item={item}
            >
              <ListItemActions />
            </ActionContextPanel>
          }
        />
      ))}
    </>
  )
})
